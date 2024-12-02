import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { GameInfoComponent } from './game-info.component';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { AVATAR_FOLDER } from '@app/constants/assets.constants';

describe('GameInfoComponent', () => {
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;
    let mockPlayerListService: jasmine.SpyObj<PlayerListService>;
    let gameMapService: jasmine.SpyObj<GameMapService>;

    beforeEach(async () => {
        mockPlayerListService = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'getPlayerListCount']);
        gameMapService = jasmine.createSpyObj('GameMapService', ['getMapSize']);

        await TestBed.configureTestingModule({
            imports: [GameInfoComponent],
            providers: [
                { provide: PlayerListService, useValue: mockPlayerListService },
                { provide: GameMapService, useValue: gameMapService },
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
});
