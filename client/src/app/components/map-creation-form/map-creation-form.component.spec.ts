import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { MapCreationFormComponent, validateIsEnum } from './map-creation-form.component';
import { AudioService } from '@app/services/audio/audio.service';

describe('MapCreationFormComponent', () => {
    let component: MapCreationFormComponent;
    let fixture: ComponentFixture<MapCreationFormComponent>;
    let audioSpy: jasmine.SpyObj<AudioService>;
    const mockRouter = { navigate: jasmine.createSpy('navigate') };
    const mockSubmitEvent = new Event('submit');

    beforeEach(async () => {
        audioSpy = jasmine.createSpyObj('AudioService', ['playSfx']);
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, MapCreationFormComponent],
            providers: [FormBuilder, { provide: Router, useValue: mockRouter }, { provide: AudioService, useValue: audioSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapCreationFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with default values', () => {
        const form = component.mapSelectionForm;
        expect(form).toBeDefined();
        expect(form.get('mode')?.value).toBe(GameMode.Normal);
        expect(form.get('size')?.value).toBe(MapSize.Small);
    });

    it('should reset the form when onCancel is called and it should not naviguate to the edit page', () => {
        spyOn(component.cancelEvent, 'emit');
        component.mapSelectionForm.setValue({
            mode: GameMode.CTF,
            size: MapSize.Large,
        });

        component.onCancel();

        expect(component.mapSelectionForm.get('mode')?.value).toBe(GameMode.Normal);
        expect(component.mapSelectionForm.get('size')?.value).toBe(MapSize.Small);
        expect(component.cancelEvent.emit).toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/edit']);
    });

    it('should call router.navigate when form is valid and submitted', () => {
        component.mapSelectionForm.setValue({
            mode: GameMode.CTF,
            size: MapSize.Large,
        });
        component.onSubmit(mockSubmitEvent);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit'], {
            queryParams: { size: MapSize.Large, mode: GameMode.CTF },
        });
    });

    it('should not call router.navigate when form is invalid and submitted', () => {
        component.mapSelectionForm.setValue({
            mode: '',
            size: '',
        });
        component.onSubmit(mockSubmitEvent);
        expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/edit']);
    });

    it('should update mode when user selects a different option', () => {
        const selectMode = fixture.debugElement.query(By.css('select[formControlName="mode"]')).nativeElement;
        selectMode.value = selectMode.options[1].value;
        selectMode.dispatchEvent(new Event('change'));

        expect(component.mapSelectionForm.get('mode')?.value).toBe(GameMode.CTF);
    });

    it('should update size when user selects a different option', () => {
        const selectSize = fixture.debugElement.query(By.css('select[formControlName="size"]')).nativeElement;
        selectSize.value = selectSize.options[1].value;
        selectSize.dispatchEvent(new Event('change'));

        expect(component.mapSelectionForm.get('size')?.value).toBe(MapSize.Medium);
    });
});

describe('Map Validators', () => {
    describe('validateGameMode', () => {
        it('should return null for valid game mode', () => {
            const control = { value: GameMode.Normal } as AbstractControl;
            const result = validateIsEnum(GameMode)(control);
            expect(result).toBeNull();
        });

        it('should return an error object for invalid game mode', () => {
            const control = { value: '' } as AbstractControl;
            const result = validateIsEnum(GameMode)(control);
            expect(result).toEqual({ invalid: true });
        });
    });

    describe('validateMapSize', () => {
        it('should return null for valid map size', () => {
            const control = { value: MapSize.Small } as AbstractControl;
            const result = validateIsEnum(MapSize)(control);
            expect(result).toBeNull();
        });

        it('should return an error object for invalid map size', () => {
            const control = { value: '' } as AbstractControl;
            const result = validateIsEnum(MapSize)(control);
            expect(result).toEqual({ invalid: true });
        });
    });
});
