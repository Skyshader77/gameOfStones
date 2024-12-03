import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingFightComponent } from './waiting-fight.component';

describe('WaitingFightComponent', () => {
    let component: WaitingFightComponent;
    let fixture: ComponentFixture<WaitingFightComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WaitingFightComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingFightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
