/* eslint-disable max-classes-per-file */
import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { GAME_END_DELAY_MS, REDIRECTION_MESSAGE, WINNER_MESSAGE } from '@app/constants/play.constants';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { MOCK_CLICK_POSITION_0, MOCK_PLAYER_INFO, MOCK_TILE_INFO } from '@app/constants/tests.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { MOCK_GAME_END_WINNING_OUTPUT } from '@common/constants/game-end-test.constants';
import { GameEndOutput } from '@common/interfaces/game-gateway-outputs';
import { TileInfo } from '@common/interfaces/map';
import { of, Subject } from 'rxjs';
import { PlayPageComponent } from './play-page.component';

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
@Component({
    selector: 'app-message-dialog',
    standalone: true,
    imports: [],
    template: '<div></div>',
    styleUrls: [],
})
export class MockMessageDialogComponent {}

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameSocketService: jasmine.SpyObj<GameLogicSocketService>;
    let mockMovementService: jasmine.SpyObj<MovementService>;
    let mockJournalService: jasmine.SpyObj<JournalListService>;
    let mockModalMessageService: jasmine.SpyObj<ModalMessageService>;
    let mockRenderingStateService: jasmine.SpyObj<RenderingStateService>;
    let mockGameMapInputService: jasmine.SpyObj<GameMapInputService>;
    let mockRefreshService: jasmine.SpyObj<RefreshService>;
    let mockMyPlayerService: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameSocketService = jasmine.createSpyObj('GameLogicSocketService', ['initialize', 'sendPlayerAbandon', 'listenToEndGame', 'cleanup']);
        mockMovementService = jasmine.createSpyObj('MovementService', ['initialize', 'cleanup', 'update', 'isMoving']);
        mockJournalService = jasmine.createSpyObj('JournalListService', ['startJournal', 'initializeJournal', 'cleanup']);
        mockModalMessageService = jasmine.createSpyObj('ModalMessageService', ['setMessage', 'showMessage']);
        mockGameMapInputService = jasmine.createSpyObj('GameMapInputService', ['onMapHover', 'onMapClick'], {
            playerInfoClick$: new Subject(),
            tileInfoClick$: new Subject(),
        });
        mockRenderingStateService = jasmine.createSpyObj('RenderingStateService', ['initialize', 'cleanup', 'actionTiles']);
        mockRefreshService = jasmine.createSpyObj('RefreshService', ['wasRefreshed']);
        mockMyPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);
        mockRenderingStateService.actionTiles = [];
        mockGameSocketService.listenToEndGame.and.returnValue(of(MOCK_GAME_END_WINNING_OUTPUT));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameLogicSocketService, useValue: mockGameSocketService },
                { provide: RefreshService, useValue: { wasRefreshed: () => false } },
                {
                    provide: RenderingStateService,
                    useValue: mockRenderingStateService,
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
                { provide: GameMapInputService, useValue: mockGameMapInputService },
                { provide: RefreshService, useValue: mockRefreshService },
                { provide: MyPlayerService, useValue: mockMyPlayerService },
            ],
        })
            .overrideComponent(PlayPageComponent, {
                add: { imports: [MockGameChatComponent, MockPlayerInfoComponent, MockMessageDialogComponent] },
                remove: { imports: [GameChatComponent, PlayerInfoComponent, MessageDialogComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const mockDialogElement = {
            open: false,
            close: jasmine.createSpy('close'),
            showModal: jasmine.createSpy('showModal'),
        } as unknown as HTMLDialogElement;

        component.abandonModal = {
            nativeElement: mockDialogElement,
        } as ElementRef<HTMLDialogElement>;

        component.tileInfoModal = {
            nativeElement: mockDialogElement,
        } as ElementRef<HTMLDialogElement>;

        component.playerInfoModal = {
            nativeElement: mockDialogElement,
        } as ElementRef<HTMLDialogElement>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call setMessage and quitGame when refreshService.wasRefreshed() returns true', () => {
        mockRefreshService.wasRefreshed.and.returnValue(true);

        spyOn(component, 'quitGame');

        component.ngOnInit();

        expect(mockModalMessageService.setMessage).toHaveBeenCalledWith(LEFT_ROOM_MESSAGE);
        expect(component.quitGame).toHaveBeenCalled();
    });

    it('should cleanup services in ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(mockGameSocketService.cleanup).toHaveBeenCalled();
    });

    it('should close the abandon modal when closeAbandonModal is called', () => {
        component.closeAbandonModal();
        expect(component.abandonModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should close the tile info modal when closeTileInfoModal is called', () => {
        component.closeTileInfoModal();
        expect(component.tileInfoModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should close the player info modal when closeTileInfoModal is called', () => {
        component.closePlayerInfoModal();
        expect(component.playerInfoModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should close the abandon modal, send abandon message, and navigate to /init when confirmAbandon is called', () => {
        spyOn(component, 'closeAbandonModal');
        component.confirmAbandon();
        expect(component.closeAbandonModal).toHaveBeenCalled();
        expect(mockGameSocketService.sendPlayerAbandon).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should show a message dialog with the correct message when the game ends', () => {
        component.ngOnInit();
        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Othmane déclare Othmane comme le grand gagnant!',
            content: 'Vous allez être redirigé à la vue initiale.',
        });
    });

    it('should navigate to /init after game ends with a delay', fakeAsync(() => {
        const mockEndOutput = MOCK_GAME_END_WINNING_OUTPUT;

        const gameEndSubject = new Subject<GameEndOutput>();
        mockGameSocketService.listenToEndGame.and.returnValue(gameEndSubject.asObservable());

        component.ngOnInit();

        gameEndSubject.next(mockEndOutput);

        tick(GAME_END_DELAY_MS);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Othmane déclare Othmane comme le grand gagnant!',
            content: REDIRECTION_MESSAGE,
        });
    }));

    it('should show KING_VERDICT message and navigate to /init after game ends with a delay', fakeAsync(() => {
        mockMyPlayerService.getUserName.and.returnValue('Othmane');

        const gameEndSubject = new Subject<GameEndOutput>();
        mockGameSocketService.listenToEndGame.and.returnValue(gameEndSubject.asObservable());

        component.ngOnInit();

        gameEndSubject.next(MOCK_GAME_END_WINNING_OUTPUT);

        tick(GAME_END_DELAY_MS);

        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: WINNER_MESSAGE,
            content: REDIRECTION_MESSAGE,
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
    }));

    it('should call quitGame method and navigate to /init', () => {
        component.quitGame();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should call openAbandonModal method and show the abandon modal', () => {
        const mockDialogElement = { showModal: jasmine.createSpy('showModal') } as unknown as HTMLDialogElement;
        component.abandonModal = { nativeElement: mockDialogElement };
        component.openAbandonModal();
        expect(mockDialogElement.showModal).toHaveBeenCalled();
    });

    it('should call onMapClick when handleMapClick is called', () => {
        const mockEvent: MapMouseEvent = {
            tilePosition: MOCK_CLICK_POSITION_0,
            button: 0,
        };

        component.handleMapClick(mockEvent);

        expect(mockGameMapInputService.onMapClick).toHaveBeenCalledWith(mockEvent);
    });

    it('should call onMapHover when handleMapHover is called', () => {
        const mockEvent: MapMouseEvent = {
            tilePosition: MOCK_CLICK_POSITION_0,
            button: 0,
        };

        component.handleMapHover(mockEvent);

        expect(mockGameMapInputService.onMapHover).toHaveBeenCalledWith(mockEvent);
    });

    it('should update playerInfo and show modal when playerInfo is not null', () => {
        mockGameMapInputService.playerInfoClick$ = new Subject();
        mockGameMapInputService.playerInfoClick$.next(MOCK_PLAYER_INFO[0]);
        const mockPlayerInfo = MOCK_PLAYER_INFO[0];

        component['infoEvents']();

        expect(component.playerInfo).toBe(mockPlayerInfo);
        expect(component.avatarImagePath).toBe(AVATAR_PROFILE[mockPlayerInfo.avatar]);
        expect(component.playerInfoModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should update playerInfo and tileInfo, and show respective modals', () => {
        const mockPlayerInfo = MOCK_PLAYER_INFO[0];
        const mockTileInfo: TileInfo = MOCK_TILE_INFO;

        mockGameMapInputService.playerInfoClick$.next(mockPlayerInfo);
        mockGameMapInputService.tileInfoClick$.next(mockTileInfo);

        component['infoEvents']();

        expect(component.playerInfo).toBe(mockPlayerInfo);
        expect(component.avatarImagePath).toBe(AVATAR_PROFILE[mockPlayerInfo.avatar]);
        expect(component.playerInfoModal.nativeElement.showModal).toHaveBeenCalled();

        expect(component.tileInfo).toBe(mockTileInfo);
        expect(component.tileInfoModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should not update playerInfo, not show modal, and not update avatarImagePath when playerInfo is null', () => {
        mockGameMapInputService.playerInfoClick$.next(null);

        component['infoEvents']();

        expect(component.playerInfo).toBeNull();
        expect(component.avatarImagePath).toBe('');
        expect(component.playerInfoModal.nativeElement.showModal).not.toHaveBeenCalled();
    });
});
