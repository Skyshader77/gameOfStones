/* eslint-disable @typescript-eslint/no-explicit-any */

import { TestBed } from '@angular/core/testing';

import { GameMapInputService } from './game-map-input.service';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import {
    MOCK_CLICK_POSITION_0,
    MOCK_CLICK_POSITION_1,
    MOCK_CLICK_POSITION_5,
    MOCK_GAME_MAP_CLICK_POSITION,
    MOCK_GOD_NAME,
    MOCK_LEFT_MOUSE_EVENT,
    MOCK_MAPS,
    MOCK_PLAYER_INFO,
    MOCK_PLAYERS,
    MOCK_REACHABLE_TILE,
    MOCK_RIGHT_MOUSE_EVENT,
    MOCK_TILE_DIMENSION,
    MOCK_TILE_INFO,
} from '@app/constants/tests.constants';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ReachableTile } from '@common/interfaces/move';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';

describe('GameMapInputService', () => {
    let service: GameMapInputService;
    let gameSocketSpy: jasmine.SpyObj<GameLogicSocketService>;
    let gameMapStateSpy: jasmine.SpyObj<GameMapService>;
    let fightSocketSpy: jasmine.SpyObj<FightSocketService>;
    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;
    let movementSpy: jasmine.SpyObj<MovementService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let arrowHeadVal: ReachableTile | null = null;

    beforeEach(() => {
        gameSocketSpy = jasmine.createSpyObj('GameLogicSocketService', ['processMovement', 'sendOpenDoor']);
        fightSocketSpy = jasmine.createSpyObj('FightSocketService', ['sendDesiredFight']);
        gameMapStateSpy = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0], hoveredTile: MOCK_CLICK_POSITION_1 });
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], {
            hoveredTile: MOCK_CLICK_POSITION_1,
            arrowHead: null,
            actionTiles: [MOCK_CLICK_POSITION_0],
            playableTiles: [MOCK_REACHABLE_TILE],
        });
        Object.defineProperty(renderingStateSpy, 'arrowHead', {
            get: () => arrowHeadVal,
            set: (value: ReachableTile | null) => {
                arrowHeadVal = value;
            },
        });
        movementSpy = jasmine.createSpyObj('MovementService', ['isMoving']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        playerListSpy = jasmine.createSpyObj('PlayerListService', [], { playerList: [MOCK_PLAYERS[0]] });
        TestBed.configureTestingModule({
            providers: [
                { provide: GameLogicSocketService, useValue: gameSocketSpy },
                { provide: FightSocketService, useValue: fightSocketSpy },
                { provide: GameMapService, useValue: gameMapStateSpy },
                { provide: RenderingStateService, useValue: renderingStateSpy },
                { provide: MovementService, useValue: movementSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: PlayerListService, useValue: playerListSpy },
            ],
        });
        service = TestBed.inject(GameMapInputService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.playerInfoClick$).toBeDefined();
        expect(service.tileInfoClick$).toBeDefined();
    });

    it('should return the mouse location in canvas space when there is a mouse event', () => {
        const convertSpy = spyOn<any>(service, 'convertToTilePosition');
        const canvas = document.createElement('canvas');
        const boundingRect = canvas.getBoundingClientRect();
        const eventMock = new MouseEvent('click', { clientX: MOCK_GAME_MAP_CLICK_POSITION.x, clientY: MOCK_GAME_MAP_CLICK_POSITION.y });
        service.getMouseLocation(canvas, eventMock);
        expect(convertSpy).toHaveBeenCalledWith({
            x: Math.max(
                0,
                Math.min(
                    Math.round(((MOCK_GAME_MAP_CLICK_POSITION.x - boundingRect.x) / boundingRect.width) * MAP_PIXEL_DIMENSION),
                    MAP_PIXEL_DIMENSION,
                ),
            ),
            y: Math.max(
                0,
                Math.min(
                    Math.round(((MOCK_GAME_MAP_CLICK_POSITION.y - boundingRect.y) / boundingRect.height) * MAP_PIXEL_DIMENSION),
                    MAP_PIXEL_DIMENSION,
                ),
            ),
        });
    });

    it('should call handleLeft click if left click', () => {
        const leftSpy = spyOn<any>(service, 'playClickHandler');
        service.onMapClick(MOCK_LEFT_MOUSE_EVENT);
        expect(leftSpy).toHaveBeenCalled();
    });

    it('should call handleRight click if right click', () => {
        const rightSpy = spyOn<any>(service, 'infoClickHandler');
        service.onMapClick(MOCK_RIGHT_MOUSE_EVENT);
        expect(rightSpy).toHaveBeenCalled();
    });

    it('should set arrow if current player and stationary', () => {
        const arrowSpy = spyOn<any>(service, 'computeArrow');
        movementSpy.isMoving.and.returnValue(false);
        service.onMapHover(MOCK_LEFT_MOUSE_EVENT);
        expect(arrowSpy).toHaveBeenCalled();
    });

    it('should not set arrow if not current player', () => {
        const arrowSpy = spyOn<any>(service, 'computeArrow');
        movementSpy.isMoving.and.returnValue(true);
        service.onMapHover(MOCK_LEFT_MOUSE_EVENT);
        expect(arrowSpy).not.toHaveBeenCalled();
    });

    it('should set the arrow on compute arrow', () => {
        service['computeArrow']({ ...MOCK_LEFT_MOUSE_EVENT, tilePosition: MOCK_REACHABLE_TILE.position });
        expect(arrowHeadVal?.position.x).toEqual(MOCK_REACHABLE_TILE.position.x);
        expect(arrowHeadVal?.position.y).toEqual(MOCK_REACHABLE_TILE.position.y);
    });

    it('should not set the arrow if there are no matching tiles on compute arrow', () => {
        service['computeArrow']({ ...MOCK_LEFT_MOUSE_EVENT, tilePosition: MOCK_CLICK_POSITION_5 });
        expect(arrowHeadVal?.position.x).not.toEqual(MOCK_CLICK_POSITION_5.x);
        expect(arrowHeadVal?.position.y).not.toEqual(MOCK_CLICK_POSITION_5.y);
    });

    it('should action click if action and not moving', () => {
        movementSpy.isMoving.and.returnValue(false);
        const actionSpy = spyOn<any>(service, 'handleActionTiles').and.returnValue(true);
        const handleMovementSpy = spyOn<any>(service, 'handleMovementTiles');
        service['playClickHandler'](MOCK_LEFT_MOUSE_EVENT);
        expect(actionSpy).toHaveBeenCalled();
        expect(handleMovementSpy).not.toHaveBeenCalled();
    });

    it('should movement click if no actions and not moving', () => {
        movementSpy.isMoving.and.returnValue(false);
        const actionSpy = spyOn<any>(service, 'handleActionTiles').and.returnValue(false);
        const handleMovementSpy = spyOn<any>(service, 'handleMovementTiles');
        service['playClickHandler'](MOCK_LEFT_MOUSE_EVENT);
        expect(actionSpy).toHaveBeenCalled();
        expect(handleMovementSpy).toHaveBeenCalled();
    });

    it('should not do anything if moving', () => {
        movementSpy.isMoving.and.returnValue(true);
        const actionSpy = spyOn<any>(service, 'handleActionTiles').and.returnValue(false);
        const handleMovementSpy = spyOn<any>(service, 'handleMovementTiles');
        service['playClickHandler'](MOCK_LEFT_MOUSE_EVENT);
        expect(actionSpy).not.toHaveBeenCalled();
        expect(handleMovementSpy).not.toHaveBeenCalled();
    });

    it('should not get player info if there are none', () => {
        expect(service['getPlayerInfo'](MOCK_CLICK_POSITION_5)).toBeNull();
    });

    it('should get player info if there are some', () => {
        expect(service['getPlayerInfo'](playerListSpy.playerList[0].playerInGame.currentPosition)).not.toBeNull();
    });

    it('should get tile info', () => {
        expect(service['getTileInfo'](MOCK_CLICK_POSITION_0).tileTerrain).toEqual(
            MOCK_MAPS[0].mapArray[MOCK_CLICK_POSITION_0.y][MOCK_CLICK_POSITION_0.x],
        );
    });

    it('should not do any info if moving', () => {
        movementSpy.isMoving.and.returnValue(true);
        expect(service['infoClickHandler'](MOCK_LEFT_MOUSE_EVENT)).toBeUndefined();
    });

    it('should emit player info if there is a player', () => {
        spyOn<any>(service, 'doesTileHavePlayer').and.returnValue(true);
        spyOn<any>(service, 'getPlayerInfo').and.returnValue(MOCK_PLAYER_INFO);
        const emitSpy = spyOn<any>(service.playerInfoClick$, 'next');
        movementSpy.isMoving.and.returnValue(false);
        service['infoClickHandler'](MOCK_LEFT_MOUSE_EVENT);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit tile info if there is not a player', () => {
        spyOn<any>(service, 'doesTileHavePlayer').and.returnValue(false);
        spyOn<any>(service, 'getTileInfo').and.returnValue(MOCK_TILE_INFO);
        const emitSpy = spyOn<any>(service.tileInfoClick$, 'next');
        movementSpy.isMoving.and.returnValue(false);
        service['infoClickHandler'](MOCK_LEFT_MOUSE_EVENT);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should start fight if opponent is there', () => {
        spyOn<any>(service, 'getPlayerNameOnTile').and.returnValue(MOCK_GOD_NAME);
        expect(service['handleActionTiles'](MOCK_CLICK_POSITION_0)).toBeTrue();
        expect(fightSocketSpy.sendDesiredFight).toHaveBeenCalled();
    });

    it('should toggle door if door is there', () => {
        spyOn<any>(service, 'getPlayerNameOnTile').and.returnValue(null);
        expect(service['handleActionTiles'](MOCK_CLICK_POSITION_0)).toBeTrue();
        expect(gameSocketSpy.sendOpenDoor).toHaveBeenCalled();
    });

    it('should do nothing if nothing is there', () => {
        expect(service['handleActionTiles'](MOCK_CLICK_POSITION_5)).toBeFalse();
    });

    it('should not move if no playable tiles were found', () => {
        spyOn<any>(service, 'getPlayableTile').and.returnValue(null);
        service['handleMovementTiles'](MOCK_CLICK_POSITION_5);
        expect(gameSocketSpy.processMovement).not.toHaveBeenCalled();
    });

    it('should do nothing if nothing is there', () => {
        spyOn<any>(service, 'getPlayableTile').and.returnValue(MOCK_REACHABLE_TILE);
        service['handleMovementTiles'](MOCK_CLICK_POSITION_0);
        expect(gameSocketSpy.processMovement).toHaveBeenCalled();
    });

    it('should not return a playable tile with a player on it', () => {
        spyOn<any>(service, 'doesTileHavePlayer').and.returnValue(true);
        expect(service['getPlayableTile'](MOCK_CLICK_POSITION_0)).toBeNull();
    });

    it('should return a playable tile with no players on it', () => {
        spyOn<any>(service, 'doesTileHavePlayer').and.returnValue(false);
        expect(service['getPlayableTile'](MOCK_CLICK_POSITION_0)).not.toBeNull();
    });

    it('should return nothing if not a playable tile', () => {
        spyOn<any>(service, 'doesTileHavePlayer').and.returnValue(false);
        expect(service['getPlayableTile'](MOCK_CLICK_POSITION_5)).toBeNull();
    });

    it('should return a player if there is one', () => {
        spyOn(playerListSpy.playerList, 'find').and.returnValue(MOCK_PLAYERS[0]);
        expect(service['getPlayerNameOnTile'](MOCK_CLICK_POSITION_0)).not.toBeNull();
    });

    it('should return null if there are no players', () => {
        spyOn(playerListSpy.playerList, 'find').and.returnValue(undefined);
        expect(service['getPlayerNameOnTile'](MOCK_CLICK_POSITION_5)).toBeNull();
    });

    it('should have a player if there is a name', () => {
        spyOn<any>(service, 'getPlayerNameOnTile').and.returnValue(MOCK_GOD_NAME);
        expect(service['doesTileHavePlayer'](MOCK_CLICK_POSITION_0)).toBeTrue();
    });

    it("should not have a player if there isn't a name", () => {
        spyOn<any>(service, 'getPlayerNameOnTile').and.returnValue(null);
        expect(service['doesTileHavePlayer'](MOCK_CLICK_POSITION_5)).toBeFalse();
    });

    it('should convert from pixel to tile position', () => {
        gameMapStateSpy.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        const result = service['convertToTilePosition']({
            x: MOCK_CLICK_POSITION_0.x * MOCK_TILE_DIMENSION,
            y: MOCK_CLICK_POSITION_0.y * MOCK_TILE_DIMENSION,
        });
        expect(result.x).toEqual(MOCK_CLICK_POSITION_0.x);
        expect(result.y).toEqual(MOCK_CLICK_POSITION_0.y);
    });
});
