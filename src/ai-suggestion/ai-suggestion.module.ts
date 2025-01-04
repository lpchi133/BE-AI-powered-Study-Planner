import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AiSuggestionController } from "./ai-suggestion.controller";
import { AiSuggestionService } from "./ai-suggestion.service";
import { TasksService } from "src/tasks/tasks.service";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtMiddleware } from "src/middlewares/jwt.middleware";
import { TaskGateway } from "src/tasks/tasks.gateway";

@Module({
  controllers: [AiSuggestionController],
  providers: [AiSuggestionService, TasksService, PrismaService, TaskGateway],
})
export class AiSuggestionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(AiSuggestionController);
  }
}
