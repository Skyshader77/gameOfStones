import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';

export interface RoomGatewayServices {
    roomManagerService: RoomManagerService;
    socketManagerService: SocketManagerService;
    chatManagerService: ChatManagerService;
    avatarManagerService: AvatarManagerService;
}
