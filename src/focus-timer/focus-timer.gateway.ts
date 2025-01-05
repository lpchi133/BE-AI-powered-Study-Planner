import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL,
    },
})
export class FocusTimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleConnection(client: Socket) {
        // console.log(`Client connected: ${client.id}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}`);
    }

    notifyUser(taskId: number, message: string) {
        this.server.emit("taskDeadlineReached", { taskId, message });
    }
}
