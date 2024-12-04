import { TestBed } from '@angular/core/testing';
import { MOCK_ADDED_BOOST_1, MOCK_ITEM, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { ItemType } from '@common/enums/item-type.enum';
import { Item, ItemDropPayload, ItemLostPayload, ItemPickupPayload } from '@common/interfaces/item';
import { ItemManagerService } from './item-manager.service';

describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let myPlayerServiceMock: jasmine.SpyObj<MyPlayerService>;
    let gameMapService: GameMapService;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;
    let audioServiceMock: jasmine.SpyObj<AudioService>;

    beforeEach(() => {
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'getPlayerByName']);
        myPlayerServiceMock = jasmine.createSpyObj('MyPlayerService', ['getUserName', 'setInventory']);
        audioServiceMock = jasmine.createSpyObj('AudioService', ['playSfx']);
        TestBed.configureTestingModule({
            providers: [
                ItemManagerService,
                { provide: MyPlayerService, useValue: myPlayerServiceMock },
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: GameMapService, useValue: jasmine.createSpyObj('GameMapService', ['updateItemsAfterPickup', 'updateItemsAfterPlaced']) },
                { provide: AudioService, useValue: audioServiceMock },
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

    it('should get the correct value for hasToDropItem', () => {
        // Test case when _hasToDropItem is false
        service['_hasToDropItem'] = false;
        expect(service.hasToDropItem).toBeFalse();

        // Test case when _hasToDropItem is true
        service['_hasToDropItem'] = true;
        expect(service.hasToDropItem).toBeTrue();
    });

    it('should call updateItemsAfterPlaced when handleItemPlaced is called', () => {
        const item: Item = {
            type: ItemType.BismuthShield,
            position: { x: 0, y: 0 },
        };

        service.handleItemPlaced(item);

        expect(gameMapService.updateItemsAfterPlaced).toHaveBeenCalledWith(item);
    });

    it('should return early in handleItemLost if player is not found', () => {
        const itemLostPayload: ItemLostPayload = {
            playerName: 'nonExistentPlayer',
            newInventory: [],
        };

        playerListServiceMock.getPlayerByName.and.returnValue(undefined);

        service.handleItemLost(itemLostPayload);

        expect(playerListServiceMock.getPlayerByName).toHaveBeenCalledWith(itemLostPayload.playerName);
    });

    it('should return early in handleItemPickup if currentPlayer or newInventory is invalid', () => {
        const itemPickUpPayload: ItemPickupPayload = {
            itemType: ItemType.BismuthShield,
            newInventory: null as unknown as ItemType[],
        };

        playerListServiceMock.getCurrentPlayer.and.returnValue(undefined);

        service.handleItemPickup(itemPickUpPayload);

        expect(playerListServiceMock.getCurrentPlayer).toHaveBeenCalled();
        expect(gameMapService.updateItemsAfterPickup).not.toHaveBeenCalled();
    });

    it('should return early in handleItemPickup if newInventory is not provided', () => {
        const itemPickUpPayload: ItemPickupPayload = {
            itemType: ItemType.BismuthShield,
            newInventory: undefined as unknown as ItemType[],
        };

        const currentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayer);

        service.handleItemPickup(itemPickUpPayload);

        expect(currentPlayer.playerInGame.inventory).toEqual([]);
        expect(gameMapService.updateItemsAfterPickup).not.toHaveBeenCalled();
    });

    it('should return true if waiting for pickup', () => {
        service['pendingPickup'] = ItemType.BismuthShield;
        expect(service.isWaitingForPickup()).toBeTrue();
    });

    it('should return false if not waiting for pickup', () => {
        service['pendingPickup'] = null;
        expect(service.isWaitingForPickup()).toBeFalse();
    });

    it('should pick up item and update inventory', () => {
        service['pendingPickup'] = ItemType.BismuthShield;

        const currentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayer);
        myPlayerServiceMock.getUserName.and.returnValue(currentPlayer.playerInfo.userName);
        spyOn(service, 'isWaitingForPickup').and.returnValue(true);

        service.pickupItem();

        expect(gameMapService.updateItemsAfterPickup).toHaveBeenCalledWith(ItemType.BismuthShield);
        expect(audioServiceMock.playSfx).toHaveBeenCalledWith(Sfx.ItemPickedUp);
        expect(service['pendingPickup']).toBeNull();
    });

    it('should default to random item if it is null and update inventory', () => {
        service['pendingPickup'] = null;

        const currentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayer);
        myPlayerServiceMock.getUserName.and.returnValue(currentPlayer.playerInfo.userName);
        spyOn(service, 'isWaitingForPickup').and.returnValue(true);

        service.pickupItem();

        expect(gameMapService.updateItemsAfterPickup).toHaveBeenCalledWith(ItemType.Random);
        expect(audioServiceMock.playSfx).toHaveBeenCalledWith(Sfx.ItemPickedUp);
        expect(service['pendingPickup']).toBeNull();
    });

    it('should not pick up item if not waiting for pickup', () => {
        service['pendingPickup'] = null;

        service.pickupItem();

        expect(gameMapService.updateItemsAfterPickup).not.toHaveBeenCalled();
        expect(audioServiceMock.playSfx).not.toHaveBeenCalled();
    });
});
