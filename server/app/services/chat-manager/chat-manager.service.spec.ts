import { Test, TestingModule } from '@nestjs/testing';
import { ChatManagerService } from './chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ChatMessage } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { MOCK_ROOM } from '@app/constants/test.constants';
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
        const mockMessages: ChatMessage[] = [
            {
                author: 'Othmane',
                message: { message: 'Othmane is love', time: new Date() },
            },
            {
                author: 'Jerome Collin',
                message: { message: 'Hi there', time: new Date() },
            },
        ];
        roomManagerSpy.getRoom.returns({ chatList: mockMessages } as RoomGame);

        service.sendChatHistory(socket as unknown as Socket, MOCK_ROOM.roomCode);
        expect(socket.emit.calledOnceWith(ChatEvents.ChatHistory, mockMessages)).toBeTruthy();
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
});
