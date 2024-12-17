import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async createTask(userId: number, data: { label: string; description: string; priority: string; status: string; start_date: string; start_time: string; date: string; time: string }) {
    const dateTimeSet = `${data.start_date}T${data.start_time}:00`;
    const dueDateTime = `${data.date}T${data.time}:00`;

    // console.log('dateTimeSet:', dateTimeSet);
    // console.log('dueDateTime:', dueDateTime);

    return this.prisma.task.create({
        data: {
            itemLabel: data.label,
            itemDescription: data.description,
            itemPriority: data.priority,
            itemStatus: data.status,
            dateTimeSet: dateTimeSet,
            dueDateTime: dueDateTime,
            userId: userId,
        },
    });
}

  async getAllTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId: userId },
    });
  }

  async deleteTask(taskId: number) {
    try {
      await this.prisma.task.delete({
        where: { id: taskId },
      });
      return { status: 'success' };
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async updateTask(userId: number, data: { id: number; label: string; description: string; priority: string; status: string; start_date: string; start_time: string; date: string; time: string }) {
    const { id, label, description, priority, status, start_date, start_time, date, time } = data;

    const dateTimeSet = `${start_date}T${start_time}:00`;
    const dueDateTime = `${date}T${time}:00`;

    try {
      const task = await this.prisma.task.findUnique({
        where: { id: id },
      });

      if (!task || task.userId !== userId) {
        throw new Error('Invalid user or task not found');
      }

      return this.prisma.task.update({
        where: { id: id },
        data: {
          itemLabel: label,
          itemDescription: description,
          itemPriority: priority,
          dateTimeSet: dateTimeSet,
          dueDateTime: dueDateTime,
          itemStatus: status,
        },
      });
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  async updateTimeTask(userId: number, id: number, start_date: string, date: string) {
    // Check if task exists
    const task = await this.prisma.task.findFirst({
        where: { id, userId },
    });

    if (!task) {
        throw new Error('Task not found or you do not have permission to update this task');
    }

    // Get start_time and time from old data
    const start_time = task.dateTimeSet ? task.dateTimeSet.split('T')[1].slice(0, 5) : '00:00';  // Lấy thời gian từ dateTimeSet
    const time = task.dueDateTime ? task.dueDateTime.split('T')[1].slice(0, 5) : '00:00';  // Lấy thời gian từ dueDateTime

    // Combine start_date and start_time, date and time into complete datetime strings
    const updatedDateTimeSet = `${start_date}T${start_time}:00`;
    const updatedDueDateTime = `${date}T${time}:00`;

    // Check if dueDateTime is in the past, and update status if needed
    const currentTime = new Date();
    let taskStatus = task.itemStatus; // Default to current task status

    if (new Date(updatedDueDateTime) < currentTime) {
        taskStatus = 'Overdue';  // Update status to "overdue" if due date has passed
    }

    const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
            dueDateTime: updatedDueDateTime,
            dateTimeSet: updatedDateTimeSet,
            itemStatus: taskStatus,
        },
    });

    return updatedTask;
}

}
