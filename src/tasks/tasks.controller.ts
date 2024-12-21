import { Controller, Post, UseGuards, Request, Body, UnauthorizedException, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}
    
    @Post('createTask')
    @UseGuards(JwtMiddleware)
    async createTask(@Request() req, @Body() body) {
      if (!req.user) {
        throw new UnauthorizedException('Access denied');
      }
  
      const { label, description, priority, status, start_date, start_time, date, time } = body;
      if (!label || !description || !priority || !status || !start_date || !start_time || !date || !time) {
        throw new Error('All fields are required');
      }
  
      const userId = req.user.id;
      const task = await this.tasksService.createTask(userId, body);
      return task;
    }
  
    @Get('/')
    @UseGuards(JwtMiddleware)
    async getAllTasks(@Request() req) {
      if (!req.user) {
        throw new UnauthorizedException('Access denied');
      }

      const userId = req.user.id;
      const tasks = await this.tasksService.getAllTasks(userId);

      return tasks;
    }
  
    @Post('deleteTask')
    @UseGuards(JwtMiddleware)
    async deleteTask(@Request() req, @Body() body) {
      if (!req.user) {
        throw new UnauthorizedException('Access denied');
      }
  
      const taskId = body.id;
      if (!taskId) {
        throw new Error('Task ID is required');
      }
  
      try {
        const result = await this.tasksService.deleteTask(taskId);
        return result;
      } catch (error) {
        return { error: error.message };
      }
    }
  
    @Post('updateTask')
    @UseGuards(JwtMiddleware)
    async updateTask(@Request() req, @Body() body) {
      if (!req.user) {
        throw new UnauthorizedException('Access denied');
      }
  
      const userId = req.user.id;
      const { id, label, description, priority, status, start_date, start_time, date, time  } = body;
  
      if (!id || !label || !description || !priority || !status || !start_date || !start_time || !date || !time) {
        throw new Error('All fields are required');
      }
  
      try {
        const result = await this.tasksService.updateTask(userId, body);
        return { status: 'success', task: result };
      } catch (error) {
        return { error: error.message };
      }
    }

    @Post('updateTimeTask')
    @UseGuards(JwtMiddleware)
    async updateTimeTask(@Request() req, @Body() body) {
      if (!req.user) {
        throw new UnauthorizedException('Access denied');
      }
    
      const userId = req.user.id;
      const { id, start_date, date } = body;
    
      // Kiểm tra các trường bắt buộc
      if (!id || !start_date || !date) {
        throw new Error('Task ID, start date, and date are required');
      }
    
      try {
        const updatedTask = await this.tasksService.updateTimeTask(userId, id, start_date, date);
        return { status: 'success', task: updatedTask };
      } catch (error) {
        return { error: error.message };
      }
    }
    
}
