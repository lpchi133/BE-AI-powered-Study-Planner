import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { JwtMiddleware } from "../middlewares/jwt.middleware";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(UsersController);
  }
}
