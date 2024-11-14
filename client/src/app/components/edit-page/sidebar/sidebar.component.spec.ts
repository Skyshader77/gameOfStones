import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { ITEM_TO_STRING_MAP } from '@app/constants/conversion.constants';
import { TILE_DESCRIPTIONS } from '@app/constants/edit-page.constants';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { SidebarComponent } from './sidebar.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let mapValidationServiceSpy: SpyObj<MapValidationService>;

    beforeEach(async () => {
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            ['resetMap', 'isItemLimitReached', 'getMaxItems', 'selectTileType', 'handleSave', 'getRemainingRandomAndStart'],
            {
                currentMap: {
                    placedItems: [],
                },
                selectedTileType: TileTerrain.Ice,
            },
        );

        mapValidationServiceSpy = jasmine.createSpyObj('MapValidationService', ['validateMap'], {});

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.overrideProvider(MapValidationService, { useValue: mapValidationServiceSpy });
        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true if tile type is selected', () => {
        const isSelected = component.isTileTypeSelected(TileTerrain.Ice);
        expect(isSelected).toBeTrue();
    });

    it('should return false if tile type is not selected', () => {
        const isSelected = component.isTileTypeSelected(TileTerrain.Water);
        expect(isSelected).toBeFalse();
    });

    it('should call resetMap on reset button click', () => {
        const event = new MouseEvent('click');
        const resetButton = fixture.nativeElement.querySelector('.btn-secondary');
        resetButton.dispatchEvent(event);
        expect(mapManagerServiceSpy.resetMap).toHaveBeenCalled();
    });

    it('should set itemType in onDragStart', () => {
        // The logic to Mock the data transfer was made using ChatGPT, considering its complexity that exceeds the boundaries of what was taught in class.
        const mockDataTransfer = {
            setData: jasmine.createSpy('setData'),
        } as unknown as DataTransfer;

        const event = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            composed: true,
        });

        Object.defineProperty(event, 'dataTransfer', {
            value: mockDataTransfer,
            writable: true,
        });

        const itemType = ItemType.Boost1;
        component.onDragStart(event, itemType);

        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', ITEM_TO_STRING_MAP[itemType]);
    });

    it('should set selectedTileType in selectTile on click of new tile type', () => {
        const tileButtons = Array.from(fixture.nativeElement.querySelectorAll('.tile-button')) as HTMLElement[];
        const waterTileButton = tileButtons.find(
            (button: HTMLElement) => button.getAttribute('data-tip') === TILE_DESCRIPTIONS[TileTerrain.Water],
        ) as HTMLElement;

        const event = new MouseEvent('click');
        waterTileButton.dispatchEvent(event);

        expect(mapManagerServiceSpy.selectTileType).toHaveBeenCalledWith(TileTerrain.Water);
    });

    it('should call validateMap and handleSave on save button click', () => {
        spyOn(component.saveEvent, 'emit');
        const event = new MouseEvent('click');
        const saveButton = fixture.nativeElement.querySelector('.btn-accent');
        saveButton.dispatchEvent(event);
        expect(component.saveEvent.emit).toHaveBeenCalled();
    });
});
