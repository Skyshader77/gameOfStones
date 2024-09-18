import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { Item, TileTerrain } from '@app/interfaces/map';
import { EditPageService } from '@app/services/edit-page.service';
import { SidebarComponent } from './sidebar.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let editPageServiceSpy: SpyObj<EditPageService>;

    const mockItemLimit1 = 6;
    const mockItemLimit2 = 3;
    const mockItemLimit3 = 1;
    beforeEach(async () => {
        editPageServiceSpy = jasmine.createSpyObj('EditPageService', ['resetMap', 'isItemLimitReached', 'getMaxItems', 'selectTileType'], {
            currentMap: {
                placedItems: [],
            },
            selectedTileType: TileTerrain.ICE,
        });

        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [{ provide: EditPageService, useValue: editPageServiceSpy }, provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return remaining items count correctly in getRemainingItems', () => {
        editPageServiceSpy.getMaxItems.and.returnValue(mockItemLimit1);
        const remainingItems1 = component.getRemainingItems(Item.START);
        expect(remainingItems1).toBe(mockItemLimit1);

        editPageServiceSpy.currentMap.placedItems = [Item.START, Item.START, Item.START]; // Simulate items
        const remainingItems = component.getRemainingItems(Item.START);
        expect(remainingItems).toBe(mockItemLimit2); // Adjust based on the actual setup

        editPageServiceSpy.getMaxItems.and.returnValue(mockItemLimit3);
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
        component.onResetClicked();
        expect(editPageServiceSpy.resetMap).toHaveBeenCalled();
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

    it('should set selectedTileType in selectTile', () => {
        component.selectTile(TileTerrain.WATER);

        expect(editPageServiceSpy.selectTileType).toHaveBeenCalledWith(TileTerrain.WATER);
    });
});
