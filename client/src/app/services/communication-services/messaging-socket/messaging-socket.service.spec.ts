import { TestBed } from '@angular/core/testing';
import { MOCK_JOURNAL_LOG } from '@app/constants/tests.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { MessagingEvents } from '@common/enums/sockets-events/messaging.events';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { of } from 'rxjs';
import { MessagingSocketService } from './messaging-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';

describe('MessagingSocketService', () => {
    let service: MessagingSocketService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('SocketService', ['emit', 'on']);

        TestBed.configureTestingModule({
            providers: [MessagingSocketService, { provide: SocketService, useValue: spy }],
        });

        service = TestBed.inject(MessagingSocketService);
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('sendMessage', () => {
        it('should emit the correct chat message', () => {
            const author = 'testUser';
            const message = 'Hello, World!';
            const expectedMessage = {
                author,
                message: {
                    content: message,
                    time: jasmine.any(Date),
                },
            };

            service.sendMessage(author, message);
            expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Messaging, MessagingEvents.DesiredChatMessage, expectedMessage);
        });
    });

    describe('listenToChatMessage', () => {
        it('should return an observable for chat messages', () => {
            const chatMessage: ChatMessage = { author: 'testUser', message: { content: 'Hello', time: new Date() } };
            socketServiceSpy.on.and.returnValue(of(chatMessage));

            service.listenToChatMessage().subscribe((message) => {
                expect(message).toEqual(chatMessage);
            });

            expect(socketServiceSpy.on).toHaveBeenCalledWith(Gateway.Messaging, MessagingEvents.ChatMessage);
        });
    });

    describe('listenToChatHistory', () => {
        it('should return an observable for chat history', () => {
            const chatHistory: ChatMessage[] = [
                { author: 'user1', message: { content: 'Hello', time: new Date() } },
                { author: 'user2', message: { content: 'Hi', time: new Date() } },
            ];
            socketServiceSpy.on.and.returnValue(of(chatHistory));

            service.listenToChatHistory().subscribe((history) => {
                expect(history).toEqual(chatHistory);
            });

            expect(socketServiceSpy.on).toHaveBeenCalledWith(Gateway.Messaging, MessagingEvents.ChatHistory);
        });
    });

    describe('listenToJournal', () => {
        it('should return an observable for journal logs', () => {
            const journalLog: JournalLog = MOCK_JOURNAL_LOG;
            socketServiceSpy.on.and.returnValue(of(journalLog));

            service.listenToJournal().subscribe((log) => {
                expect(log).toEqual(journalLog);
            });

            expect(socketServiceSpy.on).toHaveBeenCalledWith(Gateway.Messaging, MessagingEvents.JournalLog);
        });
    });
});
