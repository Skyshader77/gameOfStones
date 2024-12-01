import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ITEM_PATHS } from '@app/constants/conversion.constants';
import { MOCK_INVENTORY } from '@app/constants/tests.constants';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
    let component: InventoryComponent;
    let fixture: ComponentFixture<InventoryComponent>;
    let myPlayerServiceMock: jasmine.SpyObj<MyPlayerService>;

    beforeEach(async () => {
        myPlayerServiceMock = jasmine.createSpyObj('MyPlayerService', ['getInventory']);
        myPlayerServiceMock.getInventory.and.returnValue(MOCK_INVENTORY);

        await TestBed.configureTestingModule({
            imports: [InventoryComponent],
            providers: [
                { provide: MyPlayerService, useValue: myPlayerServiceMock },
                { provide: ITEM_PATHS, useValue: ITEM_PATHS },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(InventoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct inventory from myInventory getter', () => {
        expect(component.myInventory).toEqual(MOCK_INVENTORY);
    });

    it('should return correct item image paths from getItemImagePaths', () => {
        const expectedPaths = ['assets/items/armor.png', 'assets/items/potion-blue.png'];

        expect(component.getItemImagePaths(MOCK_INVENTORY)).toEqual(expectedPaths);
    });
});
