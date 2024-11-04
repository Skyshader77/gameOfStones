import { TestBed } from '@angular/core/testing';
import { RenderingService } from './rendering.service';
import { RenderingStateService } from './rendering-state.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { SpriteService } from './sprite.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { MOCK_MAPS } from '@app/constants/tests.constants';

describe('RenderingService', () => {
    let service: RenderingService;

    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let gameMapSpy: jasmine.SpyObj<GameMapService>;
    let spriteSpy: jasmine.SpyObj<SpriteService>;
    let movementSpy: jasmine.SpyObj<MovementService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], { arrowHead: null });
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        gameMapSpy = jasmine.createSpyObj('GameMapService', [], { map: MOCK_MAPS[0] });
        spriteSpy = jasmine.createSpyObj('SpriteService', ['isLoaded', 'getTileSprite']);
        movementSpy = jasmine.createSpyObj('MovementService', ['isMoving']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerSpy', [], { isCurrentPlayer: true });

        TestBed.configureTestingModule({
            providers: [
                { provide: RenderingStateService, renderingStateSpy },
                { provide: PlayerListService, playerListSpy },
                { provide: GameMapService, gameMapSpy },
                { provide: SpriteService, spriteSpy },
                { provide: MovementService, movementSpy },
                { provide: MyPlayerService, myPlayerSpy },
            ],
        });
        service = TestBed.inject(RenderingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should render both the game and the ui on render all', () => {
        const gameSpy = spyOn<any>(service, 'renderGame');
        const uiSpy = spyOn<any>(service, 'renderUI');
        service.renderAll();
        expect(gameSpy).toHaveBeenCalled();
        expect(uiSpy).toHaveBeenCalled();
    });

    it('should render only the game on render screenshot', () => {
        const contextSpy = spyOn(service, 'setContext').and.callThrough();
        const gameSpy = spyOn<any>(service, 'renderGame');

        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        service.renderScreenshot(canvas.getContext('2d') as CanvasRenderingContext2D);
        expect(contextSpy).toHaveBeenCalled();
        expect(gameSpy).toHaveBeenCalled();
        document.body.removeChild(canvas);
    });

    it('should set context', () => {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.setContext(ctx);
        expect(service['ctx']).toBe(ctx);
        document.body.removeChild(canvas);
    });

    it('should not render if not loaded', () => {
        spriteSpy.isLoaded.and.returnValue(false);
        const tilesSpy = spyOn<any>(service, 'renderTiles');
        service['renderGame']();
        expect(tilesSpy).not.toHaveBeenCalled();
    });

    it('should render if loaded', () => {
        spriteSpy.isLoaded.and.returnValue(true);
        const tilesSpy = spyOn<any>(service, 'renderTiles');
        service['renderGame']();
        expect(tilesSpy).toHaveBeenCalled();
    });

    it('should render nothing if images are not defined', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        spriteSpy.getTileSprite.and.returnValue(undefined);
        service['renderTiles']();
        expect(entitySpy).not.toHaveBeenCalled();
    });

    it('should render once per tile', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        spriteSpy.getTileSprite.and.returnValue(new Image());
        service['renderTiles']();
        expect(entitySpy).toHaveBeenCalled();
    });
});
