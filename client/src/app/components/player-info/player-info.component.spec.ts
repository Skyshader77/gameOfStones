import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerInfoComponent } from './player-info.component';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { MOCK_DICE } from '@app/constants/tests.constants';

describe('PlayerInfoComponent', () => {
    let component: PlayerInfoComponent;
    let fixture: ComponentFixture<PlayerInfoComponent>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;

    beforeEach(async () => {
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [
            'getUserName',
            'getAvatar',
            'getRemainingHp',
            'getSpeed',
            'getAttack',
            'getDefense',
            'getMaxHp',
            'getRemainingMovement',
            'getDice',
            'getRemainingActions',
        ]);
        myPlayerSpy.getDice.and.returnValue(MOCK_DICE);
        await TestBed.configureTestingModule({
            imports: [PlayerInfoComponent],
            providers: [{ provide: MyPlayerService, useValue: myPlayerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
