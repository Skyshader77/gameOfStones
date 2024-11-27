/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { PlayButtonsService } from './play-buttons.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { MOCK_MAPS, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';

describe('PlayButtonsService', () => {
    let service: PlayButtonsService;
    let fightSpy: jasmine.SpyObj<FightSocketService>;
    let mySpy: jasmine.SpyObj<MyPlayerService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let mapSpy: jasmine.SpyObj<GameMapService>;
    let renderingStateSpy: jasmine.SpyObj<RenderingStateService>;
    let actionMock = false;

    beforeEach(() => {
        fightSpy = jasmine.createSpyObj('FightSocketService', ['sendDesiredAttack', 'sendDesiredEvade']);
        mySpy = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: false, isCurrentFighter: false });
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        mapSpy = jasmine.createSpyObj('GameMapService', [], { map: MOCK_MAPS[0] });
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], { actionTiles: [] });
        Object.defineProperty(renderingStateSpy, 'displayActions', {
            get: () => {
                return false;
            },
            set: (newVal: boolean) => {
                actionMock = newVal;
            },
        });
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

    it('should do toggle action visuals', () => {
        Object.defineProperty(mySpy, 'isCurrentPlayer', { value: true });
        playerListSpy.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        service.clickActionButton();
        // TODO check the setter
        expect(actionMock).toBeTrue();
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
});
