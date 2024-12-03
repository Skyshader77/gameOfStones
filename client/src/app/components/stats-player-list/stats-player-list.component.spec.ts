import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_PLAYER_STATS } from '@app/constants/tests.constants';
import { GameStatsStateService } from '@app/services/states/game-stats-state/game-stats-state.service';
import { GameEndStats } from '@common/interfaces/end-statistics';
import { StatsPlayerListComponent } from './stats-player-list.component';
import { AudioService } from '@app/services/audio/audio.service';

describe('StatsPlayerListComponent', () => {
    let component: StatsPlayerListComponent;
    let fixture: ComponentFixture<StatsPlayerListComponent>;
    let gameStatsStateServiceMock: jasmine.SpyObj<GameStatsStateService>;
    let audioSpy: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        gameStatsStateServiceMock = jasmine.createSpyObj('GameStatsStateService', ['gameStats']);
        gameStatsStateServiceMock.gameStats = {
            playerStats: JSON.parse(JSON.stringify(MOCK_PLAYER_STATS)),
        } as GameEndStats;

        audioSpy = jasmine.createSpyObj('AudioService', ['playSfx']);

        await TestBed.configureTestingModule({
            imports: [StatsPlayerListComponent],
            providers: [
                { provide: GameStatsStateService, useValue: gameStatsStateServiceMock },
                { provide: AudioService, useValue: audioSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsPlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call sortColumn upon initialization', () => {
        spyOn(component, 'sortColumn');
        component.ngOnInit();
        expect(component.sortColumn).toHaveBeenCalled();
    });

    describe('sortColumn', () => {
        it('should sort player stats by selected column in descending order', () => {
            component.sortColumn('fightCount', true);
            const sortedStats = component.playerEndStats;
            expect(sortedStats[0].fightCount).toBeGreaterThan(sortedStats[1].fightCount);
        });

        it('should sort player stats by selected column in ascending order', () => {
            component.sortColumn('fightCount', false);
            const sortedStats = component.playerEndStats;
            expect(sortedStats[0].fightCount).toBeLessThan(sortedStats[1].fightCount);
        });
    });

    describe('getPlayerStats', () => {
        it('should return an array of player stats values with their indexes', () => {
            const player = MOCK_PLAYER_STATS[0];
            const stats = component.getPlayerStats(player);
            expect(stats).toEqual([
                { value: 'Player1', index: 0 },
                { value: 10, index: 1 },
                { value: 6, index: 2 },
                { value: 4, index: 3 },
                { value: 2, index: 4 },
                { value: 10, index: 5 },
                { value: 20, index: 6 },
                { value: 5, index: 7 },
                { value: 80, index: 8 },
            ]);
        });
    });

    describe('sortColumn', () => {
        it('should return 0 when two players have the same value for the selected column', () => {
            const mockStats = [
                { name: 'Player1', fightCount: 10 },
                { name: 'Player2', fightCount: 10 },
                { name: 'Player3', fightCount: 5 },
            ];
            gameStatsStateServiceMock.gameStats = {
                playerStats: mockStats,
            } as GameEndStats;

            component.sortColumn('fightCount', false);

            const sortedStats = component.playerEndStats;

            expect(sortedStats[0].name).toBe('Player3');
            expect(sortedStats[1].name).toBe('Player1');
            expect(sortedStats[2].name).toBe('Player2');
        });
    });
});
