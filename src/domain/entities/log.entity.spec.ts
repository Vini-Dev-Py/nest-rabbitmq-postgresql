import { Log, LogLevel, LogProps } from './log.entity';

describe('Log Entity', () => {
  const createValidLogProps = (): LogProps => ({
    level: LogLevel.INFO,
    message: 'Test message',
    context: 'TestContext',
    metadata: { key: 'value' },
  });

  describe('constructor', () => {
    it('should create a log with all properties', () => {
      const props = createValidLogProps();
      const log = new Log(props);

      expect(log.level).toBe(LogLevel.INFO);
      expect(log.message).toBe('Test message');
      expect(log.context).toBe('TestContext');
      expect(log.metadata).toEqual({ key: 'value' });
      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeInstanceOf(Date);
      expect(log.partitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should generate a UUID if id is not provided', () => {
      const props = createValidLogProps();
      const log = new Log(props);

      expect(log.id).toBeDefined();
      expect(log.id.length).toBeGreaterThan(0);
    });

    it('should use provided id if given', () => {
      const customId = 'custom-id-123';
      const props = { ...createValidLogProps(), id: customId };
      const log = new Log(props);

      expect(log.id).toBe(customId);
    });

    it('should set default context to "default" if not provided', () => {
      const props = {
        level: LogLevel.INFO,
        message: 'Test message',
      };
      const log = new Log(props);

      expect(log.context).toBe('default');
    });

    it('should set default metadata to empty object if not provided', () => {
      const props = {
        level: LogLevel.INFO,
        message: 'Test message',
      };
      const log = new Log(props);

      expect(log.metadata).toEqual({});
    });

    it('should use provided timestamp if given', () => {
      const customTimestamp = new Date('2024-01-15T10:30:00Z');
      const props = { ...createValidLogProps(), timestamp: customTimestamp };
      const log = new Log(props);

      expect(log.timestamp).toEqual(customTimestamp);
    });

    it('should create current timestamp if not provided', () => {
      const before = new Date();
      const props = createValidLogProps();
      const log = new Log(props);
      const after = new Date();

      expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(log.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('partitionDate', () => {
    it('should format partition date correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const props = { ...createValidLogProps(), timestamp };
      const log = new Log(props);

      expect(log.partitionDate).toBe('2024-01-15');
    });

    it('should handle single digit months and days', () => {
      const timestamp = new Date('2024-05-03T10:30:00Z');
      const props = { ...createValidLogProps(), timestamp };
      const log = new Log(props);

      expect(log.partitionDate).toBe('2024-05-03');
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the log', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const props = {
        id: 'test-id',
        level: LogLevel.ERROR,
        message: 'Error message',
        context: 'ErrorContext',
        timestamp,
        metadata: { errorCode: 500 },
      };
      const log = new Log(props);

      const json = log.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        level: 'ERROR',
        message: 'Error message',
        context: 'ErrorContext',
        timestamp: '2024-01-15T10:30:00.000Z',
        metadata: { errorCode: 500 },
        partitionDate: '2024-01-15',
      });
    });
  });

  describe('LogLevel enum', () => {
    it('should have all expected log levels', () => {
      expect(LogLevel.DEBUG).toBe('DEBUG');
      expect(LogLevel.INFO).toBe('INFO');
      expect(LogLevel.WARN).toBe('WARN');
      expect(LogLevel.ERROR).toBe('ERROR');
    });
  });
});
