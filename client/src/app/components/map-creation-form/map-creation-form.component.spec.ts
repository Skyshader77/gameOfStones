import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
        expect(form.get('mode')?.value).toBe('classic');
        expect(form.get('size')?.value).toBe('10x10');
    });

    it('should reset the form when onCancel is called', () => {
        spyOn(component.cancelEvent, 'emit');
        component.mapSelectionForm.setValue({
            mode: 'capture-the-flag',
            size: '20x20',
        });

        component.onCancel();

        expect(component.mapSelectionForm.get('mode')?.value).toBe('classic');
        expect(component.mapSelectionForm.get('size')?.value).toBe('10x10');
        expect(component.cancelEvent.emit).toHaveBeenCalled();
    });

    it('should call router.navigate when form is valid and submitted', () => {
        component.mapSelectionForm.setValue({
            mode: 'capture-the-flag',
            size: '15x15',
        });
        component.onSubmit();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit'], {
            state: { data: { mode: 'capture-the-flag', size: '15x15' } },
        });
    });

    it('should not navigate nor close the dialog if the form is invalid on submit', () => {
        component.mapSelectionForm.patchValue({
            mode: '',
            size: '',
        });

        component.onSubmit();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
});
