import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AiSuggestionController } from "./ai-suggestion.controller";
import { AiSuggestionService } from "./ai-suggestion.service";
import { TasksService } from "src/tasks/tasks.service";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtMiddleware } from "src/middlewares/jwt.middleware";

@Module({
  controllers: [AiSuggestionController],
  providers: [AiSuggestionService, TasksService, PrismaService],
})
export class AiSuggestionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(AiSuggestionController);
  }
}
