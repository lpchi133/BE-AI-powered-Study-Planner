import { Controller, Post, Body, Param, Patch, UseGuards, Delete } from '@nestjs/common';
import { FocusTimerService } from './focus-timer.service';
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';

@Controller('focus-timer')
export class FocusTimerController {
    constructor(private readonly focusTimerService: FocusTimerService) { }

    @Post(':taskId/start')
    @UseGuards(JwtMiddleware)
    async startTimer(
        @Param('taskId') taskId: number,
        @Body() body: { duration: number }
    ) {
        return this.focusTimerService.startFocusSession(taskId, body.duration);
    }

    @Patch(':sessionId/end')
    @UseGuards(JwtMiddleware)
    async endTimer(@Param('sessionId') sessionId: number) {
        return this.focusTimerService.endFocusSession(sessionId);
    }

    @Delete("cancel")
    @UseGuards(JwtMiddleware)
    async cancelTimer(@Body() body) {
        const { timerId } = body;
        return this.focusTimerService.cancelTimer(timerId);
    }
}