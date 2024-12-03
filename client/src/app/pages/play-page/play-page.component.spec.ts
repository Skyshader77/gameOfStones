/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { NO_MOVEMENT_COST_TERRAINS, TERRAIN_MAP, UNKNOWN_TEXT } from '@app/constants/conversion.constants';
import { LAST_STANDING_MESSAGE, LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { Pages } from '@app/interfaces/pages';
import { GAME_END_DELAY_MS, REDIRECTION_MESSAGE, WINNER_MESSAGE } from '@app/constants/play.constants';
import { MOCK_CLICK_POSITION_0, MOCK_PLAYER_INFO, MOCK_TILE_INFO } from '@app/constants/tests.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { AudioService } from '@app/services/audio/audio.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input/game-map-input.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { MOCK_GAME_END_WINNING_OUTPUT } from '@common/constants/game-end-test.constants';
import { GameEndInfo } from '@common/interfaces/game-gateway-outputs';
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

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [],
    template: '<div></div>',
    styleUrls: [],
})
export class MockInventoryComponent {}

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
    let mockItemManagerService: jasmine.SpyObj<ItemManagerService>;
    let mockAudio: jasmine.SpyObj<AudioService>;
    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameSocketService = jasmine.createSpyObj('GameLogicSocketService', [
            'initialize',
            'sendPlayerAbandon',
            'listenToLastStanding',
            'listenToEndGame',
            'cleanup',
        ]);
        mockMovementService = jasmine.createSpyObj('MovementService', ['initialize', 'cleanup', 'update', 'isMoving']);
        mockJournalService = jasmine.createSpyObj('JournalListService', ['startJournal', 'initializeJournal', 'cleanup']);
        mockModalMessageService = jasmine.createSpyObj('ModalMessageService', ['setMessage', 'showMessage']);
        mockAudio = jasmine.createSpyObj('AudioService', ['playSfx']);
        mockGameMapInputService = jasmine.createSpyObj('GameMapInputService', ['onMapHover', 'onMapClick'], {
            playerInfoClick$: new Subject(),
            tileInfoClick$: new Subject(),
        });
        mockItemManagerService = jasmine.createSpyObj('ItemManagerService', [
            'handleItemPickup',
            'handleItemDrop',
            'handleInventoryFull',
            'handleCloseItemDropModal',
            'inventoryFull$',
            'closeItemDropModal$',
        ]);
        mockRenderingStateService = jasmine.createSpyObj('RenderingStateService', ['initialize', 'cleanup', 'actionTiles']);
        mockRefreshService = jasmine.createSpyObj('RefreshService', ['wasRefreshed']);
        mockMyPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName', 'isOrganizer', 'getInventory']);
        mockRenderingStateService.actionTiles = [];
        mockGameSocketService.listenToEndGame.and.returnValue(of(MOCK_GAME_END_WINNING_OUTPUT));
        mockItemManagerService.inventoryFull$ = new Subject<void>();
        mockItemManagerService.closeItemDropModal$ = new Subject<void>();
        mockGameSocketService.listenToLastStanding.and.returnValue(of());
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
                { provide: ItemManagerService, useValue: mockItemManagerService },
                { provide: MyPlayerService, useValue: mockMyPlayerService },
                { provide: AudioService, useValue: mockAudio },
            ],
        })
            .overrideComponent(PlayPageComponent, {
                add: { imports: [MockGameChatComponent, MockPlayerInfoComponent, MockMessageDialogComponent, MockInventoryComponent] },
                remove: { imports: [GameChatComponent, PlayerInfoComponent, MessageDialogComponent, InventoryComponent] },
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
        component['hasRedirected'] = false;
        mockRefreshService.wasRefreshed.and.returnValue(true);

        spyOn(component, 'quitGame');

        component.ngOnInit();

        expect(mockModalMessageService.setMessage).toHaveBeenCalledWith(LEFT_ROOM_MESSAGE);
        expect(component.quitGame).toHaveBeenCalled();
    });

    it('should set itemDropChoiceActive to true when inventoryFull$ emits', () => {
        const inventoryFullSubject = mockItemManagerService.inventoryFull$ as jasmine.SpyObj<Subject<void>>;

        inventoryFullSubject.next();

        expect(component['itemDropChoiceActive']).toBeTrue();
    });

    it('should set itemDropChoiceActive to false when closeItemDropModal$ emits', () => {
        const closeItemDropModalSubject = mockItemManagerService.closeItemDropModal$ as jasmine.SpyObj<Subject<void>>;

        closeItemDropModalSubject.next();

        expect(component['itemDropChoiceActive']).toBeFalse();
    });

    it('should set itemDropChoiceActive to false when onItemDropSelected is called', () => {
        component['itemDropChoiceActive'] = true;

        component.onItemDropSelected();

        expect(component['itemDropChoiceActive']).toBeFalse();
    });

    describe('getTileTerrainType', () => {
        it('should return the correct terrain type when tileInfo is defined and terrain name exists', () => {
            const tileInfo = { tileTerrainName: 'grass', cost: 1 };
            component.tileInfo = tileInfo;
            spyOn(TERRAIN_MAP, 'get').and.returnValue('Forest Terrain');

            const result = component.getTileTerrainType();

            expect(result).toBe('Forest Terrain');
        });

        it('should return UNKNOWN_TEXT when tileInfo is defined but terrain name does not exist in TERRAIN_MAP', () => {
            const tileInfo = { tileTerrainName: 'unknown', cost: 0 };
            component.tileInfo = tileInfo;
            spyOn(TERRAIN_MAP, 'get').and.returnValue(undefined);

            const result = component.getTileTerrainType();

            expect(result).toBe(UNKNOWN_TEXT);
        });

        it('should return UNKNOWN_TEXT when tileInfo is undefined', () => {
            component.tileInfo = undefined as unknown as TileInfo;
            spyOn(TERRAIN_MAP, 'get').and.returnValue(undefined);

            const result = component.getTileTerrainType();

            expect(result).toBe(UNKNOWN_TEXT);
        });

        it('should return UNKNOWN_TEXT when tileTerrainName is an empty string', () => {
            const tileInfo = { tileTerrainName: '', cost: 0 };
            component.tileInfo = tileInfo;
            spyOn(TERRAIN_MAP, 'get').and.returnValue(undefined);

            const result = component.getTileTerrainType();

            expect(result).toBe(UNKNOWN_TEXT);
        });
    });

    describe('getMovementCost', () => {
        it('should return "Aucun" if tileTerrainName exists and is in NO_MOVEMENT_COST_TERRAINS', () => {
            const tileInfo = { tileTerrainName: 'ice' } as unknown as TileInfo;
            component.tileInfo = tileInfo;
            spyOn(NO_MOVEMENT_COST_TERRAINS, 'has').and.returnValue(true);

            const result = component.getMovementCost();

            expect(result).toBe('Aucun');
        });

        it('should return the cost as string if tileTerrainName exists and cost is valid', () => {
            const tileInfo = { tileTerrainName: 'grass', cost: 1 };
            component.tileInfo = tileInfo;

            const result = component.getMovementCost();

            expect(result).toBe('1');
        });

        it('should return UNKNOWN_TEXT if cost is invalid (not in TileTerrain)', () => {
            const tileInfo = { tileTerrainName: 'grass', cost: 'invalidCost' } as unknown as TileInfo;
            component.tileInfo = tileInfo;

            const result = component.getMovementCost();

            expect(result).toBe(UNKNOWN_TEXT);
        });

        it('should return UNKNOWN_TEXT if tileInfo is undefined', () => {
            component.tileInfo = undefined as unknown as TileInfo;

            const result = component.getMovementCost();

            expect(result).toBe(UNKNOWN_TEXT);
        });
    });

    describe('lastStandingEvent', () => {
        it('should set the message, send player abandon and navigate when listenToLastStanding emits', () => {
            const lastStandingSubject = new Subject<void>();
            mockGameSocketService.listenToLastStanding.and.returnValue(lastStandingSubject.asObservable());

            component['lastStandingEvent']();

            lastStandingSubject.next();

            expect(mockModalMessageService.setMessage).toHaveBeenCalledWith(LAST_STANDING_MESSAGE);
            expect(mockGameSocketService.sendPlayerAbandon).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${Pages.Init}`]);
        });

        it('should not do anything if listenToLastStanding does not emit', () => {
            const lastStandingSubject = new Subject<void>();
            mockGameSocketService.listenToLastStanding.and.returnValue(lastStandingSubject.asObservable());

            component['lastStandingEvent']();

            lastStandingSubject.complete();

            expect(mockModalMessageService.setMessage).not.toHaveBeenCalled();
            expect(mockGameSocketService.sendPlayerAbandon).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
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
            content: 'Vous allez être redirigé à la vue de fin de partie.',
        });
    });

    it('should navigate to /end after game ends with a delay', fakeAsync(() => {
        component['hasRedirected'] = false;
        const mockEndOutput = MOCK_GAME_END_WINNING_OUTPUT;

        const gameEndSubject = new Subject<GameEndInfo>();
        mockGameSocketService.listenToEndGame.and.returnValue(gameEndSubject.asObservable());

        component.ngOnInit();

        gameEndSubject.next(mockEndOutput);

        tick(GAME_END_DELAY_MS);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/end']);
        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Othmane déclare Othmane comme le grand gagnant!',
            content: REDIRECTION_MESSAGE,
        });
    }));

    it('should show KING_VERDICT message and navigate to /end after game ends with a delay', fakeAsync(() => {
        mockMyPlayerService.getUserName.and.returnValue('Othmane');
        component['hasRedirected'] = false;

        const gameEndSubject = new Subject<GameEndInfo>();
        mockGameSocketService.listenToEndGame.and.returnValue(gameEndSubject.asObservable());

        component.ngOnInit();

        gameEndSubject.next(MOCK_GAME_END_WINNING_OUTPUT);

        tick(GAME_END_DELAY_MS);

        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: WINNER_MESSAGE,
            content: REDIRECTION_MESSAGE,
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/end']);
    }));

    it('should call quitGame method and navigate to /end', () => {
        component.quitGame();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/end']);
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

    describe('handleKeyboardEvent', () => {
        it('should call toggleDebug on debugService when "d" key is pressed', () => {
            spyOn(component['debugService'], 'toggleDebug');

            // Create a custom event and set the target in the event initialization
            const event = new KeyboardEvent('keydown', { key: 'd' });
            const mockTarget = { tagName: 'DIV' } as HTMLElement;
            // Use Object.defineProperty to mock 'target'
            Object.defineProperty(event, 'target', { value: mockTarget });

            component.handleKeyboardEvent(event);

            expect(component['debugService'].toggleDebug).toHaveBeenCalled();
        });

        it('should not call toggleDebug on debugService if event target is an input element', () => {
            spyOn(component['debugService'], 'toggleDebug');

            const event = new KeyboardEvent('keydown', { key: 'd' });
            const inputElement = { tagName: 'INPUT' } as HTMLElement;
            Object.defineProperty(event, 'target', { value: inputElement });

            component.handleKeyboardEvent(event);

            expect(component['debugService'].toggleDebug).not.toHaveBeenCalled();
        });

        it('should not call toggleDebug on debugService if event target is a textarea', () => {
            spyOn(component['debugService'], 'toggleDebug');

            const event = new KeyboardEvent('keydown', { key: 'd' });
            const textareaElement = { tagName: 'TEXTAREA' } as HTMLElement;
            Object.defineProperty(event, 'target', { value: textareaElement });

            component.handleKeyboardEvent(event);

            expect(component['debugService'].toggleDebug).not.toHaveBeenCalled();
        });

        it('should not call toggleDebug on debugService if event target is content editable', () => {
            spyOn(component['debugService'], 'toggleDebug');

            const event = new KeyboardEvent('keydown', { key: 'd' });
            const editableElement = { tagName: 'DIV', isContentEditable: true } as HTMLElement;
            Object.defineProperty(event, 'target', { value: editableElement });

            component.handleKeyboardEvent(event);

            expect(component['debugService'].toggleDebug).not.toHaveBeenCalled();
        });
    });

    describe('onExplosionAnimationEnd', () => {
        it('should set showExplosion to false when called', () => {
            component['renderStateService'].showExplosion = true;

            component.onExplosionAnimationEnd();

            expect(component['renderStateService'].showExplosion).toBeFalse();
        });
    });
});
