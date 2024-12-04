/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import {
    ACTION_STYLE,
    AFFECTED_TILE_STYLE,
    FLAME_COUNT,
    FLAME_FRAME_RATE,
    FLAME_HEIGHT,
    FLAME_WIDTH,
    IDLE_FIGHT_TRANSITION,
    ITEM_STYLE,
} from '@app/constants/rendering.constants';
import {
    MOCK_ABANDONNED_PLAYER_LIST,
    MOCK_MAPS,
    MOCK_PLAYERS,
    MOCK_RASTER_POSITION,
    MOCK_REACHABLE_TILE,
    MOCK_RENDER_POSITION,
    MOCK_TILE_DIMENSION,
} from '@app/constants/tests.constants';
import { MovementService } from '@app/services/movement-service/movement.service';
import { SpriteService } from '@app/services/rendering-services/sprite/sprite.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { ItemAction } from '@common/interfaces/overworld-action';
import { PlayerInGame } from '@common/interfaces/player';
import { RenderingService } from './rendering.service';

describe('RenderingService', () => {
    let service: RenderingService;

    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let gameMapSpy: jasmine.SpyObj<GameMapService>;
    let spriteSpy: jasmine.SpyObj<SpriteService>;
    let movementSpy: jasmine.SpyObj<MovementService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let mockItemAction: ItemAction;

    beforeEach(() => {
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', ['updateFightTransition'], {
            arrowHead: MOCK_REACHABLE_TILE,
            playableTiles: [MOCK_REACHABLE_TILE],
            hoveredTile: MOCK_RENDER_POSITION,
            actionTiles: [MOCK_RENDER_POSITION],
            squarePos: { x: 0, y: 0 },
        });
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'isPlayerOnTile']);
        gameMapSpy = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        spriteSpy = jasmine.createSpyObj('SpriteService', [
            'isLoaded',
            'getPlayerSpritePosition',
            'getTileSprite',
            'getItemSprite',
            'getPlayerFlame',
            'getPlayerSpriteSheet',
            'getFlameSpritePosition',
        ]);
        spriteSpy.isLoaded.and.returnValue(true);
        movementSpy = jasmine.createSpyObj('MovementService', ['isMoving']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerSpy', [], { isCurrentPlayer: true });

        mockItemAction = {
            overWorldAction: { action: OverWorldActionType.Hammer, position: { x: 0, y: 0 } },
            affectedTiles: [{ x: 0, y: 1 }],
        };

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

    /* it('should calculate the correct spriteIndex and render flame', () => {
        renderingStateSpy.counter = 10;
        const mockImage = new Image();
        spriteSpy.getPlayerFlame.and.returnValue(mockImage);

        const player = {
            playerInGame: { startPosition: { x: 1, y: 1 } },
            playerInfo: { avatar: 'test-avatar' },
        } as any;

        const FLAME_FRAME_RATE = 5;
        const FLAME_COUNT = 4;

        const spriteIndex = Math.floor(renderingStateSpy.counter / FLAME_FRAME_RATE) % FLAME_COUNT;
        service['renderFlame'](player);

        expect(spriteSpy.getPlayerFlame).toHaveBeenCalledWith(spriteIndex);
        expect(service['ctx'].drawImage).toHaveBeenCalled();
    }); */

    it('should render both the game and the ui on render all', () => {
        const gameSpy = spyOn<any>(service, 'renderGame');
        const uiSpy = spyOn<any>(service, 'renderUI');
        service.renderAll();
        expect(gameSpy).toHaveBeenCalled();
        expect(uiSpy).toHaveBeenCalled();
    });

    it('should call renderFightTransition and reset timeout if in fight transition and timeout is divisible', () => {
        const renderFightTransitionSpy = spyOn<any>(service, 'renderFightTransition');
        const renderGameSpy = spyOn<any>(service, 'renderGame');
        const renderUISpy = spyOn<any>(service, 'renderUI');
        renderingStateSpy.isInFightTransition = true;
        renderingStateSpy.transitionTimeout = IDLE_FIGHT_TRANSITION;

        service.renderAll();

        expect(renderFightTransitionSpy).toHaveBeenCalled();
        expect(renderGameSpy).not.toHaveBeenCalled();
        expect(renderUISpy).not.toHaveBeenCalled();
        expect(renderingStateSpy.transitionTimeout).toEqual(1);
    });

    it('should increment timeout if in fight transition and timeout is not divisible', () => {
        const renderFightTransitionSpy = spyOn<any>(service, 'renderFightTransition');
        const renderGameSpy = spyOn<any>(service, 'renderGame');
        const renderUISpy = spyOn<any>(service, 'renderUI');
        renderingStateSpy.isInFightTransition = true;
        renderingStateSpy.transitionTimeout = IDLE_FIGHT_TRANSITION - 1;

        service.renderAll();

        expect(renderFightTransitionSpy).not.toHaveBeenCalled();
        expect(renderGameSpy).not.toHaveBeenCalled();
        expect(renderUISpy).not.toHaveBeenCalled();
        expect(renderingStateSpy.transitionTimeout).toEqual(IDLE_FIGHT_TRANSITION);
    });

    it('should call renderGame and renderUI if not in fight transition', () => {
        const renderFightTransitionSpy = spyOn<any>(service, 'renderFightTransition');
        const renderGameSpy = spyOn<any>(service, 'renderGame');
        const renderUISpy = spyOn<any>(service, 'renderUI');
        renderingStateSpy.isInFightTransition = false;

        service.renderAll();

        expect(renderFightTransitionSpy).not.toHaveBeenCalled();
        expect(renderGameSpy).toHaveBeenCalled();
        expect(renderUISpy).toHaveBeenCalled();
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
        playerListSpy.playerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));
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
        playerListSpy.playerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        const entitySpy = spyOn<any>(service, 'renderSpriteEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpriteSheet.and.returnValue(undefined);
        service['renderPlayers']();
        expect(entitySpy).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should render once per player', () => {
        playerListSpy.playerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        const entitySpy = spyOn<any>(service, 'renderSpriteEntity');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpriteSheet.and.returnValue(new Image());
        service['renderPlayers']();
        expect(entitySpy).toHaveBeenCalledTimes(MOCK_PLAYERS.length);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should render the player flame correctly', () => {
        const player = MOCK_PLAYERS[0];

        const mockFlameSprite = { image: 'flameImage' } as unknown as HTMLImageElement;
        const mockFlamePosition = { x: 10, y: 20 };

        spriteSpy.getPlayerFlame.and.returnValue(mockFlameSprite);
        spriteSpy.getFlameSpritePosition.and.returnValue(mockFlamePosition);
        spyOn<any>(service, 'renderSpriteEntity');

        service['renderFlame'](player);

        expect(spriteSpy.getPlayerFlame).toHaveBeenCalledWith(player.playerInfo.avatar);
        expect(spriteSpy.getFlameSpritePosition).toHaveBeenCalledWith(Math.floor(renderingStateSpy.counter / FLAME_FRAME_RATE) % FLAME_COUNT);
        expect(service['renderSpriteEntity']).toHaveBeenCalledWith(mockFlameSprite, service['getRasterPosition'](player.playerInGame.startPosition), {
            spritePosition: mockFlamePosition,
            spriteDimensions: { x: FLAME_WIDTH, y: FLAME_HEIGHT },
        });
    });

    it('should render flame for players who have not abandoned', () => {
        const player = { ...MOCK_PLAYERS[0], playerInGame: { hasAbandoned: false } as PlayerInGame };

        playerListSpy.playerList = [player];
        const renderFlameSpy = spyOn<any>(service, 'renderFlame').and.callThrough();

        service['renderFlames']();

        expect(renderFlameSpy).toHaveBeenCalledWith(player);
    });

    it('should not render flame for players who have abandoned', () => {
        const player = { ...MOCK_PLAYERS[0], playerInGame: { hasAbandoned: true } as PlayerInGame };

        playerListSpy.playerList = [player];
        const renderFlameSpy = spyOn<any>(service, 'renderFlame').and.callThrough();

        service['renderFlames']();

        expect(renderFlameSpy).not.toHaveBeenCalledWith(player);
    });

    it('should add currentStep to currentSprite if the player is the current player and is moving', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListSpy.playerList = [mockPlayer];
        spriteSpy.getPlayerSpriteSheet.and.returnValue('mockSpriteSheet' as unknown as HTMLImageElement);
        movementSpy.isMoving.and.returnValue(true);
        playerListSpy.currentPlayerName = mockPlayer.playerInfo.userName;

        const renderPlayerSpy = spyOn<any>(service, 'renderPlayer');
        const mockSpritePosition = { x: 10, y: 20 };
        spriteSpy.getPlayerSpritePosition.and.returnValue(mockSpritePosition);

        const expectedSpriteIndex = mockPlayer.renderInfo.currentSprite + mockPlayer.renderInfo.currentStep;

        service['renderPlayers']();

        expect(spriteSpy.getPlayerSpriteSheet).toHaveBeenCalledWith(mockPlayer.playerInfo.avatar);
        expect(spriteSpy.getPlayerSpritePosition).toHaveBeenCalledWith(expectedSpriteIndex);
        expect(renderPlayerSpy).toHaveBeenCalledWith(mockPlayer, 'mockSpriteSheet', mockSpritePosition);
    });

    it('should not add currentStep to currentSprite if the player is not the current player or is not moving', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListSpy.playerList = [mockPlayer];
        spriteSpy.getPlayerSpriteSheet.and.returnValue('mockSpriteSheet' as unknown as HTMLImageElement);
        movementSpy.isMoving.and.returnValue(false);
        playerListSpy.currentPlayerName = 'OtherPlayer';

        const renderPlayerSpy = spyOn<any>(service, 'renderPlayer');
        const mockSpritePosition = { x: 10, y: 20 };
        spriteSpy.getPlayerSpritePosition.and.returnValue(mockSpritePosition);

        const expectedSpriteIndex = mockPlayer.renderInfo.currentSprite;

        service['renderPlayers']();

        expect(spriteSpy.getPlayerSpriteSheet).toHaveBeenCalledWith(mockPlayer.playerInfo.avatar);
        expect(spriteSpy.getPlayerSpritePosition).toHaveBeenCalledWith(expectedSpriteIndex);
        expect(renderPlayerSpy).toHaveBeenCalledWith(mockPlayer, 'mockSpriteSheet', mockSpritePosition);
    });

    it('should skip rendering if the player has abandoned', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        mockPlayer.playerInGame.hasAbandoned = true;
        playerListSpy.playerList = [mockPlayer];

        const renderPlayerSpy = spyOn<any>(service, 'renderPlayer');

        service['renderPlayers']();

        expect(renderPlayerSpy).not.toHaveBeenCalled();
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
        spriteSpy.getPlayerSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderSpriteEntity'](img, MOCK_RENDER_POSITION, { spritePosition: { x: 0, y: 0 }, spriteDimensions: { x: 0, y: 0 } });
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should render ui', () => {
        renderingStateSpy.displayPlayableTiles = true;
        renderingStateSpy.displayActions = true;

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
        spriteSpy.getPlayerSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
        movementSpy.isMoving.and.returnValue(false);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderPlayableTiles']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should not render playable tiles if not current player', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'fillRect');
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        spriteSpy.getPlayerSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
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
        spriteSpy.getPlayerSpritePosition.and.returnValue(MOCK_RENDER_POSITION);
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
        playerListSpy.getCurrentPlayer.and.returnValue(JSON.parse(JSON.stringify(MOCK_PLAYERS[0])));
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        service['renderPath']();
        expect(drawSpy).toHaveBeenCalled();
        expect(positionSpy).toHaveBeenCalled();
    });

    it('should not render path not current player', () => {
        const drawSpy = spyOn<any>(service['ctx'], 'beginPath').and.callThrough();
        const positionSpy = spyOn<any>(service, 'getRasterPosition').and.returnValue(MOCK_RENDER_POSITION);
        playerListSpy.getCurrentPlayer.and.returnValue(JSON.parse(JSON.stringify(MOCK_PLAYERS[0])));
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

    it('should render item tiles and item-affected tiles when displayItemTiles is true', () => {
        renderingStateSpy.displayItemTiles = true;

        const renderItemTilesSpy = spyOn<any>(service, 'renderItemTiles');
        const renderItemAffectedTilesSpy = spyOn<any>(service, 'renderItemAffectedTiles');

        service['renderUI']();

        expect(renderItemTilesSpy).toHaveBeenCalled();
        expect(renderItemAffectedTilesSpy).toHaveBeenCalled();
    });

    it('should not render item tiles or item-affected tiles when displayItemTiles is false', () => {
        renderingStateSpy.displayItemTiles = false;

        const renderItemTilesSpy = spyOn<any>(service, 'renderItemTiles');
        const renderItemAffectedTilesSpy = spyOn<any>(service, 'renderItemAffectedTiles');

        service['renderUI']();

        expect(renderItemTilesSpy).not.toHaveBeenCalled();
        expect(renderItemAffectedTilesSpy).not.toHaveBeenCalled();
    });

    it('should render fight transition', () => {
        service['renderFightTransition']();
        expect(renderingStateSpy.updateFightTransition).toHaveBeenCalled();
    });

    it('should render item tiles when they should be rendered', () => {
        const mockItemActionBomb: ItemAction = {
            overWorldAction: {
                position: { x: 2, y: 3 },
                action: OverWorldActionType.Bomb,
            },
            affectedTiles: [],
        };

        const mockItemPosition = { x: 40, y: 60 };

        renderingStateSpy.itemTiles = [mockItemActionBomb];
        spyOn<any>(service, 'shouldRenderItemTile').and.returnValue(true);
        spyOn<any>(service, 'getRasterPosition').and.returnValue(mockItemPosition);
        spyOn<any>(service['ctx'], 'fillRect');
        spyOn<any>(service['ctx'], 'fillStyle');
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);

        service['renderItemTiles']();

        expect(service['shouldRenderItemTile']).toHaveBeenCalledWith(mockItemActionBomb.overWorldAction);
        expect(service['getRasterPosition']).toHaveBeenCalledWith(mockItemActionBomb.overWorldAction.position);
        expect(service['ctx'].fillStyle).toBe(ITEM_STYLE);
        expect(service['ctx'].fillRect).toHaveBeenCalledWith(mockItemPosition.x, mockItemPosition.y, MOCK_TILE_DIMENSION, MOCK_TILE_DIMENSION);
    });

    it('should render item affected tiles correctly based on player position', () => {
        const mockItemActionBomb: ItemAction = {
            overWorldAction: {
                position: { x: 2, y: 3 },
                action: OverWorldActionType.Bomb,
            },
            affectedTiles: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
        };
        renderingStateSpy.itemTiles = [mockItemActionBomb];
        const mockTilePosition = { x: 40, y: 60 };

        spyOn<any>(service, 'shouldRenderItemAffectedTile').and.returnValue(true);
        playerListSpy.isPlayerOnTile.and.returnValue(true);
        spyOn<any>(service, 'getRasterPosition').and.returnValue(mockTilePosition);
        gameMapSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        spyOn(service['ctx'], 'fillRect');

        service['renderItemAffectedTiles']();

        expect(service['shouldRenderItemAffectedTile']).toHaveBeenCalledWith(mockItemActionBomb.overWorldAction);
        expect(service['getRasterPosition']).toHaveBeenCalledWith(mockItemActionBomb.affectedTiles[0]);
        expect(playerListSpy.isPlayerOnTile).toHaveBeenCalledWith(mockItemActionBomb.affectedTiles[0]);

        expect(service['ctx'].fillStyle).toBe(ACTION_STYLE);
        expect(service['ctx'].fillRect).toHaveBeenCalledWith(mockTilePosition.x, mockTilePosition.y, MOCK_TILE_DIMENSION, MOCK_TILE_DIMENSION);

        playerListSpy.isPlayerOnTile.and.returnValue(false);

        service['renderItemAffectedTiles']();

        expect(service['getRasterPosition']).toHaveBeenCalledWith(mockItemActionBomb.affectedTiles[1]);
        expect(playerListSpy.isPlayerOnTile).toHaveBeenCalledWith(mockItemActionBomb.affectedTiles[1]);
        expect(service['ctx'].fillStyle).toBe(AFFECTED_TILE_STYLE);
    });

    it('should return true for shouldRenderItemTile when GraniteHammer is selected and action is Hammer', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GraniteHammer;
        mockItemAction.overWorldAction.action = OverWorldActionType.Hammer;

        const result = service['shouldRenderItemTile'](mockItemAction.overWorldAction);

        expect(result).toBeTrue();
    });

    it('should return false for shouldRenderItemTile when wrong action is provided for GraniteHammer', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GraniteHammer;
        mockItemAction.overWorldAction.action = OverWorldActionType.Bomb;

        const result = service['shouldRenderItemTile'](mockItemAction.overWorldAction);

        expect(result).toBeFalse();
    });

    it('should return true for shouldRenderItemTile when GeodeBomb is selected and action is Bomb', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GeodeBomb;
        mockItemAction.overWorldAction.action = OverWorldActionType.Bomb;

        const result = service['shouldRenderItemTile'](mockItemAction.overWorldAction);

        expect(result).toBeTrue();
    });

    it('should return false for shouldRenderItemTile when wrong action is provided for GeodeBomb', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GeodeBomb;
        mockItemAction.overWorldAction.action = OverWorldActionType.Hammer;

        const result = service['shouldRenderItemTile'](mockItemAction.overWorldAction);

        expect(result).toBeFalse();
    });

    it('should return true for shouldRenderItemAffectedTile when tile matches hovered tile', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GraniteHammer;
        renderingStateSpy.hoveredTile = { x: 0, y: 0 };
        mockItemAction.overWorldAction.action = OverWorldActionType.Hammer;
        mockItemAction.overWorldAction.position = { x: 0, y: 0 };

        const result = service['shouldRenderItemAffectedTile'](mockItemAction.overWorldAction);

        expect(result).toBeTrue();
    });

    it('should return false for shouldRenderItemAffectedTile when hovered tile does not match', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GraniteHammer;
        renderingStateSpy.hoveredTile = { x: 3, y: 4 };
        mockItemAction.overWorldAction.action = OverWorldActionType.Hammer;
        mockItemAction.overWorldAction.position = { x: 1, y: 2 };

        const result = service['shouldRenderItemAffectedTile'](mockItemAction.overWorldAction);

        expect(result).toBeFalse();
    });

    it('should return false for shouldRenderItemAffectedTile when item action is not valid for currently selected item', () => {
        renderingStateSpy.currentlySelectedItem = ItemType.GeodeBomb;
        renderingStateSpy.hoveredTile = { x: 1, y: 2 };
        mockItemAction.overWorldAction.action = OverWorldActionType.Hammer;
        mockItemAction.overWorldAction.position = { x: 1, y: 2 };

        const result = service['shouldRenderItemAffectedTile'](mockItemAction.overWorldAction);

        expect(result).toBeFalse();
    });
});
