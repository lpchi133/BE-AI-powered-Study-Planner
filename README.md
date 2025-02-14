<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p> 
    
[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


## Table of Contents
- [Description](#description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Tasks Management](#tasks-management)
  - [AI Suggestions](#ai-suggestions)
  - [Focus Timer](#focus-timer)
  - [Users](#users)
- [Frontend Repository](#frontend-repository)
- [Resources](#resources)

## Description

The backend for the **AI-Powered Study Planner** is built using **NestJS** and **Prisma**, with a **PostgreSQL** database. It provides API services for user authentication, task management, scheduling, and AI-powered study insights.

## Features
- **User Authentication**: Secure authentication with JWT-based authorization.
- **Task Management**: Create, update, delete, and retrieve tasks.
- **Calendar & Scheduling**: Handle study schedule with task prioritization.
- **Pomodoro Timer Support**: Manage study sessions effectively.
- **AI Feedback System**: Generate personalized feedback using AI.
- **Real-time Synchronization**: WebSocket-based updates with **Ably**.
- **Password Reset**: Secure password recovery through email verification.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, scalable applications.
- **Prisma**: ORM for interacting with PostgreSQL.
- **PostgreSQL**: Relational database for storing user and task data.
- **Ably**: WebSocket-based real-time updates.
- **Passport.js** - Authentication middleware (supports Google and email/password login).
- **Cloudinary**: Image storage for profile pictures.
- **Nodemailer** - Email service for password reset functionality.


## Project Structure

```
BE-AI-powered-Study-Planner/
├── src/
│   ├── auth/         # Authentication module (JWT, Google OAuth, Passport.js)
│   ├── users/        # User management module
│   ├── tasks/        # Task management module
│   ├── ai-suggestion/   # AI suggestion module for generating study suggestions and feedback 
|   ├── focus-timer/  # Focus timer module for managing study sessions
|   ├── cloudinary/   # Cloudinary configuration for image storage
|   |   └── cloudinary.config.ts
|   ├── middlewares/  # Custom middlewares
|   ├── prisma/       # Prisma service for database interactions
|   ├── services/     # Additional services
│   ├── main.ts       # Entry point of the application 
|   ├── app.controller.ts # Main application controller
|   ├── app.controller.spec.ts  # Unit tests for the main application controller 
|   ├── app.service.ts    # Main application service
│   └── app.module.ts     # Main application module
├── prisma/
│   ├── schema.prisma # Prisma schema definition
|   └── migrations/   # Database migrations
├── .env              # Environment variables
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── README.md         # Documentation
└── ...
```


## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/lpchi133/BE-AI-powered-Study-Planner.git
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file and configure the following variables:
   ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/dbname
    JWT_SECRET=<YOUR_JWT_SECRET>
    JWT_EXPIRES_IN=1h
    FRONTEND_URL=<YOUR_FRONTEND_URL>
    GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
    GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
    GOOGLE_CALLBACK_URL=<YOUR_GOOGLE_CALLBACK_URL>

    CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>
    CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
    CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_APT_SECRET>
    GEMINI_API_KEY=<YOUR_GEMINI_API>

    MAIL_USER=<YOUR_MAIL_USER>
    MAIL_PASS=<YOUR_MAIL_PASS>

    ABLY_API_KEY=<YOUR_ABLY_API_KEY>

   ```

4. **Run database migration:**
   ```sh
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```sh
   npm run start:dev
   ```

## API Endpoints

### **Authentication**

- **`POST /auth/register `** - Register a new user
- **`POST /auth/login`** - Log in with email/password
- **`GET /auth/google`** - Log in using Google OAuth
- **`GET /auth/google-redirect`** - Google OAuth redirect
- **`POST /auth/forgot-password`** - Request password reset email
- **`PUT /auth/reset-password`** - Reset password  using token
- **`GET /auth/activate`** - Activate user account

### **Tasks Management**

- **`GET /tasks`** - Get all tasks for a user
- **`POST /tasks/createTask`** - Create a new task
- **`POST /tasks/deleteTask`** - Delete a task
- **`POST /tasks/updateTask`** - Update an existing task
- **`POST /tasks/updateTimeTask`** - Update task time
- **`POST /tasks/updateTaskStatus`** - Update task status

### **AI Suggestions**

- **`GET /ai-suggestion/`** - Generate AI-powered study suggestions
- **`GET /ai-suggestion/feed-back`** - Generate AI-powered feedback for tasks

### **Focus Timer**

- **`POST /focus-timer/:taskId/start`** - Start focus timer for a task
- **`PATCH /focus-timer/:sessionId/end`** - End focus timer session
- **`DELETE /focus-timer/cancel - Cancel`** focus timer session

### **Users**

- **`GET /users/profile`** - Get user profile
- **`POST /users/changeAvt`** - Change user avatar
- **`PUT /users/update`** - Update user information
- **`PUT /users/changePassword`** - Change user password

## Frontend Repository
You can find the frontend repository for this project [here](https://github.com/lpchi133/FE-AI-powered-Study-Planner).

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).