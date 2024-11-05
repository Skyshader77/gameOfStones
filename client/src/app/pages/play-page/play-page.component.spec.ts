import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { PlayPageComponent } from './play-page.component';

interface MockDialogElement {
    showModal: jasmine.Spy;
    close: jasmine.Spy;
    show: jasmine.Spy;
    open: boolean;
    returnValue: string;
}

@Component({
    selector: 'app-game-chat',
    standalone: true,
    template: '',
})
class MockGameChatComponent {}
@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [],
    template: '<div></div>',
    styleUrls: [],
})
export class MockPlayerInfoComponent {}

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameSocketService: jasmine.SpyObj<GameLogicSocketService>;
    let mockDialogElement: MockDialogElement;
    let mockMapRenderingStateService: jasmine.SpyObj<RenderingStateService>;
    let mockMovementService: jasmine.SpyObj<MovementService>;
    let mockJournalService: jasmine.SpyObj<JournalListService>;
    let mockModalMessageService: jasmine.SpyObj<ModalMessageService>;
    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameSocketService = jasmine.createSpyObj('GameLogicSocketService', ['initialize', 'sendPlayerAbandon', 'cleanup']);
        mockMapRenderingStateService = jasmine.createSpyObj('RenderingStateService', ['initialize', 'cleanup']);
        mockMovementService = jasmine.createSpyObj('MovementService', ['initialize', 'cleanup']);
        mockJournalService = jasmine.createSpyObj('JournalListService', ['startJournal', 'initializeJournal', 'cleanup']);
        mockModalMessageService = jasmine.createSpyObj('ModalMessageService', ['setMessage']);
        mockDialogElement = {
            showModal: jasmine.createSpy('showModal'),
            close: jasmine.createSpy('close'),
            show: jasmine.createSpy('show'),
            open: false,
            returnValue: '',
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameLogicSocketService, useValue: mockGameSocketService },
                { provide: RefreshService, useValue: { wasRefreshed: () => false } },
                {
                    provide: RenderingStateService,
                    useValue: mockMapRenderingStateService,
                },
                {
                    provide: MovementService,
                    useValue: mockMovementService,
                },
                {
                    provide: JournalListService,
                    useValue: mockJournalService,
                },
                {
                    provide: ModalMessageService,
                    useValue: mockModalMessageService,
                },
            ],
        })
            .overrideComponent(PlayPageComponent, {
                add: { imports: [MockGameChatComponent, MockPlayerInfoComponent] },
                remove: { imports: [GameChatComponent, PlayerInfoComponent] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        component.abandonModal = { nativeElement: mockDialogElement as unknown } as ElementRef<HTMLDialogElement>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the abandon modal when closeAbandonModal is called', () => {
        component.abandonModal = { nativeElement: mockDialogElement as unknown } as ElementRef<HTMLDialogElement>;
        component.closeAbandonModal();
        expect(mockDialogElement.close).toHaveBeenCalled();
    });

    it('should close the abandon modal, send abandon message, and navigate to /init when confirmAbandon is called', () => {
        component.abandonModal = { nativeElement: mockDialogElement as unknown } as ElementRef<HTMLDialogElement>;
        component.confirmAbandon();
        expect(mockDialogElement.close).toHaveBeenCalled();
        expect(mockGameSocketService.sendPlayerAbandon).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should cleanup services in ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(mockGameSocketService.cleanup).toHaveBeenCalled();
    });
});
