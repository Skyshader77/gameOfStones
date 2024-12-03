import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_PLACEHOLDER } from '@app/constants/game-stats.constants';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { GameStatsStateService } from '@app/services/states/game-stats-state/game-stats-state.service';
import { MOCK_GAME_END_STATS } from '@common/constants/game-end-test.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameEndStats } from '@common/interfaces/end-statistics';
import { Map } from '@common/interfaces/map';
import { StatsGlobalComponent } from './stats-global.component';

describe('StatsGlobalComponent', () => {
    let component: StatsGlobalComponent;
    let fixture: ComponentFixture<StatsGlobalComponent>;
    let gameStatsStateServiceMock: jasmine.SpyObj<GameStatsStateService>;
    let gameMapServiceMock: jasmine.SpyObj<GameMapService>;

    beforeEach(async () => {
        gameStatsStateServiceMock = jasmine.createSpyObj('GameStatsStateService', ['gameStats']);
        gameMapServiceMock = jasmine.createSpyObj('GameMapService', ['map']);

        await TestBed.configureTestingModule({
            imports: [StatsGlobalComponent],
            providers: [
                { provide: GameStatsStateService, useValue: gameStatsStateServiceMock },
                { provide: GameMapService, useValue: gameMapServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsGlobalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Properties', () => {
        it('should get gameTime correctly', () => {
            const timeTaken = 150;
            gameStatsStateServiceMock.gameStats = { timeTaken } as GameEndStats;
            expect(component.gameTime).toBe(timeTaken);
        });

        it('should get totalTurn correctly', () => {
            const turnCount = 5;
            gameStatsStateServiceMock.gameStats = { turnCount } as GameEndStats;
            expect(component.totalTurn).toBe(turnCount);
        });

        it('should format percentageVisitedTiles correctly', () => {
            const percentageTilesTraversed = 0.5;
            const percentageTilesTraversedString = '50';
            gameStatsStateServiceMock.gameStats = { percentageTilesTraversed } as GameEndStats;
            expect(component.percentageVisitedTiles).toBe(percentageTilesTraversedString);
        });

        it('should return DEFAULT_PLACEHOLDER if percentageVisitedTiles is null', () => {
            gameStatsStateServiceMock.gameStats = { percentageTilesTraversed: null } as unknown as GameEndStats;
            expect(component.percentageVisitedTiles).toBe(null);
        });

        it('should format percentageDoorsManipulated correctly', () => {
            const percentageDoorsUsed = 0.25;
            const percentageDoorsUsedString = '25';
            gameStatsStateServiceMock.gameStats = { percentageDoorsUsed } as GameEndStats;
            expect(component.percentageDoorsManipulated).toBe(percentageDoorsUsedString);
        });

        it('should return DEFAULT_PLACEHOLDER if percentageDoorsManipulated is null', () => {
            gameStatsStateServiceMock.gameStats = { percentageDoorsUsed: null } as GameEndStats;
            expect(component.percentageDoorsManipulated).toBe(null);
        });

        it('should get playerWithFlag correctly when mode is CTF', () => {
            const numberOfPlayersWithFlag = 3;
            gameStatsStateServiceMock.gameStats = { numberOfPlayersWithFlag } as GameEndStats;
            gameMapServiceMock.map = { mode: GameMode.CTF } as Map;
            expect(component.playerWithFlag).toBe(numberOfPlayersWithFlag);
        });

        it('should get playerWithFlag correctly when gameStats are not properly defined', () => {
            gameStatsStateServiceMock.gameStats = undefined as unknown as GameEndStats;
            gameMapServiceMock.map = { mode: GameMode.CTF } as Map;
            expect(component.playerWithFlag).toBe(0);
        });

        it('should check if the game mode is CTF', () => {
            gameMapServiceMock.map = { mode: GameMode.CTF } as Map;
            expect(component.isCTF).toBeTrue();
        });

        it('should return false for isCTF when mode is not CTF', () => {
            gameMapServiceMock.map = { mode: GameMode.Normal } as Map;
            expect(component.isCTF).toBeFalse();
        });
    });

    describe('initializeColumns', () => {
        it('should initialize globalStatsColumns correctly', () => {
            const mockGameStats = {
                timeTaken: 150,
                turnCount: 5,
                percentageTilesTraversed: 0.5,
                percentageDoorsUsed: 0.25,
                numberOfPlayersWithFlag: 3,
            };
            gameStatsStateServiceMock.gameStats = mockGameStats as GameEndStats;
            gameMapServiceMock.map = { mode: GameMode.CTF } as Map;

            component['initializeColumns']();

            expect(component.globalStatsColumns.length).toBeGreaterThan(0);
            expect(component.globalStatsColumns[0].value).toBe('02:30');
            expect(component.globalStatsColumns[1].value).toBe('5');
            expect(component.globalStatsColumns[2].value).toBe('50');
            expect(component.globalStatsColumns[3].value).toBe('25');
            expect(component.globalStatsColumns[4].value).toBe('3');
        });
    });

    it('should use DEFAULT_PLACEHOLDER if valueResolvers does not resolve a value', () => {
        gameStatsStateServiceMock.gameStats = MOCK_GAME_END_STATS;
        gameMapServiceMock.map = { mode: GameMode.CTF } as Map;

        Object.defineProperty(component, 'valueResolvers', {
            value: {},
        });

        component['initializeColumns']();

        expect(component.globalStatsColumns[0].value).toBe(DEFAULT_PLACEHOLDER);
    });
});
