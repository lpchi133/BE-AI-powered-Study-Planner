import { Test, TestingModule } from "@nestjs/testing";
import { AiSuggestionService } from "./ai-suggestion.service";

describe("AiSuggestionService", () => {
  let service: AiSuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiSuggestionService],
    }).compile();

    service = module.get<AiSuggestionService>(AiSuggestionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
