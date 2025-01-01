import { Controller, Post, Body, Param, Request, Patch, UseGuards, Delete, UnauthorizedException } from '@nestjs/common';
import { FocusTimerService } from './focus-timer.service';
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';

@Controller('focus-timer')
export class FocusTimerController {
    constructor(private readonly focusTimerService: FocusTimerService) { }

    @Post(':taskId/start')
    @UseGuards(JwtMiddleware)
    async startTimer(
        @Request() req,
        @Param('taskId') taskId: number,
        @Body() body
    ) {
        if (!req.user) {
            throw new UnauthorizedException("Access denied");
        }
        const { focusTime, breakTime } = body;
        return this.focusTimerService.startFocusSession(taskId, focusTime, breakTime);
    }

    @Patch(':sessionId/end')
    @UseGuards(JwtMiddleware)
    async endTimer(@Request() req, @Param('sessionId') sessionId: number, @Body() body) {
        if (!req.user) {
            throw new UnauthorizedException("Access denied");
        }
        const { duration } = body;
        return this.focusTimerService.endFocusSession(sessionId, duration);
    }

    @Delete("cancel")
    @UseGuards(JwtMiddleware)
    async cancelTimer(@Request() req, @Body() body) {
        if (!req.user) {
            throw new UnauthorizedException("Access denied");
        }
        const { sessionId } = body;
        return this.focusTimerService.cancelTimer(sessionId);
    }
}