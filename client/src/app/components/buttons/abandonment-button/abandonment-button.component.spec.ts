import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbandonmentButtonComponent } from './abandonment-button.component';
describe('AbandonmentButtonComponent', () => {
    let component: AbandonmentButtonComponent;
    let fixture: ComponentFixture<AbandonmentButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AbandonmentButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AbandonmentButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
