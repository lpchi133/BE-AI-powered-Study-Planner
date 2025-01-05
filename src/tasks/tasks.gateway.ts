import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL,
    },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    //using map to store active users
    private activeUsers: Map<number, string> = new Map();

    async handleConnection(client: Socket) {
        const { userId } = client.handshake.query; // Lấy userId từ query string
        if (userId) {
            this.activeUsers.set(Number(userId), client.id);
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = [...this.activeUsers.entries()].find(([, socketId]) => socketId === client.id)?.[0];
        if (userId) {
            this.activeUsers.delete(userId);
        }
    }

    // Gửi thông báo đến người dùng cụ thể 
    sendOverdueNotificationToUser(userId: number, taskId: number) {
        const socketId = this.activeUsers.get(userId);
        if (socketId) {
            console.log(`Sending task-overdue notification to user ${userId}`);
            this.server.to(socketId).emit('task-overdue', { taskId });
        } else {
            console.log(`User ${userId} is not connected!`);
        }
    }
}
