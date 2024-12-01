import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { ItemType } from '@common/enums/item-type.enum';
import { ItemDropDecisionComponent } from './item-drop-decision.component';

describe('ItemDropDecisionComponent', () => {
    let component: ItemDropDecisionComponent;
    let fixture: ComponentFixture<ItemDropDecisionComponent>;
    let gameLogicSocketServiceMock: jasmine.SpyObj<GameLogicSocketService>;
    let itemManagerServiceMock: jasmine.SpyObj<ItemManagerService>;

    beforeEach(async () => {
        gameLogicSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', ['sendItemDropChoice']);
        itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', [], { hasToDropItem: true });

        await TestBed.configureTestingModule({
            imports: [ItemDropDecisionComponent],
            providers: [
                { provide: GameLogicSocketService, useValue: gameLogicSocketServiceMock },
                { provide: ItemManagerService, useValue: itemManagerServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDropDecisionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call sendItemDropChoice when onItemClick is triggered', () => {
        const item = ItemType.BismuthShield;
        component.onItemClick(item);
        expect(gameLogicSocketServiceMock.sendItemDropChoice).toHaveBeenCalledWith(item);
    });

    it('should emit itemDropSelected when onItemClick is triggered', () => {
        const item = ItemType.BismuthShield;
        spyOn(component.itemDropSelected, 'emit');
        component.onItemClick(item);
        expect(component.itemDropSelected.emit).toHaveBeenCalled();
    });
});
