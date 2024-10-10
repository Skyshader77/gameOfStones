import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FightInfoComponent } from './fight-info.component';

describe('FightInfoComponent', () => {
    let component: FightInfoComponent;
    let fixture: ComponentFixture<FightInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FightInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FightInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
