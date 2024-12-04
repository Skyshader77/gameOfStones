/* eslint-disable max-classes-per-file */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { StatsGlobalComponent } from '@app/components/stats-global/stats-global.component';
import { StatsPlayerListComponent } from '@app/components/stats-player-list/stats-player-list.component';
import { Pages } from '@app/interfaces/pages';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EndPageComponent } from './end-page.component';

@Component({
    selector: 'app-stats-global',
    standalone: true,
    template: '',
})
class MockStatsGlobalComponent {}

@Component({
    selector: 'app-stats-player-list',
    standalone: true,
    template: '',
})
class MockStatsPlayerListComponent {}

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

describe('EndPageComponent', () => {
    let component: EndPageComponent;
    let fixture: ComponentFixture<EndPageComponent>;
    let gameSocketServiceMock: jasmine.SpyObj<GameLogicSocketService>;
    let refreshServiceMock: jasmine.SpyObj<RefreshService>;
    let routerMock: jasmine.SpyObj<Router>;
    let chatListServiceMock: jasmine.SpyObj<ChatListService>;

    beforeEach(async () => {
        gameSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', ['sendPlayerAbandon']);
        refreshServiceMock = jasmine.createSpyObj('RefreshService', ['wasRefreshed']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        chatListServiceMock = jasmine.createSpyObj('ChatListService', ['initializeChat', 'cleanup']);

        await TestBed.configureTestingModule({
            imports: [EndPageComponent, FontAwesomeModule],
            providers: [
                { provide: GameLogicSocketService, useValue: gameSocketServiceMock },
                { provide: RefreshService, useValue: refreshServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ChatListService, useValue: chatListServiceMock },
            ],
        })
            .overrideComponent(EndPageComponent, {
                add: { imports: [MockChatComponent, MockStatsGlobalComponent, MockStatsPlayerListComponent] },
                remove: { imports: [ChatComponent, StatsGlobalComponent, StatsPlayerListComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(EndPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call initializeChat on ChatListService', () => {
            component.ngOnInit();
            expect(chatListServiceMock.initializeChat).toHaveBeenCalled();
        });

        it('should navigate to Init page if the page was refreshed', () => {
            refreshServiceMock.wasRefreshed.and.returnValue(true);
            component.ngOnInit();
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${Pages.Init}`]);
        });

        it('should not navigate if the page was not refreshed', () => {
            refreshServiceMock.wasRefreshed.and.returnValue(false);
            component.ngOnInit();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });
    });

    describe('onLeave', () => {
        it('should call sendPlayerAbandon on GameSocketService', () => {
            component.onLeave();
            expect(gameSocketServiceMock.sendPlayerAbandon).toHaveBeenCalled();
        });

        it('should navigate to Init page after calling sendPlayerAbandon', () => {
            component.onLeave();
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${Pages.Init}`]);
        });
    });
});
