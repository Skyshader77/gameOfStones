import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { EditPageService } from '@app/services/edit-page.service';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('MapComponent', () => {
    const mockCurrentMap = {
        rowSize: 10, // Provide a valid rowSize for testing
    };
    let component: MapComponent;
    let editPageServiceSpy: SpyObj<EditPageService>;
    let fixture: ComponentFixture<MapComponent>;
    beforeEach(async () => {
        editPageServiceSpy = jasmine.createSpyObj(
            'EditPageService',
            ['onMouseDownEmptyTile', 'onMouseDownItem', 'onDrop', 'onMouseUp', 'onMouseOver', 'onDragStart', 'onDragEnd'],
            {
                currentMap: mockCurrentMap,
            },
        );
        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [{ provide: EditPageService, useValue: editPageServiceSpy }, provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onMouseDownEmptyTile on mouse down', () => {
        const event = new MouseEvent('mousedown');
        component.onMouseDownEmptyTile(event, 0, 0);
        expect(editPageServiceSpy.onMouseDownEmptyTile).toHaveBeenCalledWith(event, 0, 0);
    });

    it('should call onMouseDownItem on mouse down on an item', () => {
        const event = new MouseEvent('mousedown');
        component.onMouseDownItem(event, 1, 1);
        expect(editPageServiceSpy.onMouseDownItem).toHaveBeenCalledWith(event, 1, 1);
    });

    it('should call onDrop on drop event', () => {
        const event = new DragEvent('drop');
        component.onDrop(event, 2, 2);
        expect(editPageServiceSpy.onDrop).toHaveBeenCalledWith(event, 2, 2);
    });

    it('should call onMouseUp', () => {
        component.onMouseUp();
        expect(editPageServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseOver on mouse over event', () => {
        const event = new MouseEvent('mouseover');
        component.onMouseOver(event, 3, 3);
        expect(editPageServiceSpy.onMouseOver).toHaveBeenCalledWith(event, 3, 3);
    });

    it('should call onDragStart on drag start event', () => {
        const event = new DragEvent('dragstart');
        component.onDragStart(event, 4, 4);
        expect(editPageServiceSpy.onDragStart).toHaveBeenCalledWith(event, 4, 4);
    });

    it('should call onDragEnd on drag end event', () => {
        const event = new DragEvent('dragend');
        component.onDragEnd(event);
        expect(editPageServiceSpy.onDragEnd).toHaveBeenCalledWith(event);
    });

    it('should call preventDefault on right-click in preventRightClick', () => {
        const event = new MouseEvent('contextmenu'); // Create a mock right-click event
        spyOn(event, 'preventDefault'); // Spy on preventDefault method

        component.preventRightClick(event);

        expect(event.preventDefault).toHaveBeenCalled(); // Verify if preventDefault was called
    });

    it('should call preventDefault in onDragOver', () => {
        const dragEvent = new DragEvent('dragover'); // Create a mock dragover event
        spyOn(dragEvent, 'preventDefault'); // Spy on preventDefault method

        component.onDragOver(dragEvent);

        expect(dragEvent.preventDefault).toHaveBeenCalled(); // Verify if preventDefault was called
    });
});
