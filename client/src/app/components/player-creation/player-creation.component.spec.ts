import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AVATARS } from '@app/constants/player.constants';
import { PlayerCreationComponent } from './player-creation.component';

describe('PlayerCreationComponent', () => {
    let component: PlayerCreationComponent;
    let fixture: ComponentFixture<PlayerCreationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerCreationComponent, ReactiveFormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const setFormValues = (name: string, avatarId: number, statsBonus: string, dice6: string) => {
        component.getFormControl('name').setValue(name);
        component.getFormControl('avatarId').setValue(avatarId);
        component.getFormControl('statsBonus').setValue(statsBonus);
        component.getFormControl('dice6').setValue(dice6);
        fixture.detectChanges();
    };

    const getSubmitButton = (): HTMLButtonElement => {
        return fixture.nativeElement.querySelector('button[type="submit"]');
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should invalidate name when it is over the max length', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongName');
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true, maxlength: jasmine.anything() });
    });

    it('should invalidate name when it contains special characters', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('Invalid@Name');
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it is empty', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('   ');
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should validate name when it is valid', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('Valid Name');
        expect(nameControl.valid).toBeTrue();
        expect(nameControl.errors).toBeNull();
    });

    it('should invalidate avatarId if it is outside expected values', () => {
        const avatarControl = component.getFormControl('avatarId');
        avatarControl.setValue(-1);
        expect(avatarControl.valid).toBeFalse();
        expect(avatarControl.errors).toEqual({ invalid: true });

        avatarControl.setValue(AVATARS.length);
        expect(avatarControl.valid).toBeFalse();
        expect(avatarControl.errors).toEqual({ invalid: true });
    });

    it('should disable the "Créer" button when the form is invalid', () => {
        setFormValues(' I$vali44_?!@#N%me', AVATARS.length, 'nothing', 'nowhere');
        const button = getSubmitButton();
        expect(button.disabled).toBeTrue();
    });

    it('should enable the "Créer" button when the form is valid', () => {
        setFormValues('ValidName', 1, 'speed', 'defense');
        const button = getSubmitButton();
        expect(button.disabled).toBeFalse();
    });

    it('should emit the submission event onSubmit', () => {
        spyOn(component.submissionEvent, 'emit');
        component.onSubmit();
        expect(component.submissionEvent.emit).toHaveBeenCalled();
    });

    it('should clear the form onSubmit', () => {
        spyOn(component.playerForm, 'reset');
        component.onSubmit();
        expect(component.playerForm.reset).toHaveBeenCalled();
    });
});
