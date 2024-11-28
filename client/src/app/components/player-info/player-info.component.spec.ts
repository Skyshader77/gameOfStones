import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_DICE } from '@app/constants/tests.constants';
import { PlayerInfoComponent } from './player-info.component';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

describe('PlayerInfoComponent', () => {
    let component: PlayerInfoComponent;
    let fixture: ComponentFixture<PlayerInfoComponent>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    const REMAINING_MOVEMENT = 3;
    const SPEED = 5;
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

    it('should return the correct movement string from myMovement', () => {
        myPlayerSpy.getRemainingMovement.and.returnValue(REMAINING_MOVEMENT);
        myPlayerSpy.getSpeed.and.returnValue(SPEED);

        const movement = component.myMovement;

        expect(movement).toBe(`👣 ${REMAINING_MOVEMENT} / ${SPEED}`);
    });
});
