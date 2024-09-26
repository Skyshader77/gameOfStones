import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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

    it('should invalidate name when it is less than 3 characters', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('A');
        expect(nameControl.valid).toBeFalsy();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it is over than 20 characters', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('AveryLongNameThatExceedsTwentyCharacters');
        expect(nameControl.valid).toBeFalsy();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it contains spaces', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('Invalid Name');
        expect(nameControl.valid).toBeFalsy();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it contains special characters', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('Invalid@Name');
        expect(nameControl.valid).toBeFalsy();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it is empty', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('   ');
        expect(nameControl.valid).toBeFalsy();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should validate name when it is valid', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue('ValidName');
        expect(nameControl.valid).toBeTruthy();
        expect(nameControl.errors).toBeNull();
    });

    it('should disable the "Créer" button when the form is invalid', () => {
        const testCases = [
            { name: 'A', avatarId: 1, statsBonus: 'hp', dice6: 'attack' },
            { name: 'AveryLongNameThatExceedsTwentyCharacters', avatarId: 1, statsBonus: 'hp', dice6: 'attack' },
            { name: 'Invalid Name', avatarId: 1, statsBonus: 'hp', dice6: 'attack' },
            { name: 'Invalid@Name', avatarId: 1, statsBonus: 'hp', dice6: 'attack' },
            { name: '', avatarId: 1, statsBonus: 'hp', dice6: 'attack' },
            { name: 'ValidName', avatarId: 1, statsBonus: '', dice6: 'attack' },
            { name: 'ValidName', avatarId: 1, statsBonus: 'hp', dice6: '' },
        ];

        for (const { name, avatarId, statsBonus, dice6 } of testCases) {
            setFormValues(name, avatarId, statsBonus, dice6);
            const button = getSubmitButton();
            expect(button.disabled).toBeTruthy();
        }
    });

    it('should enable the "Créer" button when the form is valid', () => {
        setFormValues('ValidName', 1, 'speed', 'defense');
        const button = getSubmitButton();
        expect(button.disabled).toBeFalsy();
    });
});
