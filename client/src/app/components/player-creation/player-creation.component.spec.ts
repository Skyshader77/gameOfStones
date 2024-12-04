import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AVATAR_LIST_LENGTH } from '@app/constants/tests.constants';
import { AvatarListService } from '@app/services/states/avatar-list/avatar-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { BehaviorSubject } from 'rxjs';
import { PlayerCreationComponent } from './player-creation.component';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';

const LONG_NAME = 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongName';
const INVALID_NAME = 'VER%^&*&^%$#!QAS#';
const VALID_NAME = 'Othmane';
const SPACE_NAME = '    ';

describe('PlayerCreationComponent', () => {
    let component: PlayerCreationComponent;
    let fixture: ComponentFixture<PlayerCreationComponent>;
    let avatarListService: jasmine.SpyObj<AvatarListService>;

    beforeEach(async () => {
        const avatarListMock = {
            selectedAvatar: new BehaviorSubject<Avatar>(Avatar.MaleRanger),
            setSelectedAvatar: jasmine.createSpy('setSelectedAvatar'),
            avatarList: Array(AVATAR_LIST_LENGTH).fill(false),
        };
        avatarListService = jasmine.createSpyObj('AvatarListService', ['setSelectedAvatar']);
        avatarListService.selectedAvatar = avatarListMock.selectedAvatar;
        avatarListService.avatarsTakenState = avatarListMock.avatarList;
        await TestBed.configureTestingModule({
            imports: [PlayerCreationComponent, ReactiveFormsModule],
            providers: [{ provide: AvatarListService, useValue: avatarListService }],
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
        nameControl.setValue(LONG_NAME);
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true, maxlength: jasmine.anything() });
    });

    it('should invalidate name when it contains special characters', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue(INVALID_NAME);
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should invalidate name when it is empty', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue(SPACE_NAME);
        expect(nameControl.valid).toBeFalse();
        expect(nameControl.errors).toEqual({ invalid: true });
    });

    it('should validate name when it is valid', () => {
        const nameControl = component.getFormControl('name');
        nameControl.setValue(VALID_NAME);
        expect(nameControl.valid).toBeTrue();
        expect(nameControl.errors).toBeNull();
    });

    it('should invalidate avatarId if it is outside expected values', () => {
        const avatarControl = component.getFormControl('avatarId');
        avatarControl.setValue(-1);
        expect(avatarControl.valid).toBeFalse();
        expect(avatarControl.errors).toEqual({ invalid: true });

        avatarControl.setValue(Object.keys(AVATAR_PROFILE).length);
        expect(avatarControl.valid).toBeFalse();
        expect(avatarControl.errors).toEqual({ invalid: true });
    });

    it('should disable the "Créer" button when the form is invalid', () => {
        setFormValues(INVALID_NAME, Object.keys(AVATAR_PROFILE).length, 'nothing', 'nowhere');
        const button = getSubmitButton();
        expect(button.disabled).toBeTrue();
    });

    it('should enable the "Créer" button when the form is valid', () => {
        setFormValues(VALID_NAME, 1, 'speed', 'defense');
        const button = getSubmitButton();
        expect(button.disabled).toBeFalse();
    });

    it('should emit the submission event onSubmit', () => {
        spyOn(component.submissionEvent, 'emit');
        component.onSubmit();
        expect(component.submissionEvent.emit).toHaveBeenCalled();
    });

    it('should clear the form onClose', () => {
        spyOn(component.playerForm, 'reset');
        component.onClose();
        expect(component.playerForm.reset).toHaveBeenCalled();
    });

    it('should emit the close event onClose', () => {
        spyOn(component.closeEvent, 'emit');
        component.onClose();
        expect(component.closeEvent.emit).toHaveBeenCalled();
    });
});
