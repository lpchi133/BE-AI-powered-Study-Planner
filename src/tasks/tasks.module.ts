import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TasksService, PrismaService],
  controllers: [TasksController]
})

export class TasksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(TasksController);
  }
}