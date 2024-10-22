import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger } from '@nestjs/common';
import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
import { Socket, Server, BroadcastOperator } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatMessage } from '@app/interfaces/chatMessage';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
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

    it('joinRoom() should join the socket room', () => {
        gateway.joinRoom(socket);
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('roomMessage() should not send message if socket not in the room', () => {
        const chatMessage: ChatMessage = {
            author: 'UserX',
            message: 'Hello, World!',
            date: new Date(),
        };
        stub(socket, 'rooms').value(new Set());
        gateway.roomMessage(socket, chatMessage);
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        const chatMessage: ChatMessage = {
            author: 'UserX',
            message: 'Hello, World!',
            date: new Date(),
        };
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ChatEvents.RoomChatMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.roomMessage(socket, chatMessage);
    });

    it('afterInit() should emit time after 1s', () => {
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(server.emit.calledWith(ChatEvents.Clock, match.any)).toBeTruthy();
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(ChatEvents.Hello, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });
});
