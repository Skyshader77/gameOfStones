import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { AvatarListComponent } from './avatar-list.component';

describe('AvatarListComponent', () => {
    let component: AvatarListComponent;
    let fixture: ComponentFixture<AvatarListComponent>;
    let mockMyPlayerService: jasmine.SpyObj<MyPlayerService>;
    beforeEach(async () => {
        mockMyPlayerService = jasmine.createSpyObj('MyPlayerService', ['isOrganizer']);

        await TestBed.configureTestingModule({
            imports: [AvatarListComponent, ReactiveFormsModule],
            providers: [{ provide: MyPlayerService, useValue: mockMyPlayerService }],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarListComponent);
        component = fixture.componentInstance;
        component.avatarsListControl = new FormControl('');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the default avatar in the FormControl during initialization', () => {
        component.ngOnInit();
        expect(component.avatarsListControl?.value).toBe(0);
    });

    it('should update the selected avatar and form control value when an avatar is selected', () => {
        component.selectAvatar(1);
        expect(component.selectedAvatar).toBe(1);
        expect(component.avatarsListControl?.value).toBe(1);
    });

    it('should receive and use a FormControl from the parent', () => {
        const formControl = new FormControl();
        component.avatarsListControl = formControl;
        component.ngOnInit();
        expect(component.avatarsListControl).toBe(formControl);
    });

    it('should select an avatar when the user clicks on an avatar image', () => {
        const avatarElement = fixture.nativeElement.querySelector('.avatar');
        avatarElement.click();
        fixture.detectChanges();
        expect(component.selectedAvatar).toBe(0);
        expect(component.avatarsListControl?.value).toBe(0);
    });

    it('should display the list of avatars when the dropdown is activated', () => {
        const dropdown = fixture.nativeElement.querySelector('.dropdown');
        dropdown.click();
        fixture.detectChanges();

        const avatarsList = fixture.nativeElement.querySelectorAll('.dropdown-content .avatar');
        expect(avatarsList.length).toBe(component.avatars.length);
    });

    it('should return true if isOrganizer returns true', () => {
        mockMyPlayerService.isOrganizer.and.returnValue(true);
        const result = component.isOrganizer;
        expect(result).toBeTrue();
    });

    it('should return false if isOrganizer returns false', () => {
        mockMyPlayerService.isOrganizer.and.returnValue(false);
        const result = component.isOrganizer;
        expect(result).toBeFalse();
    });
});
