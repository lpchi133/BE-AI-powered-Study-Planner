import { Test, TestingModule } from '@nestjs/testing';
import { AiSuggestionController } from './ai-suggestion.controller';

describe('AiSuggestionController', () => {
  let controller: AiSuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiSuggestionController],
    }).compile();

    controller = module.get<AiSuggestionController>(AiSuggestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
