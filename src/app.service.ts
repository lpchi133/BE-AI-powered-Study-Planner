import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; endpoints: string[] } {
    return {
      message: 'Welcome to the User Registration API',
      version: '1.0.0',
      endpoints: [
        '/auth/register - POST: Register a new user',
        '/auth/login - POST: User login',
        '/users/profile - GET: Get user profile',
      ],
    };
  }
}
