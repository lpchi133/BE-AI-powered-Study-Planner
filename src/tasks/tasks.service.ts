import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as moment from 'moment';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(
    userId: number,
    data: {
      itemLabel: string;
      itemDescription: string;
      itemPriority: string;
      itemStatus: string;
      dateTimeSet: string;
      dueDateTime: string;
    },
  ) {
    // Chuyển đổi dateTimeSet và dueDateTime thành ISO và in ra console
    const formattedStartDate = moment(data.dateTimeSet, "YYYY-MM-DDTHH:mm").format("YYYY-MM-DDTHH:mm");
  const formattedDueDate = moment(data.dueDateTime, "YYYY-MM-DDTHH:mm").format("YYYY-MM-DDTHH:mm");
  
    // In ra giá trị dateTimeSet và dueDateTime
    console.log('Formatted Start Date:', formattedStartDate);
    console.log('Formatted Due Date:', formattedDueDate);
  
    // Tạo task mới và lưu vào cơ sở dữ liệu
    return this.prisma.task.create({
      data: {
        itemLabel: data.itemLabel,
        itemDescription: data.itemDescription,
        itemPriority: data.itemPriority,
        itemStatus: data.itemStatus,
        dateTimeSet: formattedStartDate,  // Chuyển sang ISO string
        dueDateTime: formattedDueDate,  // Chuyển sang ISO string
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
      return { status: "success" };
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async updateTask(
    userId: number,
    data: {
      id: number;
      itemLabel: string;
      itemDescription: string;
      itemPriority: string;
      itemStatus: string;
      dateTimeSet: string;
      dueDateTime: string;
    },
  ) {
    const { id, ...rest } = data;

    try {
      const task = await this.prisma.task.findUnique({
        where: { id: id },
      });

      if (!task || task.userId !== userId) {
        throw new Error("Invalid user or task not found");
      }

      return this.prisma.task.update({
        where: { id: id },
        data: {
          ...rest,
        },
      });
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  async updateTimeTask(
    userId: number,
    id: number,
    start_date: string,
    date: string,
  ) {
    // Check if task exists
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new Error(
        "Task not found or you do not have permission to update this task",
      );
    }

    // Get start_time and time from old data
    const start_time = task.dateTimeSet
      ? task.dateTimeSet.toString().split("T")[1].slice(0, 5)
      : "00:00"; // Lấy thời gian từ dateTimeSet
    const time = task.dueDateTime
      ? task.dueDateTime.toString().split("T")[1].slice(0, 5)
      : "00:00"; // Lấy thời gian từ dueDateTime

    // Combine start_date and start_time, date and time into complete datetime strings
    const updatedDateTimeSet = `${start_date}T${start_time}:00`;
    const updatedDueDateTime = `${date}T${time}:00`;

    // Check if dueDateTime is in the past, and update status if needed
    const currentTime = new Date();
    let taskStatus = task.itemStatus; // Default to current task status

    if (new Date(updatedDueDateTime) < currentTime) {
      taskStatus = "Overdue"; // Update status to "overdue" if due date has passed
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
