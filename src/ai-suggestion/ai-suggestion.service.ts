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

  async generateSuggestion(userId: number) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    //get all tasks of user
    const tasks = await this.tasksService.getAllTasks(userId);

    const prompt = `
            Analyze this schedule and provide feedback:
            ${JSON.stringify(tasks)}
            Feedback:
            1. Are there any tight schedules?
            2. Suggestions for prioritization.
            3. Recommendations for balance and focus.
        `;

    const result = await model.generateContent(prompt);

    return result.response.text();
  }
}
