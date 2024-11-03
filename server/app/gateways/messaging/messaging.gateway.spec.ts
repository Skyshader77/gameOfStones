import { MOCK_ROOM } from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { JournalManagerService } from '@app/services/journal-manager/journal-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service'; // Import SocketManagerService
import { ChatMessage } from '@common/interfaces/message';
import { MessagingEvents } from '@common/interfaces/sockets.events/messaging.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('MessagingGateway', () => {
    let gateway: MessagingGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let chatManagerService: SinonStubbedInstance<ChatManagerService>;
    let journalManagerService: SinonStubbedInstance<JournalManagerService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        socketManagerService = createStubInstance(SocketManagerService);
        chatManagerService = createStubInstance(ChatManagerService);
        journalManagerService = createStubInstance(JournalManagerService);

        socketManagerService.setGatewayServer = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
                { provide: ChatManagerService, useValue: chatManagerService },
                { provide: JournalManagerService, useValue: journalManagerService },
            ],
        }).compile();

        gateway = module.get<MessagingGateway>(MessagingGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // it('validate() message should take account word length', () => {
    //     const testCases = [
    //         { word: undefined, isValid: false },
    //         { word: 'XXXX', isValid: false },
    //         { word: 'XXXXXX', isValid: true },
    //         { word: 'XXXXXXX', isValid: true },
    //     ];
    //     for (const { word, isValid } of testCases) {
    //         gateway.validate(socket, word);
    //         expect(socket.emit.calledWith(MessagingEvents.WordValidated, isValid)).toBeTruthy();
    //     }
    // });

    // it('validateWithAck() message should take account word length ', () => {
    //     const testCases = [
    //         { word: undefined, isValid: false },
    //         { word: 'XXXX', isValid: false },
    //         { word: 'XXXXXX', isValid: true },
    //         { word: 'XXXXXXX', isValid: true },
    //     ];
    //     for (const { word, isValid } of testCases) {
    //         const res = gateway.validateWithAck(socket, word);
    //         expect(res.isValid).toEqual(isValid);
    //     }
    // });

    it('roomMessage() should not send message if socket not in the room', () => {
        const chatMessage: ChatMessage = {
            message: { content: 'Hello, World!', time: new Date() },
            author: 'UserX',
        };
        stub(socket, 'rooms').value(new Set());
        gateway.desiredChatMessage(socket, chatMessage);
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        const chatMessage: ChatMessage = {
            author: 'UserX',
            message: { content: 'Hello, World!', time: new Date() },
        };
        stub(socket, 'rooms').value(new Set([MOCK_ROOM.roomCode]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MessagingEvents.DesiredChatMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.desiredChatMessage(socket, chatMessage);
    });

    // it('afterInit() should emit time after 1s', () => {
    //     jest.useFakeTimers();
    //     gateway.afterInit();
    //     jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
    //     expect(server.emit.calledWith(MessagingEvents.Clock, match.any)).toBeTruthy();
    // });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should emit chat history when messages exist', () => {
        chatManagerService.fetchOlderMessages.returns([{ message: { content: 'Whaat', time: new Date() }, author: 'Othmane' }]);
        gateway.sendChatHistory(socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeTruthy();
    });

    it('should not emit chat history when messages array is empty', () => {
        gateway.sendChatHistory(socket, MOCK_ROOM.roomCode);
        expect(socket.emit.called).toBeFalsy();
    });

    it('should not emit chat history when roomCode is undefined', () => {
        gateway.sendChatHistory(socket, undefined);
        expect(socket.emit.called).toBeFalsy();
    });
});
