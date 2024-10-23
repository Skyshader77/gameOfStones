import { Gateway } from '@app/constants/gateways.constants';
import { MOCK_PLAYERS, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { RoomGateway } from './room.gateway';
import { RoomEvents } from './room.gateway.events';

describe('RoomGateway', () => {
    let gateway: RoomGateway;
    let roomManagerService: RoomManagerService;
    let socketManagerService: SocketManagerService;
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
                    },
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                        warn: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<RoomGateway>(RoomGateway);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        socketManagerService = module.get<SocketManagerService>(SocketManagerService);
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

        gateway.handleCreateRoom(mockSocket, { roomId: mockRoomId });

        expect(logger.log).toHaveBeenCalledWith(`Received CREATE event for roomId: ${mockRoomId} from socket: ${mockSocket.id}`);
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

    it('should handle fetching players', () => {
        const mockSocket = { emit: jest.fn() } as unknown as Socket;
        const mockRoomId = MOCK_ROOM_GAME.room.roomCode;
        const mockPlayers = [{ playerInfo: { userName: 'player1' } }];

        roomManagerService.getRoom = jest.fn().mockReturnValue({ players: mockPlayers });

        gateway.handleFetchPlayers(mockSocket, { roomId: mockRoomId });

        expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.PLAYER_LIST, mockPlayers);
    });

    it('should handle leaving a room', () => {
        const mockSocket = { id: 'socket1', leave: jest.fn() } as unknown as Socket;
        const mockRoomId = MOCK_ROOM_GAME.room.roomCode;
        const mockPlayer = MOCK_PLAYERS[0];

        jest.spyOn(socketManagerService, 'getPlayerSocket').mockReturnValue(mockSocket);

        gateway.handleLeaveRoom(mockSocket, { roomId: mockRoomId, player: mockPlayer });

        expect(mockSocket.leave).toHaveBeenCalledWith(mockRoomId);
        expect(logger.log).toHaveBeenCalledWith(mockSocket.id + ' left the room');
    });

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
