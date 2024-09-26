import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AvatarListComponent } from './avatar-list.component';

describe('AvatarListComponent', () => {
    let component: AvatarListComponent;
    let fixture: ComponentFixture<AvatarListComponent>;
    const AVATAR_NUMBER = 12;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarListComponent, ReactiveFormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarListComponent);
        component = fixture.componentInstance;
        component.avatarsListcontrol = new FormControl();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the default avatar in the FormControl during initialization', () => {
        component.ngOnInit();
        expect(component.avatarsListcontrol?.value).toBe(0);
    });

    it('should update the selected avatar and form control value when an avatar is selected', () => {
        component.selectAvatar(1);
        expect(component.selectedAvatar).toBe(1);
        expect(component.avatarsListcontrol?.value).toBe(1);
    });

    it('should receive and use a FormControl from the parent', () => {
        const formControl = new FormControl();
        component.avatarsListcontrol = formControl;
        component.ngOnInit();
        expect(component.avatarsListcontrol).toBe(formControl);
    });

    it('should have a list of avatars containing 12 elements', () => {
        expect(component.avatars.length).toBe(AVATAR_NUMBER);
    });

    it('should select an avatar when the user clicks on an avatar image', () => {
        const avatarElement = fixture.nativeElement.querySelector('.avatar');
        avatarElement.click();
        fixture.detectChanges();
        expect(component.selectedAvatar).toBe(0);
        expect(component.avatarsListcontrol?.value).toBe(0);
    });

    it('should display the list of avatars when the dropdown is activated', () => {
        const dropdown = fixture.nativeElement.querySelector('.dropdown');
        dropdown.click();
        fixture.detectChanges();

        const avatarsList = fixture.nativeElement.querySelectorAll('.dropdown-content .avatar');
        expect(avatarsList.length).toBe(component.avatars.length);
    });
});
