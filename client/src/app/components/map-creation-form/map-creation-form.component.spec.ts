import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
import { MapCreationFormComponent } from './map-creation-form.component';

describe('MapCreationFormComponent', () => {
    let component: MapCreationFormComponent;
    let fixture: ComponentFixture<MapCreationFormComponent>;
    const mockRouter = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, MapCreationFormComponent],
            providers: [FormBuilder, { provide: Router, useValue: mockRouter }],
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
        expect(form.get('mode')?.value).toBe(GameMode.NORMAL);
        expect(form.get('size')?.value).toBe(MapSize.SMALL);
    });

    it('should reset the form when onCancel is called', () => {
        spyOn(component.cancelEvent, 'emit');
        component.mapSelectionForm.setValue({
            mode: GameMode.CTF,
            size: MapSize.LARGE,
        });

        component.onCancel();

        expect(component.mapSelectionForm.get('mode')?.value).toBe(GameMode.NORMAL);
        expect(component.mapSelectionForm.get('size')?.value).toBe(MapSize.SMALL);
        expect(component.cancelEvent.emit).toHaveBeenCalled();
    });

    it('should call router.navigate when form is valid and submitted', () => {
        component.mapSelectionForm.setValue({
            mode: GameMode.CTF,
            size: MapSize.LARGE,
        });
        component.onSubmit();
        const newMockmap: Map = {
            _id: '0',
            name: '',
            description: '',
            size: component.mapSelectionForm.get('size')?.value,
            mode: component.mapSelectionForm.get('mode')?.value,
            mapArray: [],
            placedItems: [],
            isVisible: true,
            dateOfLastModification: new Date(),
        };
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit'], {
            state: { map: newMockmap, isPresentInDatabase: false },
        });
    });
});
