import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { JwtMiddleware } from "./middlewares/jwt.middleware";
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [AuthModule, UsersModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: "users/profile", method: RequestMethod.GET });
  }
}
