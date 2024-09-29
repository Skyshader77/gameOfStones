import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StandardMessageDialogboxComponent } from './standard-message-dialogbox.component';

describe('StandardMessageDialogboxComponent', () => {
    let component: StandardMessageDialogboxComponent;
    let fixture: ComponentFixture<StandardMessageDialogboxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StandardMessageDialogboxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StandardMessageDialogboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the provided title and content', () => {
        component.title = 'Test Title';
        component.content = 'Test content.';
        fixture.detectChanges();

        const titleElement = fixture.debugElement.query(By.css('.dialog-title'));
        const contentElement = fixture.debugElement.query(By.css('.dialog-content'));

        expect(titleElement.nativeElement.textContent).toContain('Test Title');
        expect(contentElement.nativeElement.textContent).toContain('Test content.');
    });

    it('should display the confirmation button when the input triggering the button appearance is true', () => {
        component.isConfirmationForm = true;
        fixture.detectChanges();

        const confirmElement = fixture.debugElement.query(By.css('.confirm-button'));
        expect(confirmElement).toBeTruthy();
    });

    it('should display the confirmation button when the input triggering the button appearance is false', () => {
        component.isConfirmationForm = false;
        fixture.detectChanges();

        const confirmElement = fixture.debugElement.query(By.css('.confirm-button'));
        expect(confirmElement).toBeFalsy();
    });
});
