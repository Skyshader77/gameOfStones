import { Test, TestingModule } from '@nestjs/testing';
import { ChatManagerService } from './chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { MessagingEvents } from '@common/interfaces/sockets.events/messaging.events';
import { MOCK_ROOM, MOCK_MESSAGES, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { RoomGame } from '@app/interfaces/room-game';

type SocketStub = SinonStubbedInstance<Socket>;

describe('RoomManagerService', () => {
    let service: ChatManagerService;
    let roomManagerSpy: SinonStubbedInstance<RoomManagerService>;
    let socket: SocketStub;

    beforeEach(async () => {
        roomManagerSpy = createStubInstance(RoomManagerService);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatManagerService, { provide: RoomManagerService, useValue: roomManagerSpy }],
        }).compile();

        service = module.get<ChatManagerService>(ChatManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should emit chat history when messages exist', () => {
        roomManagerSpy.getRoom.returns({ chatList: MOCK_MESSAGES } as RoomGame);

        service.sendChatHistory(socket as unknown as Socket, MOCK_ROOM.roomCode);
        expect(socket.emit.calledOnceWith(MessagingEvents.ChatHistory, MOCK_MESSAGES)).toBeTruthy();
    });

    it('should not emit chat history when messages array is empty', () => {
        roomManagerSpy.getRoom.returns({ chatList: [] } as RoomGame);

        service.sendChatHistory(socket as unknown as Socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeFalsy();
    });

    it('should not emit chat history when messages are undefined', () => {
        roomManagerSpy.getRoom.returns({ chatList: undefined } as RoomGame);
        service.sendChatHistory(socket as unknown as Socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeFalsy();
    });

    it('should add a chat message to the room chat list', () => {
        roomManagerSpy.getRoom.returns(MOCK_ROOM_GAME as RoomGame);
        service.addChatMessageToRoom(MOCK_MESSAGES[0], MOCK_ROOM.roomCode);
        expect(MOCK_ROOM_GAME.chatList).toContain(MOCK_MESSAGES[0]);
    });
});
