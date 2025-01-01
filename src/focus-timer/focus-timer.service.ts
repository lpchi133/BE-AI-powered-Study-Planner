import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FocusTimerService {
    constructor(private prisma: PrismaService) { }

    async startFocusSession(taskId: number, focusTime: number, breakTime: number) {
        if (typeof (taskId) !== 'number') taskId = parseInt(taskId);
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });

        if (!task) throw new NotFoundException('Task not found');
        if (task.itemStatus !== 'OnGoing') throw new BadRequestException('Task is not in progress');

        await this.prisma.task.update({
            where: { id: taskId },
            data: { focusTime, breakTime },
        });

        const focusSession = await this.prisma.focusSession.create({
            data: {
                taskId,
                duration: 0,
            },
        });

        return { sessionId: focusSession.id };
    }

    async endFocusSession(sessionId: number, duration: number) {
        if (typeof (sessionId) !== 'number') sessionId = parseInt(sessionId);
        const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });

        if (!session) throw new NotFoundException('Session not found');

        const endTime = new Date();

        await this.prisma.focusSession.update({
            where: { id: sessionId },
            data: {
                duration: duration,
                endedAt: endTime,
            },
        });

        return { message: 'Focus session ended' };
    }

    async cancelTimer(sessionId: number) {
        const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });

        if (!session) throw new NotFoundException('Timer not found');

        await this.prisma.focusSession.delete({ where: { id: sessionId } });

        return { message: 'Timer canceled successfully' };
    }
}
