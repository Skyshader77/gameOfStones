/* eslint-disable @typescript-eslint/no-explicit-any */

import { TestBed } from '@angular/core/testing';
import { RenderingService } from './rendering.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import {
    MOCK_MAPS,
    MOCK_PLAYERS,
    MOCK_RASTER_POSITION,
    MOCK_REACHABLE_TILE,
    MOCK_RENDER_POSITION,
    MOCK_TILE_DIMENSION,
    MOCK_ABANDONNED_PLAYER_LIST,
} from '@app/constants/tests.constants';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { SpriteService } from '../sprite/sprite.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

describe('RenderingService', () => {
    let service: RenderingService;

    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let gameMapSpy: jasmine.SpyObj<GameMapService>;
    let spriteSpy: jasmine.SpyObj<SpriteService>;
    let movementSpy: jasmine.SpyObj<MovementService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], {
            arrowHead: MOCK_REACHABLE_TILE,
            playableTiles: [MOCK_REACHABLE_TILE],
            hoveredTile: MOCK_RENDER_POSITION,
            actionTiles: [MOCK_RENDER_POSITION],
            displayActions: true,
            displayPlayableTiles: true,
        });
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer'], { playerList: MOCK_PLAYERS });
        gameMapSpy = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        spriteSpy = jasmine.createSpyObj('SpriteService', [
            'isLoaded',
            'getSpritePosition',
            'getTileSprite',
            'getItemSprite',
            'getPlayerSpriteSheet',
        ]);
        spriteSpy.isLoaded.and.returnValue(true);
        movementSpy = jasmine.createSpyObj('MovementService', ['isMoving']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerSpy', [], { isCurrentPlayer: true });

        TestBed.configureTestingModule({
            providers: [
                { provide: RenderingStateService, useValue: renderingStateSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameMapService, useValue: gameMapSpy },
                { provide: SpriteService, useValue: spriteSpy },
                { provide: MovementService, useValue: movementSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
            ],
        });
        service = TestBed.inject(RenderingService);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        service['ctx'] = ctx;
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
        const itemSpy = spyOn<any>(service, 'renderItems');
        const playerSpy = spyOn<any>(service, 'renderPlayers');
        service['renderGame']();
        expect(tilesSpy).toHaveBeenCalled();
        expect(itemSpy).toHaveBeenCalled();
        expect(playerSpy).toHaveBeenCalled();
    });

    it('should render no tiles if images are not defined', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getTileSprite.and.returnValue(undefined);
        service['renderTiles']();
        expect(entitySpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render once per tile', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getTileSprite.and.returnValue(new Image());
        service['renderTiles']();
        expect(entitySpy).toHaveBeenCalledTimes(MOCK_MAPS[0].size ** 2);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should render no items if images are not defined', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getItemSprite.and.returnValue(undefined);
        service['renderItems']();
        expect(entitySpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render once per item', () => {
        const entitySpy = spyOn<any>(service, 'renderEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getItemSprite.and.returnValue(new Image());
        service['renderItems']();
        expect(entitySpy).toHaveBeenCalledTimes(MOCK_MAPS[0].placedItems.length);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should render no player if images are not defined', () => {
        const entitySpy = spyOn<any>(service, 'renderSpriteEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpriteSheet.and.returnValue(undefined);
        service['renderPlayers']();
        expect(entitySpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render once per player', () => {
        const entitySpy = spyOn<any>(service, 'renderSpriteEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpriteSheet.and.returnValue(new Image());
        service['renderPlayers']();
        expect(entitySpy).toHaveBeenCalledTimes(MOCK_PLAYERS.length);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should render entity', () => {
        const img = document.createElement('img');
        const drawSpy = spyOn<any>(service['ctx'], 'drawImage');
        spriteSpy.getPlayerSpriteSheet.and.returnValue(new Image());
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderEntity'](img, MOCK_RENDER_POSITION);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should render sprite entity', () => {
        const img = document.createElement('img');
        const drawSpy = spyOn<any>(service['ctx'], 'drawImage');
        spriteSpy.getSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderSpriteEntity'](img, MOCK_RENDER_POSITION, 0);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should render ui', () => {
        const playableSpy = spyOn<any>(service, 'renderPlayableTiles');
        const hoverSpy = spyOn<any>(service, 'renderHoverEffect');
        const actionSpy = spyOn<any>(service, 'renderActionTiles');
        const pathSpy = spyOn<any>(service, 'renderPath');
        service['renderUI']();
        expect(playableSpy).toHaveBeenCalled();
        expect(hoverSpy).toHaveBeenCalled();
        expect(actionSpy).toHaveBeenCalled();
        expect(pathSpy).toHaveBeenCalled();
    });

    it('should render playable tiles if current player and stationary', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        movementSpy.isMoving.and.returnValue(false);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderPlayableTiles']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should not render playable tiles if not current player', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        movementSpy.isMoving.and.returnValue(false);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        Object.defineProperty(myPlayerSpy, 'isCurrentPlayer', { value: false });
        service['renderPlayableTiles']();
        expect(drawSpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render action tiles', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        movementSpy.isMoving.and.returnValue(false);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderActionTiles']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should render hovered tile if it exists', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderHoverEffect']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it("should not render hovered tile if it doesn't exist", () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        Object.defineProperty(renderingStateSpy, 'hoveredTile', { value: null });
        service['renderHoverEffect']();
        expect(drawSpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render path if it exists and current player', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'beginPath').and.callThrough();
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        playerListSpy.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderPath']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should not render path not current player', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'beginPath').and.callThrough();
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        playerListSpy.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        Object.defineProperty(myPlayerSpy, 'isCurrentPlayer', { value: false });
        service['renderPath']();
        expect(drawSpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it("should not render path current player doesn't exist", () => {
        const drawSpy = spyOn<any>(service['ctx'], 'beginPath').and.callThrough();
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        playerListSpy.getCurrentPlayer.and.returnValue(undefined);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderPath']();
        expect(drawSpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should compute the raster position', () => {
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        const result = service['getRasterPosition'](MOCK_RASTER_POSITION);
        expect(result.x).toEqual(MOCK_TILE_DIMENSION);
        expect(result.y).toEqual(MOCK_TILE_DIMENSION);
    });

    it('should skip rendering abandoned players', () => {
        const renderSpriteEntitySpy = spyOn<any>(service, 'renderSpriteEntity');
        const getRasterPositionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpriteSheet.and.returnValue(new Image());
        Object.defineProperty(playerListSpy, 'playerList', {
            get: () => MOCK_ABANDONNED_PLAYER_LIST,
        });
        service['renderPlayers']();
        const activePlayersCount = MOCK_ABANDONNED_PLAYER_LIST.filter((player) => !player.playerInGame.hasAbandoned).length;
        expect(renderSpriteEntitySpy).toHaveBeenCalledTimes(activePlayersCount);
        expect(spriteSpy.getPlayerSpriteSheet).toHaveBeenCalledTimes(activePlayersCount);
        expect(getRasterPositionSpy).toHaveBeenCalledTimes(activePlayersCount);
    });
});
