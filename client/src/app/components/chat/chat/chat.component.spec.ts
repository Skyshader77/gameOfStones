import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ChatMessage } from '@common/interfaces/message';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket/messaging-socket.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { AudioService } from '@app/services/audio/audio.service';
import { of } from 'rxjs';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatListService: jasmine.SpyObj<ChatListService>;
    let chatSocketService: jasmine.SpyObj<MessagingSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let audioService: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        chatListService = jasmine.createSpyObj('ChatListService', ['initializeChat', 'cleanup'], {
            roomMessages: [] as ChatMessage[],
        });
        chatSocketService = jasmine.createSpyObj('MessagingSocketService', ['sendMessage', 'listenToChatMessage']);
        chatSocketService.listenToChatMessage.and.returnValue(of());
        audioService = jasmine.createSpyObj('AudioService', ['playSfx']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);

        await TestBed.configureTestingModule({
            imports: [ChatComponent, FontAwesomeModule, FormsModule],
            providers: [
                { provide: ChatListService, useValue: chatListService },
                { provide: MessagingSocketService, useValue: chatSocketService },
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: AudioService, useValue: audioService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll to the bottom when new messages arrive', () => {
        component.chatContainer = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 1000,
            },
        } as ElementRef;

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const scrollSpy = spyOn(component as any, 'scrollToBottom').and.callThrough();

        const newMessage: ChatMessage = {
            message: {
                content: 'Hello World',
                time: new Date(),
            },
            author: 'testUser',
        };

        chatListService['roomMessages'].push(newMessage);
        component['previousMessageCount'] = chatListService['roomMessages'].length - 1;

        fixture.detectChanges();

        expect(scrollSpy).toHaveBeenCalled();
    });

    it('should send message through chatSocketService and clear message input', () => {
        component.message = 'Test Message';
        myPlayerService.getUserName.and.returnValue('testUser');

        component.sendMessage();

        expect(chatSocketService.sendMessage).toHaveBeenCalledWith('testUser', 'Test Message');
        expect(component.message).toBe('');
    });

    it('should display the paper plane icon', () => {
        const iconElement = fixture.debugElement.query(By.css('.fa-paper-plane'));
        expect(iconElement).toBeTruthy();
    });
});
