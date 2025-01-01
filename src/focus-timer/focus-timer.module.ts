import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FocusTimerService } from './focus-timer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FocusTimerController } from './focus-timer.controller';
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';

@Module({
    providers: [FocusTimerService, PrismaService],
    controllers: [FocusTimerController],
})
export class FocusTimerModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleware).forRoutes(FocusTimerController);
    }
}
