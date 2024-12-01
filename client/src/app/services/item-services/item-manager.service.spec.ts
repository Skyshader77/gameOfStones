import { TestBed } from '@angular/core/testing';
import { MOCK_ADDED_BOOST_1, MOCK_ITEM, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { ItemType } from '@common/enums/item-type.enum';
import { ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { ItemManagerService } from './item-manager.service';

describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let myPlayerServiceMock: jasmine.SpyObj<MyPlayerService>;
    let gameMapService: GameMapService;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;

    beforeEach(() => {
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'getPlayerByName']);
        myPlayerServiceMock = jasmine.createSpyObj('MyPlayerService', ['getUserName', 'setInventory']);
        TestBed.configureTestingModule({
            providers: [
                ItemManagerService,
                { provide: MyPlayerService, useValue: myPlayerServiceMock },
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: GameMapService, useValue: jasmine.createSpyObj('GameMapService', ['updateItemsAfterPickup', 'updateItemsAfterPlaced']) },
            ],
        });

        service = TestBed.inject(ItemManagerService);
        gameMapService = TestBed.inject(GameMapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle item pickup correctly', () => {
        const itemPickUpPayload: ItemPickupPayload = {
            itemType: ItemType.BismuthShield,
            newInventory: [MOCK_ADDED_BOOST_1],
        };

        const currentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayer);

        myPlayerServiceMock.getUserName.and.returnValue(currentPlayer.playerInfo.userName);

        service.handleItemPickup(itemPickUpPayload);

        expect(currentPlayer.playerInGame.inventory).toEqual(itemPickUpPayload.newInventory);
        expect(gameMapService.updateItemsAfterPickup).toHaveBeenCalledWith(ItemType.BismuthShield);
    });

    it('should handle item drop correctly', () => {
        const itemDropPayload: ItemDropPayload = {
            playerName: 'player1',
            item: MOCK_ITEM,
            newInventory: [],
        };

        const player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getPlayerByName.and.returnValue(player);
        myPlayerServiceMock.getUserName.and.returnValue(player.playerInfo.userName);

        service.handleItemDrop(itemDropPayload);

        expect(player.playerInGame.inventory).toEqual(itemDropPayload.newInventory);
        expect(gameMapService.updateItemsAfterPlaced).toHaveBeenCalledWith(itemDropPayload.item);
    });

    it('should handle inventory full correctly', () => {
        let inventoryFullTriggered = false;
        service.inventoryFull$.subscribe(() => {
            inventoryFullTriggered = true;
        });
        service.handleInventoryFull();
        expect(inventoryFullTriggered).toBeTrue();
    });

    it('should handle close item drop modal correctly', () => {
        let closeItemDropModalTriggered = false;
        service.closeItemDropModal$.subscribe(() => {
            closeItemDropModalTriggered = true;
        });
        service.handleCloseItemDropModal();
        expect(closeItemDropModalTriggered).toBeTrue();
    });
});
