import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async createTask(userId: number, data: { label: string; description: string; priority: string; status: string; start_date: string; start_time: string; date: string; time: string }) {

    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeSet = toZonedTime(`${data.start_date}T${data.start_time}`, timeZone);
    const dueDateTime = toZonedTime(`${data.date}T${data.time}`, timeZone);

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

    // Kiểm tra xem date và time có hợp lệ không
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeSet = toZonedTime(`${start_date}T${start_time}:00`, timeZone);
    const dueDateTime = toZonedTime(`${date}T${time}:00`, timeZone);

    if (isNaN(dueDateTime.getTime()) && isNaN(dateTimeSet.getTime())) {
      throw new Error('Invalid date or time');
    }

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

    //Get start_time and time from old data
    const start_time = task.dateTimeSet ? task.dateTimeSet.toISOString().split('T')[1].slice(0, 5) : '00:00';  // Lấy thời gian từ dateTimeSet
    const time = task.dueDateTime ? task.dueDateTime.toISOString().split('T')[1].slice(0, 5) : '00:00';  // Lấy thời gian từ dueDateTime

    // Convert start_date and date to complete time (including time)
    const timeZone = 'Asia/Ho_Chi_Minh';
    const updatedDateTimeSet = toZonedTime(`${start_date}T${start_time}:00`, timeZone);
    const updatedDueDateTime = toZonedTime(`${date}T${time}:00`, timeZone);

    if (isNaN(updatedDateTimeSet.getTime()) || isNaN(updatedDueDateTime.getTime())) {
      throw new Error('Invalid date');
    }

    // Check if dueDateTime is in the past, and update status if needed
    const currentTime = new Date();
    let taskStatus = task.itemStatus; // Default to current task status

    if (updatedDueDateTime < currentTime) {
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
