import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { Item, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { ServerManagerService } from '@app/services/edit-page-services/server-manager.service';
import { SidebarComponent } from './sidebar.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let mapValidationServiceSpy: SpyObj<MapValidationService>;
    let serverManagerServiceSpy: SpyObj<ServerManagerService>;

    const mockItemLimit1 = 6;
    const mockItemLimit2 = 3;
    const mockItemLimit3 = 1;
    beforeEach(async () => {
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            ['resetMap', 'isItemLimitReached', 'getMaxItems', 'selectTileType', 'validateMap'],
            {
                currentMap: {
                    placedItems: [],
                },
                selectedTileType: TileTerrain.ICE,
            },
        );

        mapValidationServiceSpy = jasmine.createSpyObj('MapValidationService', ['validateMap'], {});
        serverManagerServiceSpy = jasmine.createSpyObj('ServerManagerService', ['saveMap'], {});

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.overrideProvider(MapValidationService, { useValue: mapValidationServiceSpy });
        TestBed.overrideProvider(ServerManagerService, { useValue: serverManagerServiceSpy });
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

    it('should return remaining items count correctly in getRemainingItems', () => {
        mapManagerServiceSpy.getMaxItems.and.returnValue(mockItemLimit1);
        const remainingItems1 = component.getRemainingItems(Item.START);
        expect(remainingItems1).toBe(mockItemLimit1);

        mapManagerServiceSpy.currentMap.placedItems = [Item.START, Item.START, Item.START];
        const remainingItems = component.getRemainingItems(Item.START);
        expect(remainingItems).toBe(mockItemLimit2);

        mapManagerServiceSpy.getMaxItems.and.returnValue(mockItemLimit3);
        const remainingItems2 = component.getRemainingItems(Item.BOOST1);
        expect(remainingItems2).toBe(mockItemLimit3);
    });

    it('should return true if tile type is selected', () => {
        const isSelected = component.isTileTypeSelected(TileTerrain.ICE);
        expect(isSelected).toBeTrue();
    });

    it('should return false if tile type is not selected', () => {
        const isSelected = component.isTileTypeSelected(TileTerrain.WATER);
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

        const itemType = Item.BOOST1;
        component.onDragStart(event, itemType);

        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', 'potionBlue');
    });

    it('should set selectedTileType in selectTile on click of new tile type', () => {
        const event = new MouseEvent('click');
        const waterTileButton = fixture.nativeElement.querySelector('.tile-button.water');
        waterTileButton.dispatchEvent(event);

        expect(mapManagerServiceSpy.selectTileType).toHaveBeenCalledWith(TileTerrain.WATER);
    });

    it('should call saveMap when the map is valid on save button click', () => {
        mapValidationServiceSpy.validateMap.and.returnValue({
            doorAndWallNumberValid: true,
            wholeMapAccessible: true,
            allStartPointsPlaced: true,
            doorSurroundingsValid: true,
            flagPlaced: true,
            allItemsPlaced: true,
            nameValid: true,
            descriptionValid: true,
            isMapValid: true,
        });

        const event = new MouseEvent('click');
        const saveButton = fixture.nativeElement.querySelector('.btn-accent');
        saveButton.dispatchEvent(event);
        expect(serverManagerServiceSpy.saveMap).toHaveBeenCalled();
    });

    it('should not call saveMap when the map is invalid on save button click', () => {
        mapValidationServiceSpy.validateMap.and.returnValue({
            doorAndWallNumberValid: true,
            wholeMapAccessible: true,
            allStartPointsPlaced: false,
            doorSurroundingsValid: true,
            flagPlaced: true,
            allItemsPlaced: true,
            nameValid: false,
            descriptionValid: true,
            isMapValid: false,
        });
        const event = new MouseEvent('click');
        const saveButton = fixture.nativeElement.querySelector('.btn-accent');
        saveButton.dispatchEvent(event);
        expect(serverManagerServiceSpy.saveMap).not.toHaveBeenCalled();
    });
});
