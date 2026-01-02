const http = require('http');

// Configuration
const CONFIG = {
  host: 'localhost',
  port: 80, // Accessing via Nginx
  totalRequests: 200_000,
  concurrency: 500,
  endpoints: {
    sync: '/logs',
    async: '/logs/async',
  },
};

const stats = {
  completed: 0,
  success: 0,
  failed: 0,
  avgTime: 0,
  totalTime: 0,
};

function makeRequest(id, endpoint, method = 'POST') {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      level: 'INFO',
      message: `Stress test log ${id}`,
      context: 'stress-tester',
    });

    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 300;
        resolve({
          id,
          success,
          duration,
          statusCode: res.statusCode,
          errorBody: data,
          containerId: res.headers['x-container-id'],
          payload: postData,
        });
      });
    });

    req.on('error', (e) => {
      const duration = Date.now() - startTime;
      resolve({
        id,
        success: false,
        duration,
        error: e.message,
        payload: postData,
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runBatch(startId, size) {
  const promises = [];
  for (let i = 0; i < size; i++) {
    const id = startId + i;
    // Mix 50/50 sync and async
    const endpoint =
      id % 2 === 0 ? CONFIG.endpoints.sync : CONFIG.endpoints.async;
    promises.push(makeRequest(id, endpoint));
  }
  return Promise.all(promises);
}

async function runStressTest() {
  console.log(`Starting stress test against ${CONFIG.host}:${CONFIG.port}`);
  console.log(`Total Requests: ${CONFIG.totalRequests}`);
  console.log(`Concurrency: ${CONFIG.concurrency}`);
  console.log('--------------------------------------------------');

  const startTime = Date.now();

  for (let i = 0; i < CONFIG.totalRequests; i += CONFIG.concurrency) {
    const batchSize = Math.min(CONFIG.concurrency, CONFIG.totalRequests - i);
    const results = await runBatch(i, batchSize);

    results.forEach((r) => {
      stats.completed++;
      if (r.success) {
        stats.success++;
      } else {
        stats.failed++;
        console.error(`--------------------------------------------------`);
        console.error(`Request ${r.id} FAILED`);
        console.error(`Status: ${r.statusCode || 'N/A'}`);
        console.error(
          `Container: ${r.containerId || 'Unknown (Nginx/Network)'}`,
        );
        console.error(`Error: ${r.error || r.errorBody || 'Unknown Error'}`);
        console.error(`Payload: ${r.payload}`);
        console.error(`--------------------------------------------------`);
      }
      stats.totalTime += r.duration;
    });

    process.stdout.write(
      `\rProgress: ${stats.completed}/${CONFIG.totalRequests} | Success: ${stats.success} | Failed: ${stats.failed}`,
    );
  }

  const totalDuration = (Date.now() - startTime) / 1000;
  stats.avgTime = stats.totalTime / stats.completed;

  console.log('\n\n--------------------------------------------------');
  console.log('Stress Test Completed');
  console.log(`Total Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`Total Requests: ${stats.completed}`);
  console.log(`Successful: ${stats.success}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Average Latency: ${stats.avgTime.toFixed(2)}ms`); // Latency per request
  console.log(
    `Throughput: ${(stats.completed / totalDuration).toFixed(2)} req/s`,
  );
  console.log('--------------------------------------------------');
}

runStressTest();
