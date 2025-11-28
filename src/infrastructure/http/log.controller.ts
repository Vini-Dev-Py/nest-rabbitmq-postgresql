import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateLogDto, LogResponseDto } from '../../application/dtos';
import {
  CreateLogUseCase,
  GetLogsByDateUseCase,
} from '../../application/use-cases';
import { LogProducer } from '../../infrastructure/messaging/rabbitmq';

@Controller('logs')
export class LogController {
  constructor(
    private readonly createLogUseCase: CreateLogUseCase,
    private readonly getLogsByDateUseCase: GetLogsByDateUseCase,
    private readonly logProducer: LogProducer,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLogDto: CreateLogDto): Promise<LogResponseDto> {
    return this.createLogUseCase.execute(createLogDto);
  }

  @Post('async')
  @HttpCode(HttpStatus.ACCEPTED)
  createAsync(@Body() createLogDto: CreateLogDto): { message: string } {
    this.logProducer.publishLog(createLogDto);
    return { message: 'Log message sent to queue for processing' };
  }

  @Get()
  async getByDate(@Query('date') date?: string): Promise<LogResponseDto[]> {
    const queryDate = date || this.getTodayDate();
    return this.getLogsByDateUseCase.execute(queryDate);
  }

  @Get(':date')
  async getBySpecificDate(
    @Param('date') date: string,
  ): Promise<LogResponseDto[]> {
    return this.getLogsByDateUseCase.execute(date);
  }

  private getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
