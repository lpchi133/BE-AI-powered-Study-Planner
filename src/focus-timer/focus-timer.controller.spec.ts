import { Test, TestingModule } from '@nestjs/testing';
import { FocusTimerController } from './focus-timer.controller';

describe('FocusTimerController', () => {
  let controller: FocusTimerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FocusTimerController],
    }).compile();

    controller = module.get<FocusTimerController>(FocusTimerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
