import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyPageComponent } from './lobby-page.component';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { mockRoom } from '@app/constants/tests.constants';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(mockRoom.roomCode),
                },
            },
        });

        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: routeSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the roomId from the url', () => {
        component.ngOnInit();
        expect(component.id).toBe(mockRoom.roomCode);
    });

    it('should display the roomId if it is valid', () => {
        expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent).toContain('Lobby: ' + component.id);
    });

    it('should give an empty roomId if it is invalid', () => {
        (routeSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

        component.ngOnInit();
        expect(component.id).toBe('');
    });

    it('should give an error message if roomId is invalid', () => {
        (routeSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent).toContain('Erreur');
    });
});
