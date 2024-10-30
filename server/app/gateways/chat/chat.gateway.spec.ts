import { MOCK_ROOM } from '@app/constants/test.constants';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service'; // Import SocketManagerService
import { ChatMessage } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './chat.gateway.constants';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let chatManagerService: SinonStubbedInstance<ChatManagerService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        socketManagerService = createStubInstance(SocketManagerService);
        chatManagerService = createStubInstance(ChatManagerService);

        socketManagerService.setGatewayServer = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
                { provide: ChatManagerService, useValue: chatManagerService },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('validate() message should take account word length', () => {
        const testCases = [
            { word: undefined, isValid: false },
            { word: 'XXXX', isValid: false },
            { word: 'XXXXXX', isValid: true },
            { word: 'XXXXXXX', isValid: true },
        ];
        for (const { word, isValid } of testCases) {
            gateway.validate(socket, word);
            expect(socket.emit.calledWith(ChatEvents.WordValidated, isValid)).toBeTruthy();
        }
    });

    it('validateWithAck() message should take account word length ', () => {
        const testCases = [
            { word: undefined, isValid: false },
            { word: 'XXXX', isValid: false },
            { word: 'XXXXXX', isValid: true },
            { word: 'XXXXXXX', isValid: true },
        ];
        for (const { word, isValid } of testCases) {
            const res = gateway.validateWithAck(socket, word);
            expect(res.isValid).toEqual(isValid);
        }
    });

    it('roomMessage() should not send message if socket not in the room', () => {
        const chatMessage: ChatMessage = {
            message: { message: 'Hello, World!', time: new Date() },
            author: 'UserX',
        };
        stub(socket, 'rooms').value(new Set());
        gateway.desiredChatMessage(socket, chatMessage);
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        const chatMessage: ChatMessage = {
            author: 'UserX',
            message: { message: 'Hello, World!', time: new Date() },
        };
        stub(socket, 'rooms').value(new Set([MOCK_ROOM.roomCode]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ChatEvents.DesiredChatMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.desiredChatMessage(socket, chatMessage);
    });

    it('afterInit() should emit time after 1s', () => {
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(server.emit.calledWith(ChatEvents.Clock, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
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
        gateway.sendChatHistory(mockMessages, socket, MOCK_ROOM.roomCode);
        expect(socket.emit.calledOnceWith(ChatEvents.ChatHistory, mockMessages)).toBeTruthy();
    });

    it('should not emit chat history when messages array is empty', () => {
        const mockMessages: ChatMessage[] = [];

        gateway.sendChatHistory(mockMessages, socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeFalsy();
    });

    it('should not emit chat history when messages are undefined', () => {
        gateway.sendChatHistory(undefined, socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeFalsy();
    });
});
