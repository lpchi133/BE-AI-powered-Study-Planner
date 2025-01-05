import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

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
    }
  ) {
    // Tạo task mới và lưu vào cơ sở dữ liệu
    return this.prisma.task.create({
      data: {
        itemLabel: data.itemLabel,
        itemDescription: data.itemDescription,
        itemPriority: data.itemPriority,
        itemStatus: data.itemStatus,
        dateTimeSet: data.dateTimeSet, // Chuyển sang ISO string
        dueDateTime: data.dueDateTime, // Chuyển sang ISO string
        userId: userId,
      },
    });
  }

  async getAllTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId: userId },
      include: {
        focusSessions: true, // Include the focusSessions relation
      },
    });
  }

  async getTaskByIds(taskIds: number[]) {
    return this.prisma.task.findMany({
      where: { id: { in: taskIds } },
    });
  }

  async deleteTask(taskId: number) {
    try {
      // Xóa tất cả các phiên tập trung liên quan đến nhiệm vụ
      await this.prisma.focusSession.deleteMany({
        where: { taskId: taskId },
      });

      // Sau đó xóa nhiệm vụ
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
      focusSessions?: any[]; // Optional
    }
  ) {
    const { id, focusSessions, ...rest } = data;

    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.userId !== userId) {
        throw new Error("Invalid user");
      }

      const updatedTaskData: any = { ...rest };

      // Handle updating focus sessions if provided
      if (focusSessions && focusSessions.length > 0) {
        updatedTaskData.focusSessions = {
          update: focusSessions.map((session) => ({
            where: { id: session.id }, // Assuming each session has an `id`
            data: {
              itemLabel: session.itemLabel,
              itemDescription: session.itemDescription,
              itemPriority: session.itemPriority,
              itemStatus: session.itemStatus,
              dateTimeSet: session.dateTimeSet,
              dueDateTime: session.dueDateTime,
            },
          })),
        };
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: updatedTaskData,
      });

      return updatedTask;
    } catch (error) {
      console.error("Error during task update:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  async updateTimeTask(
    userId: number,
    id: number,
    start_date: string,
    date: string
  ) {
    // Check if task exists
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new Error(
        "Task not found or you do not have permission to update this task"
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

    if (taskStatus !== "Completed") {
      if (new Date(updatedDueDateTime) < currentTime) {
        taskStatus = "Overdue"; // Update status to "overdue" if due date has passed
      } else if (new Date(updatedDateTimeSet) > currentTime) {
        taskStatus = "Not Started";
      } else {
        taskStatus = "OnGoing";
      }
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
  async updateTaskStatus(taskId: number, itemStatus: string) {
    try {
      return await this.prisma.task.update({
        where: { id: taskId },
        data: { itemStatus },
      });
    } catch (error) {
      throw new Error(`Error updating task status: ${error.message}`);
    }
  }
}
