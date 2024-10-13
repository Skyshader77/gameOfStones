import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MOCK_ROOM } from '@app/constants/tests.constants';
import { RoomPageComponent } from './room-page.component';

describe('RoomPageComponent', () => {
    let component: RoomPageComponent;
    let fixture: ComponentFixture<RoomPageComponent>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(MOCK_ROOM.roomCode),
                },
            },
        });

        await TestBed.configureTestingModule({
            imports: [RoomPageComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: routeSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RoomPageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the roomId from the url', () => {
        component.ngOnInit();
        expect(component.roomId).toBe(MOCK_ROOM.roomCode);
    });

    it('should display the roomId if it is valid', () => {
        expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toContain('Numéro de salle: ' + component.roomId);
    });

    it('should give an empty roomId if it is invalid', () => {
        (routeSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

        component.ngOnInit();
        expect(component.roomId).toBe('');
    });

    it('should give an error message if roomId is invalid', () => {
        (routeSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent).toContain('Erreur');
    });

    it('should toggle isRoomLocked value when toggleRoomLock is called', () => {
        component.isRoomLocked = false;
        component.toggleRoomLock();
        expect(component.isRoomLocked).toBeTrue();
        component.toggleRoomLock();
        expect(component.isRoomLocked).toBeFalse();
    });
});
