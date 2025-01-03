import { TasksService } from "./../tasks/tasks.service";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AiSuggestionService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
  ) {}

  mapTaskToPrompt(task:{    id: number;
    itemLabel: string;
    itemDescription: string;
    itemPriority: string;
    itemStatus: string;
    dateTimeSet: string;
    dueDateTime: string;
    focusTime: number|null;
    breakTime:number|null;
  }) {
    return `- TaskId:${task.id}, Name: ${task.itemLabel}, Priority: ${task.itemPriority}, Status: ${task.itemStatus}, Start: ${task.dateTimeSet}, Due: ${task.dueDateTime}, Focus Time: ${task.focusTime}, Break Time: ${task.breakTime}`;
  }

  async generateSuggestion(userId: number) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    //get all tasks of user
    const tasks = await this.tasksService.getAllTasks(userId);

    const prompt = `
            You are a preofessional in schedule and structuring task. Please analyze this schedule and offering motivational feedback to encourage consistency and improvement:
            ${tasks.map(this.mapTaskToPrompt).join("\n")}
            Base on:
            1. Are there any tight schedules?
            2. Suggestions for prioritization.
            3. Recommendations for balance and focus.
            4. Suggestions for breaks.
            Notes:
             - Please reprinting, beautify the tasks list and add any additional information you think is relevant by using markdown no using html (in Notes column).
             - Please bold the name task when giving suggestions.
             - Please sort the tasks by priority and due date.
             - Please add the suggestions at the end of the list.
             - The suggestions should be note in bullet points with improvements and encouragements.
             - Make the suggestions as detailed as possible, provide reasons for each suggestion and professional advice.
             - Please beautify the suggestions by using markdown no using html.
        `;
    const result = await model.generateContent(prompt);

    return result.response.text();
  }
}
