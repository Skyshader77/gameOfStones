import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_INVENTORY } from '@app/constants/tests.constants';
import { InventoryService } from '@app/services/game-page-services/inventory-service/inventory.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';
import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
    let component: InventoryComponent;
    let fixture: ComponentFixture<InventoryComponent>;
    let myPlayerServiceMock: jasmine.SpyObj<MyPlayerService>;
    let renderingStateServiceMock: jasmine.SpyObj<RenderingStateService>;
    let inventoryServiceMock: jasmine.SpyObj<InventoryService>;

    beforeEach(async () => {
        myPlayerServiceMock = jasmine.createSpyObj('MyPlayerService', ['getInventory', 'isCurrentPlayer']);
        renderingStateServiceMock = jasmine.createSpyObj('RenderingStateService', ['displayActions', 'currentlySelectedItem']);
        inventoryServiceMock = jasmine.createSpyObj('InventoryService', ['handleItemClick']);

        myPlayerServiceMock.getInventory.and.returnValue(MOCK_INVENTORY);
        myPlayerServiceMock.isCurrentPlayer = true;
        renderingStateServiceMock.displayActions = true;

        await TestBed.configureTestingModule({
            imports: [InventoryComponent],
            providers: [
                { provide: MyPlayerService, useValue: myPlayerServiceMock },
                { provide: RenderingStateService, useValue: renderingStateServiceMock },
                { provide: InventoryService, useValue: inventoryServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(InventoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct value from canUseItems getter', () => {
        renderingStateServiceMock.displayActions = true;
        expect(component.canUseItems).toBeTrue();

        renderingStateServiceMock.displayActions = false;
        expect(component.canUseItems).toBeFalse();
    });

    it('should call handleItemClick when itemClicked is invoked with a special item and it is the player’s turn', () => {
        spyOn(component, 'isSpecialItem').and.returnValue(true);
        myPlayerServiceMock.isCurrentPlayer = true;

        const specialItem = ItemType.GraniteHammer;
        component.itemClicked(specialItem);

        expect(component.isSpecialItem).toHaveBeenCalledWith(specialItem);
        expect(inventoryServiceMock.handleItemClick).toHaveBeenCalledWith(specialItem);
    });

    it('should not call handleItemClick when itemClicked is invoked with a non-special item', () => {
        spyOn(component, 'isSpecialItem').and.returnValue(false);
        const normalItem = ItemType.SapphireFins;

        component.itemClicked(normalItem);

        expect(component.isSpecialItem).toHaveBeenCalledWith(normalItem);
        expect(inventoryServiceMock.handleItemClick).not.toHaveBeenCalled();
    });

    it('should not call handleItemClick when itemClicked is invoked and it is not the player’s turn', () => {
        spyOn(component, 'isSpecialItem').and.returnValue(true);
        myPlayerServiceMock.isCurrentPlayer = false;

        const specialItem = ItemType.GraniteHammer;
        component.itemClicked(specialItem);

        expect(component.isSpecialItem).toHaveBeenCalledWith(specialItem);
        expect(inventoryServiceMock.handleItemClick).not.toHaveBeenCalled();
    });
});
