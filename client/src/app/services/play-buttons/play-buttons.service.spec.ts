/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { PlayButtonsService } from './play-buttons.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { MOCK_MAPS, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';

describe('PlayButtonsService', () => {
    let service: PlayButtonsService;
    let fightSpy: jasmine.SpyObj<FightSocketService>;
    let mySpy: jasmine.SpyObj<MyPlayerService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let mapSpy: jasmine.SpyObj<GameMapService>;
    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;

    beforeEach(() => {
        fightSpy = jasmine.createSpyObj('FightSocketService', ['sendDesiredAttack', 'sendDesiredEvade']);
        mySpy = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: false, isCurrentFighter: false });
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        mapSpy = jasmine.createSpyObj('GameMapService', [], { map: MOCK_MAPS[0] });
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], { actionTiles: [] });
        TestBed.configureTestingModule({
            providers: [
                { provide: FightSocketService, useValue: fightSpy },
                { provide: MyPlayerService, useValue: mySpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameMapService, useValue: mapSpy },
                { provide: RenderingStateService, useValue: renderingStateSpy },
            ],
        });
        service = TestBed.inject(PlayButtonsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not do action if not current player', () => {
        service.clickActionButton();
        expect(playerListSpy.getCurrentPlayer).not.toHaveBeenCalled();
    });

    it('should not do action if no currentPlayer', () => {
        const actionSpy = spyOn<any>(service, 'determineActionTiles');
        Object.defineProperty(mySpy, 'isCurrentPlayer', { value: true });
        playerListSpy.getCurrentPlayer.and.returnValue(undefined);
        service.clickActionButton();
        expect(actionSpy).not.toHaveBeenCalled();
    });

    it('should do action', () => {
        const actionSpy = spyOn<any>(service, 'determineActionTiles');
        Object.defineProperty(mySpy, 'isCurrentPlayer', { value: true });
        playerListSpy.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        service.clickActionButton();
        expect(actionSpy).toHaveBeenCalled();
    });

    it('should attack if currentFighter', () => {
        Object.defineProperty(mySpy, 'isCurrentFighter', { value: true });
        service.clickAttackButton();
        expect(fightSpy.sendDesiredAttack).toHaveBeenCalled();
    });

    it('should not attack if not currentFighter', () => {
        service.clickAttackButton();
        expect(fightSpy.sendDesiredAttack).not.toHaveBeenCalled();
    });

    it('should evade if currentFighter', () => {
        Object.defineProperty(mySpy, 'isCurrentFighter', { value: true });
        service.clickEvadeButton();
        expect(fightSpy.sendDesiredEvade).toHaveBeenCalled();
    });

    it('should not evade if not currentFighter', () => {
        service.clickEvadeButton();
        expect(fightSpy.sendDesiredEvade).not.toHaveBeenCalled();
    });

    it('should not evade if not currentFighter', () => {
        service.clickEvadeButton();
        expect(fightSpy.sendDesiredEvade).not.toHaveBeenCalled();
    });

    it('should be action tile if door', () => {
        expect(service['isActionTile']({ x: 0, y: 0 }, [[TileTerrain.OpenDoor]])).toBeTrue();

        expect(service['isActionTile']({ x: 0, y: 0 }, [[TileTerrain.ClosedDoor]])).toBeTrue();
    });

    it('should be action tile if player is on it', () => {
        Object.defineProperty(playerListSpy, 'playerList', { value: [MOCK_PLAYERS[0]] });
        expect(service['isActionTile']({ x: 0, y: 0 }, [[TileTerrain.Grass]])).toBeTrue();
    });

    it('should be within boundaries if within map', () => {
        expect(service['isCoordinateWithinBoundaries']({ x: 0, y: 0 }, [[TileTerrain.Grass]])).toBeTrue();
    });

    it('should not be within boundaries if outside map', () => {
        expect(service['isCoordinateWithinBoundaries']({ x: 1, y: 0 }, [[TileTerrain.Grass]])).toBeFalse();
        expect(service['isCoordinateWithinBoundaries']({ x: 0, y: 1 }, [[TileTerrain.Grass]])).toBeFalse();
        expect(service['isCoordinateWithinBoundaries']({ x: -1, y: 0 }, [[TileTerrain.Grass]])).toBeFalse();
        expect(service['isCoordinateWithinBoundaries']({ x: 0, y: -1 }, [[TileTerrain.Grass]])).toBeFalse();
    });

    it('should not add action tile if no action tiles', () => {
        spyOn<any>(service, 'isCoordinateWithinBoundaries').and.returnValue(false);
        spyOn<any>(service, 'isActionTile').and.returnValue(false);
        service['determineActionTiles']({ x: 0, y: 0 }, [[TileTerrain.Grass]]);
        expect(renderingStateSpy.actionTiles.length).toEqual(0);
    });

    it('should add action tile if action tiles', () => {
        spyOn<any>(service, 'isCoordinateWithinBoundaries').and.returnValue(true);
        spyOn<any>(service, 'isActionTile').and.returnValue(true);
        service['determineActionTiles']({ x: 0, y: 0 }, [[TileTerrain.Grass]]);
        expect(renderingStateSpy.actionTiles.length).toBeGreaterThan(0);
    });
});
