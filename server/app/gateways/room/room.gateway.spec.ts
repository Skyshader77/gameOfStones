/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_MAPS, MOCK_PLAYER_SOCKET_INDICES, MOCK_PLAYERS, MOCK_ROOM, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomGateway } from './room.gateway';
import { GameStatus } from '@common/enums/game-status.enum';

describe('RoomGateway', () => {
    let gateway: RoomGateway;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let avatarManagerService: SinonStubbedInstance<AvatarManagerService>;
    let chatManagerService: SinonStubbedInstance<ChatManagerService>;
    let logger: SinonStubbedInstance<Logger>;
    let mockServer: SinonStubbedInstance<Server>;
    const mockRoomCode = MOCK_ROOM.roomCode;

    beforeEach(async () => {
        socketManagerService = createStubInstance(SocketManagerService);
        roomManagerService = createStubInstance(RoomManagerService);
        avatarManagerService = createStubInstance(AvatarManagerService);
        chatManagerService = createStubInstance(ChatManagerService);
        logger = createStubInstance(Logger);

        roomManagerService.getRoom.returns({ players: [] } as RoomGame);
        socketManagerService.getSocketRoomCode.returns(mockRoomCode);
        socketManagerService.getDisconnectedPlayerName.returns(MOCK_PLAYERS[0].playerInfo.userName);
        avatarManagerService.getTakenAvatarsByRoomCode.returns([]);

        mockServer = {
            to: stub().returnsThis(),
            emit: stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomGateway,
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: AvatarManagerService, useValue: avatarManagerService },
                { provide: ChatManagerService, useValue: chatManagerService },
                { provide: Logger, useValue: logger },
            ],
        }).compile();

        gateway = module.get<RoomGateway>(RoomGateway);
        gateway['server'] = mockServer;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should initialize the gateway server in the constructor', () => {
        const setGatewaySpy = jest.spyOn(socketManagerService, 'setGatewayServer');
        gateway = new RoomGateway(logger, roomManagerService, socketManagerService, chatManagerService, avatarManagerService);
        expect(setGatewaySpy).toBeCalledWith(Gateway.ROOM, gateway['server']);
    });

    it('should log a message when afterInit is called', () => {
        const logSpy = jest.spyOn(logger, 'log');
        gateway.afterInit();
        expect(logSpy).toBeCalledWith('room gateway initialized');
    });

    it('should handle creating a room', () => {
        const mockSocket = { id: 'socket1' } as Socket;
        const mockRoomId = MOCK_ROOM.roomCode;

        const initializeAvatarListSpy = jest.spyOn(avatarManagerService, 'initializeAvatarList');
        const assignNewRoomSpy = jest.spyOn(socketManagerService, 'assignNewRoom');
        const assignMapToRoomSpy = jest.spyOn(roomManagerService, 'assignMapToRoom');

        gateway.handleCreateRoom(mockSocket, { roomId: mockRoomId, map: MOCK_MAPS[0], avatar: Avatar.FemaleHealer });

        expect(initializeAvatarListSpy).toBeCalledWith(mockRoomId, Avatar.FemaleHealer, mockSocket.id);
        expect(assignNewRoomSpy).toBeCalledWith(mockRoomId);
        expect(assignMapToRoomSpy).toBeCalledWith(mockRoomId, MOCK_MAPS[0]);
    });

    it('should handle player creation opening', () => {
        const mockSocket = { id: 'socket1', data: { roomCode: MOCK_ROOM.roomCode }, join: stub(), emit: stub() } as unknown as Socket;

        const joinSpy = jest.spyOn(mockSocket, 'join');
        const setStartingAvatarSpy = jest.spyOn(avatarManagerService, 'setStartingAvatar');
        const sendAvatarDataSpy = jest.spyOn(gateway as any, 'sendAvatarData');

        roomManagerService.getRoom.returns({ room: { roomCode: mockRoomCode, isLocked: false }, players: [] } as RoomGame);

        gateway.handlePlayerCreationOpened(mockSocket, mockRoomCode);

        expect(joinSpy).toBeCalledWith(mockRoomCode);
        expect(setStartingAvatarSpy).toBeCalledWith(mockRoomCode, mockSocket.id);
        expect(sendAvatarDataSpy).toBeCalledWith(mockSocket, mockRoomCode);
    });

    it('should return early if room is not valid', () => {
        const mockSocket = {
            join: jest.fn(),
            data: {},
            emit: jest.fn(),
        } as unknown as Socket;

        const mockRoom = { players: [], room: { isLocked: false } } as unknown as RoomGame;

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);
        jest.spyOn(gateway as any, 'checkIfRoomIsValid').mockReturnValue(false);
        const setStartingAvatarSpy = jest.spyOn(avatarManagerService, 'setStartingAvatar');
        const sendAvatarDataSpy = jest.spyOn(gateway as any, 'sendAvatarData');

        gateway.handlePlayerCreationOpened(mockSocket, mockRoomCode);

        expect(roomManagerService.getRoom).toHaveBeenCalledWith(mockRoomCode);
        expect(gateway['checkIfRoomIsValid']).toHaveBeenCalledWith(mockSocket, mockRoom);
        expect(mockSocket.join).not.toHaveBeenCalled();
        expect(setStartingAvatarSpy).not.toHaveBeenCalled();
        expect(sendAvatarDataSpy).not.toHaveBeenCalled();
    });

    it('should handle desired avatar', () => {
        const mockSocket = { id: 'socket1', emit: stub() } as unknown as Socket;
        const desiredAvatar = Avatar.FemaleHealer;

        const toggleAvatarTakenSpy = jest.spyOn(avatarManagerService, 'toggleAvatarTaken');
        const sendAvatarDataSpy = jest.spyOn(gateway as any, 'sendAvatarData');

        jest.spyOn(socketManagerService, 'getSocketRoom').mockReturnValue(MOCK_ROOM_GAME);

        gateway.handleDesiredAvatar(mockSocket, desiredAvatar);

        expect(toggleAvatarTakenSpy).toBeCalledWith(mockRoomCode, desiredAvatar, mockSocket.id);
        expect(sendAvatarDataSpy).toBeCalledWith(mockSocket, mockRoomCode);
    });

    it('should return early if roomCode is undefined', () => {
        const mockSocket = { id: 'socket1' } as unknown as Socket;
        const mockAvatar = { id: 'avatar1' } as unknown as Avatar;

        jest.spyOn(socketManagerService, 'getSocketRoom').mockReturnValue(undefined);

        const toggleAvatarTakenSpy = jest.spyOn(avatarManagerService, 'toggleAvatarTaken');
        const sendAvatarDataSpy = jest.spyOn(gateway as any, 'sendAvatarData');

        gateway['handleDesiredAvatar'](mockSocket, mockAvatar);

        expect(socketManagerService.getSocketRoom).toHaveBeenCalledWith(mockSocket);
        expect(toggleAvatarTakenSpy).not.toHaveBeenCalled();
        expect(sendAvatarDataSpy).not.toHaveBeenCalled();
    });

    it('should handle player creation closing', () => {
        const mockSocket = { id: 'socket1', leave: stub() } as unknown as Socket;
        const leaveSpy = jest.spyOn(mockSocket, 'leave');
        const removeSocketSpy = jest.spyOn(avatarManagerService, 'removeSocket');

        gateway.handlePlayerCreationClosed(mockSocket, mockRoomCode);

        expect(leaveSpy).toBeCalledWith(mockRoomCode);
        expect(removeSocketSpy).toBeCalledWith(mockRoomCode, mockSocket.id);
        expect(mockServer.to.called).toBeTruthy();
    });

    it('should handle a player leaving a room', () => {
        const mockSocket = { id: 'socket1' } as Socket;

        const playerName = MOCK_PLAYERS[0].playerInfo.userName;
        socketManagerService.getSocketPlayerName.returns(playerName);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const playerLeavingCleanUpSpy = jest.spyOn(gateway as any, 'playerLeavingCleanUp').mockImplementation(() => {});

        gateway.handleLeaveRoom(mockSocket);

        expect(playerLeavingCleanUpSpy).toBeCalledWith(mockRoomCode, playerName, mockSocket);
    });

    it('should handle kicking a player', () => {
        const mockSocket = { id: 'socket1' } as Socket;
        const mockSocket2 = { id: 'socket2' } as Socket;
        const playerNameToKick = MOCK_PLAYERS[1].playerInfo.userName;
        const kickerName = MOCK_PLAYERS[0].playerInfo.userName; // Assuming the first player is the kicker

        // Setup mock data to return a room with the kicker as an organizer
        socketManagerService.getSocketRoom.returns({
            room: { ...MOCK_ROOM, roomCode: mockRoomCode },
            players: [
                { playerInfo: { userName: kickerName, role: PlayerRole.Organizer } },
                { playerInfo: { userName: playerNameToKick, role: PlayerRole.Human } },
            ],
        } as RoomGame);

        socketManagerService.getSocketPlayerName.returns(kickerName);
        socketManagerService.getPlayerSocket.returns(mockSocket2);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const playerLeavingCleanUpSpy = jest.spyOn(gateway as any, 'playerLeavingCleanUp').mockImplementation(() => {});

        gateway.desireKickPlayer(mockSocket, playerNameToKick);

        expect(playerLeavingCleanUpSpy).toBeCalledWith(mockRoomCode, playerNameToKick, mockSocket2);
    });

    it('should handle socket connection', () => {
        const mockSocket = { id: 'socket1' } as Socket;
        const registerSocketSpy = jest.spyOn(socketManagerService, 'registerSocket');

        gateway.handleConnection(mockSocket);

        expect(registerSocketSpy).toBeCalledWith(mockSocket);
    });

    it('should handle socket disconnection', () => {
        const mockSocket = { id: 'socket1', data: { roomCode: mockRoomCode } } as Socket;
        const playerName = MOCK_PLAYERS[0].playerInfo.userName;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const playerLeavingCleanUpSpy = jest.spyOn(gateway as any, 'playerLeavingCleanUp').mockImplementation(() => {});

        gateway.handleDisconnect(mockSocket);

        expect(playerLeavingCleanUpSpy).toBeCalledWith(mockRoomCode, playerName, mockSocket);
    });

    it('should handle player joining a room and emit necessary events', () => {
        const mockSocket = { id: 'socket1', data: {}, emit: jest.fn() } as unknown as Socket;
        const data = {
            roomId: MOCK_ROOM_GAME.room.roomCode,
            playerSocketIndices: MOCK_PLAYER_SOCKET_INDICES,
            player: { playerInfo: { userName: 'JohnDoe' } } as Player,
        };

        const room = MOCK_ROOM_GAME;
        const originalUserName = 'JohnDoe';
        const uniqueUserName = 'JohnDoe1';

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME);
        const checkIfRoomIsValidSpy = jest.spyOn(gateway as any, 'checkIfRoomIsValid').mockReturnValue(true);
        const generateUniquePlayerNameSpy = jest.spyOn(gateway as any, 'generateUniquePlayerName').mockReturnValue(uniqueUserName);
        const addPlayerToRoomSpy = jest.spyOn(roomManagerService, 'addPlayerToRoom');
        const handleJoiningSocketsSpy = jest.spyOn(socketManagerService, 'handleJoiningSockets');
        const handleJoiningSocketEmissionsSpy = jest.spyOn(roomManagerService, 'handleJoiningSocketEmissions');
        const getPlayerSocketSpy = jest.spyOn(socketManagerService, 'getPlayerSocket');
        const sendChatHistorySpy = jest.spyOn(chatManagerService, 'sendChatHistory');

        const chatSocket = { emit: jest.fn() } as unknown as Socket;
        getPlayerSocketSpy.mockReturnValue(chatSocket);

        gateway['handleDesireJoinRoom'](mockSocket, data);

        expect(checkIfRoomIsValidSpy).toBeCalledWith(mockSocket, room);

        expect(generateUniquePlayerNameSpy).toBeCalledWith(room, originalUserName);
        expect(data.player.playerInfo.userName).toBe(uniqueUserName); // Username should be updated

        expect(mockSocket.data.roomCode).toBe(data.roomId);

        expect(addPlayerToRoomSpy).toBeCalledWith(data.roomId, data.player);

        expect(handleJoiningSocketsSpy).toBeCalledWith(data.roomId, uniqueUserName, data.playerSocketIndices);

        expect(handleJoiningSocketEmissionsSpy).toBeCalledWith({
            server: gateway['server'],
            socket: mockSocket,
            player: data.player,
            roomId: data.roomId,
        });

        expect(getPlayerSocketSpy).toBeCalledWith(data.roomId, uniqueUserName, Gateway.MESSAGING);
        expect(sendChatHistorySpy).toBeCalledWith(chatSocket, data.roomId);
    });

    it('should return early if checkIfRoomIsValid returns false', () => {
        const mockSocket = { data: {}, id: 'socket1' } as unknown as Socket;
        const mockData = {
            roomId: 'room1',
            playerSocketIndices: MOCK_PLAYER_SOCKET_INDICES,
            player: { playerInfo: { userName: 'testPlayer' } } as unknown as Player,
        };

        jest.spyOn(gateway as any, 'checkIfRoomIsValid').mockReturnValue(false);

        const generateUniquePlayerNameSpy = jest.spyOn(gateway as any, 'generateUniquePlayerName');
        const addPlayerToRoomSpy = jest.spyOn(roomManagerService, 'addPlayerToRoom');
        const handleJoiningSocketsSpy = jest.spyOn(socketManagerService, 'handleJoiningSockets');
        const handleJoiningSocketEmissionsSpy = jest.spyOn(roomManagerService, 'handleJoiningSocketEmissions');
        const getPlayerSocketSpy = jest.spyOn(socketManagerService, 'getPlayerSocket');
        const sendChatHistorySpy = jest.spyOn(chatManagerService, 'sendChatHistory');

        gateway.handleDesireJoinRoom(mockSocket, mockData);

        expect(gateway['checkIfRoomIsValid']).toHaveBeenCalledWith(mockSocket, expect.any(Object));
        expect(generateUniquePlayerNameSpy).not.toHaveBeenCalled();
        expect(addPlayerToRoomSpy).not.toHaveBeenCalled();
        expect(handleJoiningSocketsSpy).not.toHaveBeenCalled();
        expect(handleJoiningSocketEmissionsSpy).not.toHaveBeenCalled();
        expect(getPlayerSocketSpy).not.toHaveBeenCalled();
        expect(sendChatHistorySpy).not.toHaveBeenCalled();
    });

    it('should toggle room lock when the organizer requests it', () => {
        const mockSocket = { id: 'socket1', emit: jest.fn() } as unknown as Socket;
        const data = { roomId: 'room123' };

        const room = {
            room: { isLocked: false },
            players: [{ playerInfo: { userName: 'Organizer', role: PlayerRole.Organizer } }],
        } as RoomGame;

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);
        const isPlayerLimitReachedSpy = jest.spyOn(roomManagerService, 'isPlayerLimitReached').mockReturnValue(false);
        const getSocketPlayerNameSpy = jest.spyOn(socketManagerService, 'getSocketPlayerName').mockReturnValue('Organizer');
        const toggleIsLockedSpy = jest.spyOn(roomManagerService, 'toggleIsLocked').mockImplementation(() => {
            room.room.isLocked = !room.room.isLocked;
        });

        gateway.handleToggleRoomLock(mockSocket, data);

        expect(roomManagerService.getRoom).toBeCalledWith(data.roomId);
        expect(isPlayerLimitReachedSpy).toBeCalledWith(data.roomId);

        expect(getSocketPlayerNameSpy).toBeCalledWith(mockSocket);
        expect(room.players[0].playerInfo.userName).toBe('Organizer');
        expect(room.players[0].playerInfo.role).toBe(PlayerRole.Organizer);

        expect(toggleIsLockedSpy).toBeCalledWith(room.room);
        expect(mockServer.to.called).toBeTruthy();
    });

    it('should return early if player limit is reached', () => {
        const mockSocket = { emit: jest.fn() } as unknown as Socket;
        const mockRoomId = 'testRoomId';

        const mockRoom = { players: [], room: { isLocked: false } } as unknown as RoomGame;

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);
        jest.spyOn(roomManagerService, 'isPlayerLimitReached').mockReturnValue(true);
        const getSocketPlayerNameSpy = jest.spyOn(socketManagerService, 'getSocketPlayerName');
        const toggleIsLockedSpy = jest.spyOn(roomManagerService, 'toggleIsLocked');

        gateway.handleToggleRoomLock(mockSocket, { roomId: mockRoomId });

        expect(roomManagerService.getRoom).toHaveBeenCalledWith(mockRoomId);
        expect(roomManagerService.isPlayerLimitReached).toHaveBeenCalledWith(mockRoomId);
        expect(getSocketPlayerNameSpy).not.toHaveBeenCalled();
        expect(toggleIsLockedSpy).not.toHaveBeenCalled();
        expect(mockServer.to.called).toBeFalsy();
    });

    it('should clean up when a player leaves', () => {
        const playerName = 'JohnDoe';
        const mockSocket = { id: 'socket1' } as unknown as Socket;

        const disconnectPlayerSpy = jest.spyOn(gateway as any, 'disconnectPlayer');
        const removeSocketSpy = jest.spyOn(avatarManagerService, 'removeSocket');

        const availableAvatars = [true, true];

        const player = { playerInfo: { userName: playerName, role: PlayerRole.Organizer } } as Player;

        const room = { room: { roomCode: mockRoomCode }, players: [player], game: { status: GameStatus.Waiting } } as RoomGame;

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);
        avatarManagerService.getTakenAvatarsByRoomCode.returns(availableAvatars);

        gateway['playerLeavingCleanUp'](mockRoomCode, playerName, mockSocket);

        expect(disconnectPlayerSpy).toBeCalledWith(mockRoomCode, playerName);
        expect(removeSocketSpy).toBeCalledWith(mockRoomCode, mockSocket.id);
        expect(mockServer.to.called).toBeTruthy();
    });

    it('should send avatar data to a player', () => {
        const mockSocket = { id: 'socket1', emit: jest.fn() } as unknown as Socket;
        const roomId = mockRoomCode;

        const avatarList = [true, true];

        jest.spyOn(avatarManagerService, 'getAvatarBySocketId').mockReturnValue(Avatar.FemaleHealer);
        jest.spyOn(avatarManagerService, 'getTakenAvatarsByRoomCode').mockReturnValue(avatarList);

        gateway['sendAvatarData'](mockSocket, roomId);

        expect(mockSocket.emit).toBeCalledWith(RoomEvents.AvatarSelected, Avatar.FemaleHealer);
        expect(mockServer.to.called).toBeTruthy();
    });

    it('should handle player disconnection correctly', () => {
        const roomCode = 'room123';
        const organizerName = 'organizerName';
        const humanName = 'playerName';

        const organizerPlayer = { playerInfo: { userName: organizerName, role: PlayerRole.Organizer } } as Player;
        const regularPlayer = { playerInfo: { userName: humanName, role: PlayerRole.Human } } as Player;

        // const room = { room: { roomCode }, players: [organizerPlayer] } as RoomGame;

        // jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);
        jest.spyOn(roomManagerService, 'getPlayerInRoom').mockReturnValue(organizerPlayer);
        const isPlayerLimitReachedSpy = jest.spyOn(roomManagerService, 'isPlayerLimitReached').mockReturnValue(true);
        const deleteRoomSpy = jest.spyOn(roomManagerService, 'deleteRoom');
        const deleteSocketRoomSpy = jest.spyOn(socketManagerService, 'deleteRoom');
        const removePlayerSpy = jest.spyOn(roomManagerService, 'removePlayerFromRoom');
        const handleLeavingSocketsSpy = jest.spyOn(socketManagerService, 'handleLeavingSockets');

        gateway['disconnectPlayer'](roomCode, organizerName);

        // expect(roomManagerService.getRoom).toBeCalledWith(roomCode);
        expect(roomManagerService.getPlayerInRoom).toBeCalledWith(roomCode, organizerName);

        expect(isPlayerLimitReachedSpy).toBeCalledWith(roomCode);
        expect(mockServer.to.called).toBeTruthy();

        expect(mockServer.to.called).toBeTruthy();
        expect(deleteRoomSpy).toBeCalledWith(roomCode);
        expect(deleteSocketRoomSpy).toBeCalledWith(roomCode);

        expect(handleLeavingSocketsSpy).toBeCalledWith(roomCode, organizerName);

        jest.clearAllMocks();
        jest.spyOn(roomManagerService, 'getPlayerInRoom').mockReturnValue(regularPlayer);

        gateway['disconnectPlayer'](roomCode, humanName);

        expect(removePlayerSpy).toBeCalledWith(roomCode, humanName);
        expect(mockServer.to.called).toBeTruthy();
        expect(handleLeavingSocketsSpy).toBeCalledWith(roomCode, humanName);
    });

    it('should generate a unique player name', () => {
        const baseName = 'Player';
        const room = {
            players: [{ playerInfo: { userName: 'Player' } }, { playerInfo: { userName: 'Player-1' } }, { playerInfo: { userName: 'Player-2' } }],
        } as unknown as RoomGame;

        const uniqueName = 'UniquePlayer';
        const uniqueRoom = { players: [] } as unknown as RoomGame;
        const result1 = gateway['generateUniquePlayerName'](uniqueRoom, uniqueName);
        expect(result1).toBe(uniqueName);

        const result2 = gateway['generateUniquePlayerName'](room, baseName);
        expect(result2).toBe('Player-3');
    });

    it('should check if room is valid and handle errors appropriately', () => {
        const mockSocket = { emit: jest.fn() } as unknown as Socket;

        // Case 1: Room does not exist
        let result = gateway['checkIfRoomIsValid'](mockSocket, null);
        expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.JoinError, JoinErrors.RoomDeleted);
        expect(result).toBe(false);

        jest.clearAllMocks();

        // Case 2: Room is locked
        const lockedRoom = { room: { isLocked: true } } as unknown as RoomGame;
        result = gateway['checkIfRoomIsValid'](mockSocket, lockedRoom);
        expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.JoinError, JoinErrors.RoomLocked);
        expect(result).toBe(false);

        jest.clearAllMocks();

        // Case 3: Room is valid
        const validRoom = { room: { isLocked: false } } as unknown as RoomGame;
        result = gateway['checkIfRoomIsValid'](mockSocket, validRoom);
        expect(mockSocket.emit).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
