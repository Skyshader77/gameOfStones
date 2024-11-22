import { TestBed } from '@angular/core/testing';
import { ChatMessage } from '@common/interfaces/message';
import { Subject } from 'rxjs';
import { ChatListService } from './chat-list.service';
import { MessagingSocketService } from '../communication-services/messaging-socket/messaging-socket.service';

describe('ChatListService', () => {
    let service: ChatListService;
    let chatSocketServiceSpy: jasmine.SpyObj<MessagingSocketService>;
    let messageSubject: Subject<ChatMessage>;
    let historySubject: Subject<ChatMessage[]>;

    beforeEach(() => {
        messageSubject = new Subject<ChatMessage>();
        historySubject = new Subject<ChatMessage[]>();

        chatSocketServiceSpy = jasmine.createSpyObj('MessagingSocketService', {
            listenToChatHistory: historySubject.asObservable(),
            listenToChatMessage: messageSubject.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [ChatListService, { provide: MessagingSocketService, useValue: chatSocketServiceSpy }],
        });

        service = TestBed.inject(ChatListService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with an empty messages array', () => {
        expect(service.messages.length).toBe(0);
    });

    it('should set messages when chat history is received', () => {
        const historyMessages: ChatMessage[] = [
            { message: { content: 'New message 1', time: new Date() }, author: 'User1' },
            { message: { content: 'New message 2', time: new Date() }, author: 'User2' },
        ];

        service.initializeChat();

        historySubject.next(historyMessages);

        expect(service.messages.length).toBe(2);
        expect(service.messages).toEqual(historyMessages);
    });

    it('should push new messages to messages array', () => {
        const newMessage: ChatMessage = { message: { content: 'New message', time: new Date() }, author: 'User3' };

        service.initializeChat();

        messageSubject.next(newMessage);

        expect(service.messages.length).toBe(1);
        expect(service.messages[0]).toEqual(newMessage);
    });

    it('should clean up subscriptions when cleanup is called', () => {
        service.initializeChat();

        service.cleanup();
        expect(chatSocketServiceSpy.listenToChatHistory).toHaveBeenCalled();
        expect(chatSocketServiceSpy.listenToChatMessage).toHaveBeenCalled();
    });
});
