import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStatsStateService } from '@app/services/states/game-stats-state/game-stats-state.service';
import { StatsPlayerListComponent } from './stats-player-list.component';
import { AudioService } from '@app/services/audio/audio.service';

describe('StatsPlayerListComponent', () => {
    let component: StatsPlayerListComponent;
    let fixture: ComponentFixture<StatsPlayerListComponent>;
    let gameStatsStateServiceMock: jasmine.SpyObj<GameStatsStateService>;
    let audioSpy: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        gameStatsStateServiceMock = {
            gameStats: {
                timeTaken: 100,
                turnCount: 20,
                percentageDoorsUsed: 50,
                percentageTilesTraversed: 75,
                numberOfPlayersWithFlag: 3,
                playerStats: [
                    {
                        name: 'Player 1',
                        fightCount: 10,
                        winCount: 6,
                        lossCount: 4,
                        evasionCount: 2,
                        totalHpLost: 100,
                        totalDamageDealt: 200,
                        itemCount: 5,
                        percentageTilesTraversed: 80,
                    },
                ],
            },
        };

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
});
