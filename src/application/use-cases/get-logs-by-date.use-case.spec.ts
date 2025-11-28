import { Test, TestingModule } from '@nestjs/testing';
import { GetLogsByDateUseCase } from './get-logs-by-date.use-case';
import { LOG_REPOSITORY } from '../../domain/repositories';
import { LogLevel, Log } from '../../domain/entities/log.entity';

describe('GetLogsByDateUseCase', () => {
  let useCase: GetLogsByDateUseCase;
  let mockLogRepository: {
    save: jest.Mock;
    findByDate: jest.Mock;
    findByDateAndLevel: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    mockLogRepository = {
      save: jest.fn(),
      findByDate: jest.fn(),
      findByDateAndLevel: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLogsByDateUseCase,
        {
          provide: LOG_REPOSITORY,
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetLogsByDateUseCase>(GetLogsByDateUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return logs for a specific date', async () => {
      const date = '2024-01-15';
      const timestamp = new Date('2024-01-15T10:30:00Z');

      const mockLogs = [
        new Log({
          id: 'log-1',
          level: LogLevel.INFO,
          message: 'Info message',
          context: 'Context1',
          timestamp,
          metadata: { key: 'value1' },
        }),
        new Log({
          id: 'log-2',
          level: LogLevel.ERROR,
          message: 'Error message',
          context: 'Context2',
          timestamp,
          metadata: { key: 'value2' },
        }),
      ];

      mockLogRepository.findByDate.mockResolvedValue(mockLogs);

      const result = await useCase.execute(date);

      expect(mockLogRepository.findByDate).toHaveBeenCalledWith(date);
      expect(result).toHaveLength(2);

      expect(result[0].id).toBe('log-1');
      expect(result[0].level).toBe(LogLevel.INFO);
      expect(result[0].message).toBe('Info message');
      expect(result[0].context).toBe('Context1');
      expect(result[0].metadata).toEqual({ key: 'value1' });
      expect(result[0].partitionDate).toBe('2024-01-15');

      expect(result[1].id).toBe('log-2');
      expect(result[1].level).toBe(LogLevel.ERROR);
    });

    it('should return empty array when no logs found for date', async () => {
      const date = '2024-01-20';

      mockLogRepository.findByDate.mockResolvedValue([]);

      const result = await useCase.execute(date);

      expect(mockLogRepository.findByDate).toHaveBeenCalledWith(date);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should throw an error if repository fails', async () => {
      const date = '2024-01-15';
      const error = new Error('Database connection failed');

      mockLogRepository.findByDate.mockRejectedValue(error);

      await expect(useCase.execute(date)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should correctly map timestamp to ISO string', async () => {
      const date = '2024-01-15';
      const timestamp = new Date('2024-01-15T10:30:00.000Z');

      const mockLogs = [
        new Log({
          id: 'log-1',
          level: LogLevel.DEBUG,
          message: 'Debug message',
          timestamp,
        }),
      ];

      mockLogRepository.findByDate.mockResolvedValue(mockLogs);

      const result = await useCase.execute(date);

      expect(result[0].timestamp).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
