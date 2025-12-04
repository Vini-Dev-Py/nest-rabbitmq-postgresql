# NestJS Logs API with PostgreSQL and RabbitMQ

Backend application built with NestJS and TypeScript using PostgreSQL with TypeORM as the database, RabbitMQ for messaging, and Docker/Docker Compose for orchestration. The project follows DDD and Clean Architecture patterns.

## Architecture

The project is structured following Domain-Driven Design (DDD) and Clean Architecture principles:

```
src/
├── domain/                    # Domain layer
│   ├── entities/             # Business entities
│   └── repositories/         # Repository interfaces
├── application/              # Application layer
│   ├── dtos/                # Data Transfer Objects
│   └── use-cases/           # Business use cases
└── infrastructure/          # Infrastructure layer
    ├── database/postgresql/  # PostgreSQL + TypeORM implementation
    ├── messaging/rabbitmq/  # RabbitMQ implementation
    └── http/                # HTTP controllers
```

## Features

- **Log Management**: Create and retrieve logs with different levels (DEBUG, INFO, WARN, ERROR)
- **TypeORM Integration**: Automatic schema synchronization and type-safe queries
- **Async Processing**: Logs can be sent asynchronously via RabbitMQ
- **Horizontal Scaling**: Built-in support for multiple instances with Nginx load balancing
- **Clean Architecture**: Clear separation between domain, application, and infrastructure layers
- **Date-Based Queries**: Efficient log retrieval filtered by date and log level
- **Health Checks**: Monitoring endpoints for database and messaging services

## Horizontal Scaling

The application is designed for horizontal scaling to handle high-traffic scenarios. It uses Nginx as a load balancer to distribute requests across multiple backend instances.

### Architecture

```
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │    Nginx    │
                │   Port 80   │
                └──────┬──────┘
                       │ (Load Balancer)
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │  App    │    │  App    │   │  App    │
   │Instance │    │Instance │   │Instance │
   │   #1    │    │   #2    │   │   #3    │
   └────┬────┘    └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │PostgreSQL│    │RabbitMQ│    │  Logs   │
   └──────────┘    └─────────┘    └─────────┘
```

### Default Configuration

By default, the docker-compose configuration launches **3 app instances** behind Nginx:

```bash
docker compose up -d --build
```

Access the API through the load balancer: **http://localhost**

### Custom Scaling

You can scale the application to any number of instances:

```bash
# Scale to 5 instances
docker compose up -d --scale app=5

# Scale to 10 instances
docker compose up -d --scale app=10
```

### Production Scaling

For production environments, use the `docker-compose.scale.yml` override file with optimized resource limits:

```bash
docker compose -f docker-compose.yml -f docker-compose.scale.yml up -d --build
```

This configuration:

- Scales to 5 instances by default
- Sets CPU and memory limits
- Configures restart policies

### Load Balancing Strategy

- **Algorithm**: Least Connections (distributes to instance with fewest active connections)
- **Health Checks**: Nginx monitors `/health` endpoint and removes unhealthy instances
- **Fair Distribution**: RabbitMQ uses prefetch=1 for equal message distribution

### Monitoring

Check system health:

```bash
# Check load balancer health
curl http://localhost/nginx-health

# Check application health
curl http://localhost/health

# View logs from all instances
docker compose logs app --follow
```

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm

## Getting Started

### Using Docker Compose (Recommended)

1. Build and start all services:

```bash
docker compose up -d --build
```

This will start:

- Nginx Load Balancer on port 80
- 3 NestJS application instances (internal, accessed through Nginx)
- PostgreSQL on port 5432
- RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)

2. Access the services:

- **API**: http://localhost (through Nginx load balancer)
- **API Health Check**: http://localhost/health
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Start PostgreSQL and RabbitMQ (using Docker):

```bash
docker compose up -d postgres rabbitmq
```

4. Run the application:

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Create Log (Synchronous)

```bash
POST /logs
Content-Type: application/json

{
  "level": "INFO",
  "message": "Application started",
  "context": "Main",
  "metadata": {
    "version": "1.0.0"
  }
}
```

### Create Log (Asynchronous via RabbitMQ)

```bash
POST /logs/async
Content-Type: application/json

{
  "level": "ERROR",
  "message": "Database connection failed",
  "context": "DatabaseModule",
  "metadata": {
    "errorCode": 500
  }
}
```

### Get Logs by Date

```bash
# Get logs for today
GET /logs

# Get logs for a specific date
GET /logs?date=2024-01-15
GET /logs/2024-01-15
```

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Environment Variables

| Variable     | Description             | Default               |
| ------------ | ----------------------- | --------------------- |
| DB_HOST      | PostgreSQL host         | localhost             |
| DB_PORT      | PostgreSQL port         | 5432                  |
| DB_NAME      | Database name           | logs_db               |
| DB_USER      | Database user           | postgres              |
| DB_PASSWORD  | Database password       | postgres              |
| RABBITMQ_URL | RabbitMQ connection URL | amqp://localhost:5672 |
| PORT         | Application port        | 3000                  |

## Project Structure

- **Domain Layer**: Contains business entities (`Log`), value objects, and repository interfaces
- **Application Layer**: Contains use cases (`CreateLogUseCase`, `GetLogsByDateUseCase`) and DTOs
- **Infrastructure Layer**: Contains implementations for PostgreSQL, RabbitMQ, and HTTP controllers

## Database Schema

The logs are stored in PostgreSQL with the following structure:

```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  context VARCHAR(100) DEFAULT 'default',
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_level ON logs(level);
```

TypeORM automatically creates and synchronizes this schema on application startup (development only).

## Technologies

- [NestJS](https://nestjs.com/) - Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [TypeORM](https://typeorm.io/) - ORM for TypeScript
- [RabbitMQ](https://www.rabbitmq.com/) - Message broker
- [Docker](https://www.docker.com/) - Containerization
- [Jest](https://jestjs.io/) - Testing framework

## License

This project is [MIT licensed](LICENSE).
