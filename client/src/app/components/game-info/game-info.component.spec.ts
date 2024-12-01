import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVATAR_FOLDER } from '@app/constants/player.constants';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { DEBUG_MODE_MESSAGE } from '@common/constants/gameplay.constants';
import { GameInfoComponent } from './game-info.component';

describe('GameInfoComponent', () => {
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;
    let mockPlayerListService: jasmine.SpyObj<PlayerListService>;
    let gameMapService: jasmine.SpyObj<GameMapService>;
    let debugService: jasmine.SpyObj<DebugModeService>;

    beforeEach(async () => {
        mockPlayerListService = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'getPlayerListCount']);
        gameMapService = jasmine.createSpyObj('GameMapService', ['getMapSize']);
        debugService = jasmine.createSpyObj('DebugModeService', ['getDebug']);

        await TestBed.configureTestingModule({
            imports: [GameInfoComponent],
            providers: [
                { provide: PlayerListService, useValue: mockPlayerListService },
                { provide: GameMapService, useValue: gameMapService },
                { provide: DebugModeService, useValue: debugService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should return the correct avatar path from currentProfile', () => {
        mockPlayerListService.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        const result = component.currentProfile;
        expect(result).toBe(AVATAR_FOLDER + 'clericF.jpeg');
    });

    it('should return an empty string when no current player is available', () => {
        mockPlayerListService.getCurrentPlayer.and.returnValue(undefined);

        const result = component.currentProfile;
        expect(result).toBe('');
    });

    it('should return an empty string when debug is false', () => {
        debugService.getDebug.and.returnValue(false);

        const result = component.debugMode;

        expect(result).toBe('');
    });

    it('should return DEBUG_MODE_MESSAGE when debug mode is active', () => {
        debugService.getDebug.and.returnValue(true);

        const result = component.debugMode;

        expect(result).toBe(DEBUG_MODE_MESSAGE);
    });
});
