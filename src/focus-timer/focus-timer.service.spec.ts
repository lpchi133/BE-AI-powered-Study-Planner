import { Test, TestingModule } from '@nestjs/testing';
import { FocusTimerService } from './focus-timer.service';

describe('FocusTimerService', () => {
  let service: FocusTimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FocusTimerService],
    }).compile();

    service = module.get<FocusTimerService>(FocusTimerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
