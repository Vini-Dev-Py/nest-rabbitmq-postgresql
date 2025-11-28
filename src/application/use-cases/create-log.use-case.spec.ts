import { Test, TestingModule } from '@nestjs/testing';
import { CreateLogUseCase } from './create-log.use-case';
import { LOG_REPOSITORY } from '../../domain/repositories';
import { CreateLogDto } from '../dtos/create-log.dto';
import { LogLevel, Log } from '../../domain/entities/log.entity';

describe('CreateLogUseCase', () => {
  let useCase: CreateLogUseCase;
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
        CreateLogUseCase,
        {
          provide: LOG_REPOSITORY,
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateLogUseCase>(CreateLogUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a log and save it to the repository', async () => {
      const dto: CreateLogDto = {
        level: LogLevel.INFO,
        message: 'Test log message',
        context: 'TestContext',
        metadata: { key: 'value' },
      };

      mockLogRepository.save.mockResolvedValue(undefined);

      const result = await useCase.execute(dto);

      expect(mockLogRepository.save).toHaveBeenCalledTimes(1);
      expect(mockLogRepository.save).toHaveBeenCalledWith(expect.any(Log));

      expect(result.level).toBe(LogLevel.INFO);
      expect(result.message).toBe('Test log message');
      expect(result.context).toBe('TestContext');
      expect(result.metadata).toEqual({ key: 'value' });
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.partitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should create a log with default context when not provided', async () => {
      const dto: CreateLogDto = {
        level: LogLevel.ERROR,
        message: 'Error message',
      };

      mockLogRepository.save.mockResolvedValue(undefined);

      const result = await useCase.execute(dto);

      expect(result.context).toBe('default');
    });

    it('should create a log with default metadata when not provided', async () => {
      const dto: CreateLogDto = {
        level: LogLevel.WARN,
        message: 'Warning message',
        context: 'WarnContext',
      };

      mockLogRepository.save.mockResolvedValue(undefined);

      const result = await useCase.execute(dto);

      expect(result.metadata).toEqual({});
    });

    it('should throw an error if repository save fails', async () => {
      const dto: CreateLogDto = {
        level: LogLevel.DEBUG,
        message: 'Debug message',
      };

      const error = new Error('Database connection failed');
      mockLogRepository.save.mockRejectedValue(error);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
