import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { JwtMiddleware } from "src/middlewares/jwt.middleware";
import { PrismaService } from "src/prisma/prisma.service";
import { TaskGateway } from "./tasks.gateway";

@Module({
  providers: [TasksService, PrismaService, TaskGateway],
  controllers: [TasksController],
})
export class TasksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(TasksController);
  }
}
