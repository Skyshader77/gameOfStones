/* eslint-disable */
import { MOCK_PLAYER_SOCKET_INDICES, MOCK_PLAYERS, MOCK_ROOM_GAME, MOCK_SOCKET_ID } from '@app/constants/test.constants';
import { SocketInformation } from '@app/interfaces/socket-information';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { SocketManagerService } from './socket-manager.service';

describe('SocketManagerService', () => {
    let service: SocketManagerService;
    let roomManagerSpy: Partial<RoomManagerService>;

    beforeEach(async () => {
        roomManagerSpy = {
            createRoom: jest.fn(),
            getRoom: jest.fn(),
            getAllRoomPlayers: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [SocketManagerService, { provide: RoomManagerService, useValue: roomManagerSpy }],
        }).compile();

        service = module.get<SocketManagerService>(SocketManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should assign a new room and call createRoom', () => {
        service.assignNewRoom(MOCK_ROOM_GAME.room.roomCode);
        expect(service.playerSocketMap.has(MOCK_ROOM_GAME.room.roomCode)).toBe(true);
        expect(roomManagerSpy.createRoom).toHaveBeenCalledWith(MOCK_ROOM_GAME.room.roomCode);
    });

    it('should register a socket by adding it to the sockets map', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set(),
        } as Socket;
        service.registerSocket(mockSocket);
        expect(service['sockets'].get(mockSocketId)).toBe(mockSocket);
    });

    it('should return the room code of a socket', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1', 'room1']),
        } as Socket;
        const roomCode = service.getSocketRoomCode(mockSocket);
        expect(roomCode).toBe('room1');
    });

    it('should return null if socket is not in a room', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1']),
        } as Socket;
        const roomCode = service.getSocketRoomCode(mockSocket);
        expect(roomCode).toBeNull();
    });

    it('should return the room associated with a socket and call roomManagerService.getRoom', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1', 'room1']),
        } as Socket;
        service.getSocketRoom(mockSocket);
        expect(roomManagerSpy.getRoom).toHaveBeenCalledWith('room1');
    });

    it('should return null if the socket is not in any room', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1']),
        } as unknown as Socket;
        const room = service.getSocketRoom(mockSocket);
        expect(room).toBeNull();
    });

    it('should return undefined if the socketId is not mapped to a socket', () => {
        const mockSocketId = 'socket1';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).playerSockets.set(
            MOCK_ROOM_GAME.room.roomCode,
            new Map([[MOCK_PLAYERS[0].playerInfo.userName, { [Gateway.Room]: mockSocketId }]]),
        );
        // We never set the mockSocketId to an actual socket in the sockets map
        const socket = service.getPlayerSocket(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName, Gateway.Room);
        expect(socket).toBeUndefined();
    });

    it('should return undefined if the player is not found in the room', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).playerSockets.set(MOCK_ROOM_GAME.room.roomCode, new Map());
        // We don't set the player in the room's map
        service['sockets'].set(mockSocketId, mockSocket);
        const socket = service.getPlayerSocket(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName, Gateway.Room);
        expect(socket).toBeUndefined();
    });

    it('should return undefined if the room does not exist in the playerSockets map', () => {
        service['playerSockets'] = new Map();
        const socket = service.getPlayerSocket(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName, Gateway.Room);
        expect(socket).toBeUndefined();
    });

    it('should unregister a socket by removing it from the sockets map', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set(),
        } as Socket;
        service.registerSocket(mockSocket);
        expect(service['sockets'].has(mockSocketId)).toBe(true);
        service.unregisterSocket(mockSocket);
        expect(service['sockets'].has(mockSocketId)).toBe(false);
    });

    it('should return the player name for a socket in a room', () => {
        const socketId = 'socket1';
        const playerSocketIndices: PlayerSocketIndices = {
            room: socketId,
            game: socketId,
            messaging: socketId,
            fight: socketId,
        };
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        const mockSocket: Socket = {
            id: socketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        const result = service.getSocketPlayerName(mockSocket);
        expect(result).toBe(MOCK_PLAYERS[0].playerInfo.userName);
    });

    it('should return null if the socket is not in any room', () => {
        const mockSocket: Socket = {
            id: 'socket1',
            rooms: new Set(),
        } as Socket;
        const result = service.getSocketPlayerName(mockSocket);
        expect(result).toBeNull();
    });

    it('should return null if the socket is in a room but does not match any player socket ids', () => {
        const socketId = 'socket1';
        const playerSocketIndices: PlayerSocketIndices = {
            room: 'socket2',
            game: 'socket2',
            messaging: 'socket2',
            fight: 'socket2',
        };
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        const mockSocket: Socket = {
            id: socketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        const result = service.getSocketPlayerName(mockSocket);
        expect(result).toBeNull();
    });

    it('should return null if there is no roomCode for the socket (getSocketRoomCode returns undefined)', () => {
        const mockSocket: Socket = {
            id: 'socket1',
            rooms: new Set(),
        } as Socket;
        jest.spyOn(service, 'getSocketRoomCode').mockReturnValue(undefined);
        const result = service.getSocketPlayerName(mockSocket);
        expect(result).toBeNull();
    });

    it('should return the player name for a matching socket in a room', () => {
        const socketId = 'socket1';
        const playerSocketIndices: PlayerSocketIndices = {
            room: socketId,
            game: socketId,
            messaging: socketId,
            fight: socketId,
        };
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        const mockSocket: Socket = {
            id: socketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        const result = service.getDisconnectedPlayerName(MOCK_ROOM_GAME.room.roomCode, mockSocket);
        expect(result).toBe(MOCK_PLAYERS[0].playerInfo.userName);
    });

    it('should return null if the roomCode is not provided', () => {
        const mockSocket: Socket = {
            id: 'socket1',
            rooms: new Set(),
        } as Socket;
        const result = service.getDisconnectedPlayerName('', mockSocket);
        expect(result).toBeNull();
    });

    it('should return null if the roomCode does not exist in playerSockets', () => {
        const mockSocket: Socket = {
            id: 'socket1',
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        service['playerSockets'] = new Map();
        const result = service.getDisconnectedPlayerName(MOCK_ROOM_GAME.room.roomCode, mockSocket);
        expect(result).toBeNull();
    });

    it('should return null if playerSockets is empty or undefined', () => {
        const mockSocket: Socket = {
            id: 'socket1',
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        service['playerSockets'] = undefined;
        const result = service.getDisconnectedPlayerName(MOCK_ROOM_GAME.room.roomCode, mockSocket);
        expect(result).toBeNull();
    });

    it('should return null if the socket is in a room but does not match any player socket ids', () => {
        const socketId = 'socket1';
        const playerSocketIndices: PlayerSocketIndices = {
            room: 'socket2',
            game: 'socket2',
            messaging: 'socket2',
            fight: 'socket2',
        };
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        const mockSocket: Socket = {
            id: socketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
        } as Socket;
        const result = service.getDisconnectedPlayerName(MOCK_ROOM_GAME.room.roomCode, mockSocket);
        expect(result).toBeNull();
    });

    it('should add player socket indices to playerSockets and join the room for all gateways', () => {
        const socketIdx: PlayerSocketIndices = MOCK_PLAYER_SOCKET_INDICES;
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map());
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set(),
            join: jest.fn(),
        } as unknown as Socket;
        jest.spyOn(service, 'getPlayerSocket').mockReturnValue(mockSocket);
        service['sockets'].set(mockSocketId, mockSocket);
        service.handleJoiningSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName, socketIdx);
        expect(service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode).get(MOCK_PLAYERS[0].playerInfo.userName)).toEqual(socketIdx);
        expect(mockSocket.join).toHaveBeenCalledWith(MOCK_ROOM_GAME.room.roomCode);
    });

    it('should not join the room if the socket does not exist', () => {
        const socketIdx: PlayerSocketIndices = MOCK_PLAYER_SOCKET_INDICES;
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set(),
            join: jest.fn(),
        } as unknown as Socket;
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map());
        service.handleJoiningSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName, socketIdx);
        expect(service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode).get(MOCK_PLAYERS[0].playerInfo.userName)).toEqual(socketIdx);
        expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should not do anything if the player socket does not exist', () => {
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map());
        service.handleLeavingSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        const roomPlayerSockets = service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode);
        expect(roomPlayerSockets?.has(MOCK_PLAYERS[0].playerInfo.userName)).toBe(false);
    });

    it('should not do anything if the room does not exist in playerSockets', () => {
        service.handleLeavingSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        const roomPlayerSockets = service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode);
        expect(roomPlayerSockets).toBeUndefined();
    });

    it('should make the player socket leave the room and remove the player from playerSockets', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
            leave: jest.fn(),
        } as unknown as Socket;
        jest.spyOn(service, 'getPlayerSocket').mockImplementation((room, player, gateway) => {
            return gateway === Gateway.Room ? mockSocket : null;
        });
        const playerSocketIndices: PlayerSocketIndices = {
            room: mockSocketId,
            game: mockSocketId,
            messaging: mockSocketId,
            fight: mockSocketId,
        };
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        service.handleLeavingSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        expect(mockSocket.leave).toHaveBeenCalledWith(MOCK_ROOM_GAME.room.roomCode);
        const roomPlayerSockets = service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode);
        expect(roomPlayerSockets?.has(MOCK_PLAYERS[0].playerInfo.userName)).toBe(false);
    });

    it('should not do anything if the room does not exist in playerSockets', () => {
        service.handleLeavingSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        const roomPlayerSockets = service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode);
        expect(roomPlayerSockets).toBeUndefined();
    });

    it('should remove the player from playerSockets if they are in the room and the socket exists', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set([MOCK_ROOM_GAME.room.roomCode]),
            leave: jest.fn(),
        } as unknown as Socket;
        jest.spyOn(service, 'getPlayerSocket').mockImplementation((room, player, gateway) => {
            return gateway === Gateway.Room ? mockSocket : null;
        });
        const playerSocketIndices: PlayerSocketIndices = MOCK_PLAYER_SOCKET_INDICES;
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        service.handleLeavingSockets(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        expect(mockSocket.leave).toHaveBeenCalledWith(MOCK_ROOM_GAME.room.roomCode);
        const roomPlayerSockets = service['playerSockets'].get(MOCK_ROOM_GAME.room.roomCode);
        expect(roomPlayerSockets?.has(MOCK_PLAYERS[0].playerInfo.userName)).toBe(false);
    });

    it('should call handleLeavingSockets for each player if there are players in the room', () => {
        const playerSocketIndices: PlayerSocketIndices = MOCK_PLAYER_SOCKET_INDICES;

        roomManagerSpy.getAllRoomPlayers = jest.fn().mockReturnValue([
            {
                playerInfo: { userName: MOCK_PLAYERS[0].playerInfo.userName },
            },
        ]);
        const handleLeavingSocketsSpy = jest.spyOn(service, 'handleLeavingSockets');
        service['playerSockets'].set(MOCK_ROOM_GAME.room.roomCode, new Map([[MOCK_PLAYERS[0].playerInfo.userName, playerSocketIndices]]));
        service.deleteRoom(MOCK_ROOM_GAME.room.roomCode);
        expect(handleLeavingSocketsSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME.room.roomCode, MOCK_PLAYERS[0].playerInfo.userName);
        expect(service['playerSockets'].has(MOCK_ROOM_GAME.room.roomCode)).toBe(false);
    });

    it('should not call handleLeavingSockets if no players are in the room (empty array)', () => {
        service.deleteRoom('room1');
        const handleLeavingSocketsSpy = jest.spyOn(service, 'handleLeavingSockets');
        expect(handleLeavingSocketsSpy).not.toHaveBeenCalled();
        expect(service['playerSockets'].has('room1')).toBe(false);
    });

    it('should not call handleLeavingSockets if no players are in the room (null return)', () => {
        const handleLeavingSocketsSpy = jest.spyOn(service, 'handleLeavingSockets');
        service.deleteRoom('room1');
        expect(handleLeavingSocketsSpy).not.toHaveBeenCalled();
        expect(service['playerSockets'].has('room1')).toBe(false);
    });

    it('should set the gateway server correctly', () => {
        const mockGateway = Gateway.Game;
        const mockServer = new Server();
        service.setGatewayServer(mockGateway, mockServer);
        expect(service['servers'].get(mockGateway)).toBe(mockServer);
    });

    it('should return the correct server for the given gateway', () => {
        const mockServer = new Server();
        const gateway = Gateway.Game;
        service.setGatewayServer(gateway, mockServer);
        const returnedServer = service.getGatewayServer(gateway);
        expect(returnedServer).toBe(mockServer);
    });

    it('should not set roomCode if game socket is not found for a player', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const players = MOCK_PLAYERS;
        jest.spyOn(service, 'getPlayerSocket').mockReturnValue(undefined);
        service.setGameSocketsRoomCode(roomCode, players);
    });

    it('should set the roomCode for game sockets of all players', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const players = MOCK_PLAYERS;
        const mockSockets = players.map((player) => {
            return {
                data: {},
                id: `game-socket-${player.playerInfo.userName}`,
            } as unknown as Socket;
        });
        jest.spyOn(service, 'getPlayerSocket').mockImplementation((code, userName, gateway) => {
            if (gateway === Gateway.Game) {
                return mockSockets.find((socket) => socket.id.includes(userName));
            }
            return undefined;
        });
        service.setGameSocketsRoomCode(roomCode, players);
        players.forEach((player, index) => {
            expect(mockSockets[index].data.roomCode).toBe(roomCode);
        });
    });

    it('should return null if the socket does not match any player socket ids', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const playerName = MOCK_PLAYERS[0].playerInfo.userName;
        service['playerSockets'].set(roomCode, new Map([[playerName, MOCK_PLAYER_SOCKET_INDICES]]));
        const mockSocket: Socket = {
            id: MOCK_SOCKET_ID,
            rooms: new Set([roomCode]),
        } as Socket;
        const result = service.getSocketPlayerName(mockSocket);
        expect(result).toBeNull();
    });

    it('should return socket information with null values if socket is not in a room', () => {
        const mockSocket: Socket = {
            id: MOCK_SOCKET_ID,
            rooms: new Set(),
        } as Socket;
        jest.spyOn(service, 'getSocketRoom').mockReturnValue(null);
        jest.spyOn(service, 'getSocketPlayerName').mockReturnValue(null);
        const result = service.getSocketInformation(mockSocket);
        expect(result.room).toBeNull();
        expect(result.playerName).toBeNull();
    });

    it('should return false when room or player name is null', () => {
        const mockSocketInformation: SocketInformation = {
            room: MOCK_ROOM_GAME,
            playerName: null,
        };
        const result = service.isSocketCurrentPlayer(mockSocketInformation);
        expect(result).toBe(false);
    });
});
