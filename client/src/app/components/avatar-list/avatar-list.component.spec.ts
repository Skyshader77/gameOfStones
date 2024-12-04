import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AvatarListService } from '@app/services/states/avatar-list/avatar-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { BehaviorSubject } from 'rxjs';
import { AvatarListComponent } from './avatar-list.component';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

describe('AvatarListComponent', () => {
    let component: AvatarListComponent;
    let fixture: ComponentFixture<AvatarListComponent>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let avatarListService: jasmine.SpyObj<AvatarListService>;

    beforeEach(async () => {
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['isOrganizer']);
        avatarListService = jasmine.createSpyObj('AvatarListService', ['sendAvatarRequest', 'setSelectedAvatar'], {
            selectedAvatar: new BehaviorSubject<Avatar>(0),
            avatarsTakenState: [false, false, false],
        });

        await TestBed.configureTestingModule({
            imports: [AvatarListComponent, ReactiveFormsModule],
            providers: [
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: AvatarListService, useValue: avatarListService },
            ],
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
        avatarListService.selectedAvatar.next(1);
        fixture.detectChanges();

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
        component.selectAvatar(0);
        fixture.detectChanges();

        expect(component.selectedAvatar).toBe(0);
        expect(component.avatarsListControl?.value).toBe(0);
    });

    it('should return true if isOrganizer from MyPlayerService returns true', () => {
        myPlayerService.isOrganizer.and.returnValue(true);
        expect(component.isOrganizer).toBeTrue();
    });

    it('should return false if isOrganizer from MyPlayerService returns false', () => {
        myPlayerService.isOrganizer.and.returnValue(false);
        expect(component.isOrganizer).toBeFalse();
    });

    it('should call sendAvatarRequest on AvatarListService when requestSelectAvatar is called', () => {
        const selectedIndex = 2;
        component.requestSelectAvatar(selectedIndex);
        expect(avatarListService.sendAvatarRequest).toHaveBeenCalledWith(selectedIndex as Avatar);
    });
});
