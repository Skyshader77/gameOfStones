import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerListComponent } from './player-list.component';
import { MOCK_PLAYER_DATA } from '@app/constants/tests.constants';

describe('PlayersListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        component.playerList = JSON.parse(JSON.stringify(MOCK_PLAYER_DATA));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should remove a player by id', () => {
        const playerIdToRemove = '2';

        component.removePlayer(playerIdToRemove);

        const playerExists = component.playerList.some((player) => player.id === playerIdToRemove);
        expect(playerExists).toBeFalse();
    });
});
