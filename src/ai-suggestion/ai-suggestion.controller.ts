import { JwtMiddleware } from "src/middlewares/jwt.middleware";
import { AiSuggestionService } from "./ai-suggestion.service";
import {
  Controller,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from "@nestjs/common";

@Controller("ai-suggestion")
export class AiSuggestionController {
  constructor(private AiSuggestionService: AiSuggestionService) {}

  @Get("/")
  @UseGuards(JwtMiddleware)
  async generateSuggestion(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException(req.user);
    }

    const userId = req.user.id;
    const tasks = await this.AiSuggestionService.generateSuggestion(userId);

    return tasks;
  }

  @Get("/feed-back")
  @UseGuards(JwtMiddleware)
  async generateFeedBack(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException(req.user);
    }
    const tasksIds = req.query.taskIds || ([] as string[]);
    const tasks =
      await this.AiSuggestionService.generateAISuggestionForFeedBack(
        tasksIds.map(Number)
      );

    return tasks;
  }
}
