import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service'; // Import SocketManagerService
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        socketManagerService = createStubInstance(SocketManagerService);

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
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // Assign the stubbed server instance
        // eslint-disable-next-line dot-notation
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

    it('broadcastAll() should send a mass message to the server', () => {
        gateway.broadcastAll(socket, 'X');
        expect(server.emit.calledWith(ChatEvents.MassMessage, match.any)).toBeTruthy();
    });

    it('joinRoom() should join the socket room', () => {
        gateway.joinRoom(socket);
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('roomMessage() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.roomMessage(socket, 'X');
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.roomMessage(socket, 'X');
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
