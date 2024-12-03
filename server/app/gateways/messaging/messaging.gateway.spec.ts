import { MOCK_ATTACK_RESULT, MOCK_ROOM_COMBAT } from '@app/constants/combat.test.constants';
import { MOCK_JOURNAL_LOG } from '@app/constants/journal-test.constants';
import { MOCK_MESSAGES, MOCK_ROOM, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { JournalManagerService } from '@app/services/journal-manager/journal-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { MessagingEvents } from '@common/enums/sockets-events/messaging.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

describe('MessagingGateway', () => {
    let gateway: MessagingGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: sinon.SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let chatManagerService: SinonStubbedInstance<ChatManagerService>;
    let journalManagerService: SinonStubbedInstance<JournalManagerService>;
    let errorMessageService: SinonStubbedInstance<ErrorMessageService>;
    const emitStub = sinon.stub();

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = {
            to: sinon.stub().returns({ emit: emitStub }),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        const serverEmitStub = sinon.stub();
        server = {
            to: sinon.stub().returns({
                emit: serverEmitStub,
            }),
            emit: sinon.stub(),
        } as unknown as SinonStubbedInstance<Server>;
        socketManagerService = createStubInstance(SocketManagerService);
        chatManagerService = createStubInstance(ChatManagerService);
        journalManagerService = createStubInstance(JournalManagerService);
        errorMessageService = createStubInstance(ErrorMessageService);

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
                { provide: ErrorMessageService, useValue: errorMessageService },
            ],
        }).compile();

        gateway = module.get<MessagingGateway>(MessagingGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('roomMessage() should send message if socket in the room', () => {
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.desiredChatMessage(socket, MOCK_MESSAGES[0]);
        expect(server.to.called).toBeTruthy();
    });

    it('sendPublicJournal() should add message to journal', () => {
        journalManagerService.generateJournal.returns(MOCK_JOURNAL_LOG);
        journalManagerService.addJournalToRoom.returns();
        gateway.sendGenericPublicJournal(MOCK_ROOM_GAME, JournalEntry.TurnStart);
        expect(server.to.called).toBeTruthy();
    });

    it('should not emit journal if generateJournal returns null in sendPublicJournal', () => {
        const mockRoom = MOCK_ROOM_GAME;
        const mockJournalType = JournalEntry.PlayerWin;

        jest.spyOn(journalManagerService, 'generateJournal').mockReturnValue(null);
        jest.spyOn(journalManagerService, 'addJournalToRoom').mockImplementation();

        const emitSpy = jest.spyOn(server, 'to');

        gateway.sendGenericPublicJournal(mockRoom, mockJournalType);

        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit journal if generateJournal returns null in sendPrivateJournal', () => {
        const mockRoom = MOCK_ROOM_GAME;
        const mockJournalType = JournalEntry.PlayerWin;

        jest.spyOn(journalManagerService, 'generateJournal').mockReturnValue(null);
        jest.spyOn(journalManagerService, 'addJournalToRoom').mockImplementation();

        const socketEmitSpy = jest.spyOn(socketManagerService, 'getPlayerSocket').mockReturnValue(null);

        gateway.sendGenericPrivateJournal(mockRoom, mockJournalType);
        expect(socketEmitSpy).not.toHaveBeenCalled();
    });

    it('sendAbandonJournal() should add message to journal', () => {
        journalManagerService.addJournalToRoom.returns();
        journalManagerService.abandonJournal.returns(MOCK_JOURNAL_LOG);
        gateway.sendAbandonJournal(MOCK_ROOM_GAME, 'Othmane');
        expect(server.to.called).toBeTruthy();
    });

    it('sendPrivateJournal() should be send to all players involved', () => {
        journalManagerService.addJournalToRoom.returns();
        journalManagerService.generateJournal.returns(MOCK_JOURNAL_LOG);
        socketManagerService.getPlayerSocket.returns(socket);
        gateway.sendGenericPrivateJournal(MOCK_ROOM_COMBAT, JournalEntry.TurnStart);
        expect(socket.emit.callCount).toEqual(2);
    });

    it('sendAttackResultJournal should be send to all players in combat', () => {
        journalManagerService.addJournalToRoom.returns();
        journalManagerService.fightAttackResultJournal.returns(MOCK_JOURNAL_LOG);
        socketManagerService.getPlayerSocket.returns(socket);
        gateway.sendAttackResultJournal(MOCK_ROOM_COMBAT, MOCK_ATTACK_RESULT);
        expect(socket.emit.callCount).toEqual(2);
    });

    it('sendEvasionResultJournal should be send to all players in combat', () => {
        journalManagerService.addJournalToRoom.returns();
        journalManagerService.fightEvadeResultJournal.returns(MOCK_JOURNAL_LOG);
        socketManagerService.getPlayerSocket.returns(socket);
        gateway.sendEvasionResultJournal(MOCK_ROOM_COMBAT, true);
        expect(socket.emit.callCount).toEqual(2);
    });

    it('socket disconnection should unregister', () => {
        gateway.handleDisconnect(socket);
        sinon.assert.called(socketManagerService.unregisterSocket);
    });

    it('socket connection should register', () => {
        gateway.handleConnection(socket);
        sinon.assert.called(socketManagerService.registerSocket);
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

    it('should call errorMessageService.gatewayError if an error is thrown', () => {
        const mockError = new Error('Test error');
        socketManagerService.getSocketRoomCode.throws(mockError); // Simulate an error

        const spy = jest.spyOn(errorMessageService, 'gatewayError');

        const testMessage = {
            message: { content: 'Test message', time: new Date() },
            author: 'TestUser',
        };

        gateway.desiredChatMessage(socket, testMessage);

        expect(spy).toHaveBeenCalledWith(Gateway.Messaging, MessagingEvents.DesiredChatMessage, mockError);
    });

    it('should generate an item pickup journal and send it as a public journal', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockItem = ItemType.BismuthShield;
        const mockJournal = MOCK_JOURNAL_LOG;

        jest.spyOn(journalManagerService, 'itemPickUpJournal').mockReturnValue(mockJournal);
        const sendPublicJournalSpy = jest.spyOn(gateway as any, 'sendPublicJournal');

        gateway.sendItemPickupJournal(mockRoom, mockItem);

        expect(journalManagerService.itemPickUpJournal).toHaveBeenCalledWith(mockRoom, mockItem);
        expect(sendPublicJournalSpy).toHaveBeenCalledWith(mockRoom, mockJournal);
    });
});
