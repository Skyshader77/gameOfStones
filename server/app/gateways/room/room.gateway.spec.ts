import { MOCK_AVATAR_ID } from '@app/constants/avatar-test.constants';
import { MOCK_MAPS } from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { RoomGateway } from './room.gateway';

describe('RoomGateway', () => {
    let gateway: RoomGateway;
    // let roomManagerService: RoomManagerService;
    let socketManagerService: SocketManagerService;
    // let chatGateway: ChatGateway;
    let logger: Logger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomGateway,
                {
                    provide: RoomManagerService,
                    useValue: {
                        addPlayerToRoom: jest.fn(),
                        removePlayerFromRoom: jest.fn(),
                        assignMapToRoom: jest.fn(),
                        getRoom: jest.fn().mockReturnValue({ players: [] }),
                    },
                },
                {
                    provide: SocketManagerService,
                    useValue: {
                        setGatewayServer: jest.fn(),
                        assignNewRoom: jest.fn(),
                        assignSocketsToPlayer: jest.fn(),
                        unassignPlayerSockets: jest.fn(),
                        getPlayerSocket: jest.fn(),
                        registerSocket: jest.fn(),
                        getSocketPlayerName: jest.fn(),
                        getSocketRoomCode: jest.fn(),
                    },
                },
                {
                    provide: MessagingGateway,
                    useValue: {},
                },
                {
                    provide: ChatManagerService,
                    useValue: {},
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                        warn: jest.fn(),
                    },
                },
                {
                    provide: AvatarManagerService,
                    useValue: { initializeAvatarList: jest.fn() },
                },
            ],
        }).compile();

        gateway = module.get<RoomGateway>(RoomGateway);
        // roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        socketManagerService = module.get<SocketManagerService>(SocketManagerService);
        // chatGateway = module.get<ChatGateway>(ChatGateway);
        logger = module.get<Logger>(Logger);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should initialize the gateway server in the constructor', () => {
        expect(socketManagerService.setGatewayServer).toHaveBeenCalledWith(Gateway.ROOM, gateway['server']);
    });

    it('should log a message when afterInit is called', () => {
        gateway.afterInit();

        expect(logger.log).toHaveBeenCalledWith('room gateway initialized');
    });

    it('should handle creating a room', () => {
        const mockSocket = { id: 'socket1' } as Socket;
        const mockRoomId = 'room123';

        gateway.handleCreateRoom(mockSocket, { roomId: mockRoomId, map: MOCK_MAPS[0], avatar: MOCK_AVATAR_ID });

        expect(socketManagerService.assignNewRoom).toHaveBeenCalledWith(mockRoomId);
    });

    // it('should handle joining a room', () => {
    //     const mockSocket = { id: 'socket1', data: { roomCode: '' }, join: jest.fn() } as unknown as Socket;
    //     const mockRoomId = MOCK_ROOM_GAME.room.roomCode;
    //     const mockPlayer = MOCK_PLAYERS[0];
    //     const mockPlayerSocketIndices = { [Gateway.ROOM]: 'socket1', [Gateway.CHAT]: 'socket2', [Gateway.GAME]: 'socket3' };

    //     jest.spyOn(socketManagerService, 'getPlayerSocket').mockReturnValue(mockSocket);
    //     gateway.handleJoinRoom(mockSocket, { roomId: mockRoomId, playerSocketIndices: mockPlayerSocketIndices, player: mockPlayer });

    //     expect(logger.log).toHaveBeenCalledWith(`Received JOIN event for roomId: ${mockRoomId} from socket: ${mockSocket.id}`);
    //     expect(socketManagerService.assignSocketsToPlayer).toHaveBeenCalledWith(mockRoomId, mockPlayer.playerInfo.userName, mockPlayerSocketIndices);
    //     expect(roomManagerService.addPlayerToRoom).toHaveBeenCalledWith(mockRoomId, mockPlayer);
    //     expect(mockSocket.join).toHaveBeenCalledWith(mockRoomId);
    // });

    /* it('should handle leaving a room', () => {
        const mockRoom = MOCK_ROOM_GAME;
        mockRoom.players = [MOCK_PLAYERS[0]];
        const mockRoomId = mockRoom.room.roomCode;
        const mockPlayerName = MOCK_PLAYERS[0].playerInfo.userName;
        const mockSocket = { id: 'socket1', leave: jest.fn() } as unknown as Socket;

        roomManagerService.getRoom = jest.fn().mockReturnValue(mockRoom);
        jest.spyOn(socketManagerService, 'getSocketRoomCode').mockReturnValue(mockRoomId);
        jest.spyOn(socketManagerService, 'getSocketPlayerName').mockReturnValue(mockPlayerName);

        gateway.handleLeaveRoom(mockSocket);

        expect(mockSocket.leave).toHaveBeenCalledWith(mockRoomId);
        expect(logger.log).toHaveBeenCalledWith(mockSocket.id + ' left the room');
    });*/

    it('should handle socket connection', () => {
        const mockSocket = { id: 'socket1' } as Socket;
        gateway.handleConnection(mockSocket);
        expect(socketManagerService.registerSocket).toHaveBeenCalledWith(mockSocket);
    });

    // it('should handle socket disconnection', () => {
    //     const mockSocket = { data: {}'socket1' } as Socket;
    //     gateway.handleDisconnect();
    //     expect(logger.log).toHaveBeenCalledWith('disconnected!');
    // });
});
