import { TestBed } from '@angular/core/testing';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
    let service: InventoryService;
    let renderingStateServiceSpy: jasmine.SpyObj<RenderingStateService>;

    beforeEach(() => {
        renderingStateServiceSpy = jasmine.createSpyObj('RenderingStateService', [
            'currentlySelectedItem',
            'displayPlayableTiles',
            'displayItemTiles',
            'displayActions',
        ]);

        TestBed.configureTestingModule({
            providers: [InventoryService, { provide: RenderingStateService, useValue: renderingStateServiceSpy }],
        });

        service = TestBed.inject(InventoryService);
    });

    it('should deselect the item when the same item is clicked again', () => {
        const item: ItemType = ItemType.BismuthShield;

        renderingStateServiceSpy.currentlySelectedItem = item;
        service.handleItemClick(item);

        expect(renderingStateServiceSpy.currentlySelectedItem).toBeNull();
        expect(renderingStateServiceSpy.displayPlayableTiles).toBeTrue();
        expect(renderingStateServiceSpy.displayItemTiles).toBeFalse();
        expect(renderingStateServiceSpy.displayActions).toBeFalse();
    });

    it('should select the item when a different item is clicked', () => {
        const item1: ItemType = ItemType.BismuthShield;
        const item2: ItemType = ItemType.GeodeBomb;

        renderingStateServiceSpy.currentlySelectedItem = item1 as ItemType;
        service.handleItemClick(item2);

        expect(renderingStateServiceSpy.currentlySelectedItem).toEqual(item2);
        expect(renderingStateServiceSpy.displayItemTiles).toBeTrue();
        expect(renderingStateServiceSpy.displayPlayableTiles).toBeFalse();
        expect(renderingStateServiceSpy.displayActions).toBeFalse();
    });
});
