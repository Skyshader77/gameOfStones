import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MyPlayerService } from './my-player.service';

describe('MyPlayerService', () => {
    let service: MyPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MyPlayerService],
        });
        service = TestBed.inject(MyPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isOrganizer should return true if the role is Organizer', () => {
        service.role = PlayerRole.Organizer;
        expect(service.isOrganizer()).toBeTrue();
    });

    it('isOrganizer should return false if the role is not Organizer', () => {
        service.role = PlayerRole.Human;
        expect(service.isOrganizer()).toBeFalse();
    });

    it('getUserName should return the userName of myPlayer if it is defined', () => {
        service.myPlayer = {
            playerInfo: {
                userName: 'TestUser',
            },
        } as Player;
        expect(service.getUserName()).toBe('TestUser');
    });

    it('getUserName should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getUserName()).toBeUndefined();
    });
});
