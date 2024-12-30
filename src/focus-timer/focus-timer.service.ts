import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FocusTimerService {
    constructor(private prisma: PrismaService) { }

    async startFocusSession(taskId: number, duration: number) {
        if (typeof (taskId) !== 'number') taskId = parseInt(taskId);
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });

        if (!task) throw new NotFoundException('Task not found');
        if (task.itemStatus !== 'OnGoing') throw new BadRequestException('Task is not in progress');

        return this.prisma.focusSession.create({
            data: {
                taskId,
                duration,
            },
        });
    }

    async endFocusSession(sessionId: number) {
        const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });

        if (!session) throw new NotFoundException('Session not found');

        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - new Date(session.startedAt).getTime()) / 60000);

        await this.prisma.task.update({
            where: { id: session.taskId },
            data: { itemPriority: timeSpent.toString() },
        });

        await this.prisma.focusSession.update({
            where: { id: sessionId },
            data: { endedAt: endTime },
        });

        return { message: 'Focus session ended', timeSpent };
    }

    async cancelTimer(timerId: number) {
        const session = await this.prisma.focusSession.findUnique({ where: { id: timerId } });

        if (!session) throw new NotFoundException('Timer not found');

        await this.prisma.focusSession.delete({ where: { id: timerId } });

        return { message: 'Timer canceled successfully' };
    }
}
