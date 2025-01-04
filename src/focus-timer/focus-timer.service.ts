import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import moment from "moment-timezone";
import { FocusTimerGateway } from "./focus-timer.gateway";

@Injectable()
export class FocusTimerService {

  private activeTimers = new Map<number, NodeJS.Timeout>();

  constructor(private prisma: PrismaService, private focusTimerGateway: FocusTimerGateway,) { }

  private async monitorDeadline(taskId: number, sessionId: number, deadline: moment.Moment) {
    const timeUntilDeadline = deadline.diff(moment().tz('Asia/Ho_Chi_Minh'));

    // Clear any existing timers for the same task
    if (this.activeTimers.has(taskId)) {
      clearTimeout(this.activeTimers.get(taskId));
    }

    const timeout = setTimeout(async () => {
      // Fetch the session to get startedAt
      const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const startedAt = moment(session.startedAt).tz('Asia/Ho_Chi_Minh');
      const duration = moment().tz('Asia/Ho_Chi_Minh').diff(startedAt, 'seconds'); // Calculate duration in seconds

      // End the session with the calculated duration
      await this.endFocusSession(sessionId, duration);

      console.log(`Task ${taskId} deadline met. Timer ended.`);

      // Notify the user via WebSocket
      this.focusTimerGateway.notifyUser(taskId, 'The task deadline has been reached. Timer ended.');
    }, timeUntilDeadline);

    this.activeTimers.set(taskId, timeout);
  }


  async startFocusSession(
    taskId: number,
    focusTime: number,
    breakTime: number,
  ) {
    if (typeof taskId !== "number") taskId = parseInt(taskId);
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new NotFoundException("Task not found");
    if (task.itemStatus !== "OnGoing")
      throw new BadRequestException("Task is not in progress");

    const now = moment().tz('Asia/Ho_Chi_Minh');
    const deadline = moment(task.dueDateTime).tz('Asia/Ho_Chi_Minh');
    if (now.isAfter(deadline)) {
      throw new BadRequestException('Task is overdue');
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: { focusTime, breakTime },
    });

    const startedAt = moment()
      .tz("Asia/Ho_Chi_Minh")
      .format("YYYY-MM-DDTHH:mm");

    const focusSession = await this.prisma.focusSession.create({
      data: {
        taskId,
        duration: 0,
        startedAt,
      },
    });

    this.monitorDeadline(taskId, focusSession.id, deadline);

    return { sessionId: focusSession.id };
  }

  async endFocusSession(sessionId: number, duration: number) {
    if (typeof sessionId !== "number") sessionId = parseInt(sessionId);
    const session = await this.prisma.focusSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException("Session not found");

    const endTime = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");

    await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        duration: duration,
        endedAt: endTime,
      },
    });

    // Clean up the timer
    this.activeTimers.delete(session.taskId);

    return { message: "Focus session ended" };
  }

  async cancelTimer(sessionId: number) {
    const session = await this.prisma.focusSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException("Timer not found");

    await this.prisma.focusSession.delete({ where: { id: sessionId } });

    // Clean up the timer
    this.activeTimers.delete(session.taskId);

    return { message: "Timer canceled successfully" };
  }
}
