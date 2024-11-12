import { TestBed } from '@angular/core/testing';
import { ItemManagerService } from './item-manager.service';
import { ItemPickupPayload, ItemDropPayload } from '@common/interfaces/item';
import { MyPlayerService } from '../room-services/my-player.service';
import { PlayerListService } from '../room-services/player-list.service';
import { GameMapService } from '../room-services/game-map.service';
import { ItemType } from '@common/enums/item-type.enum';
import { MOCK_ADDED_BOOST_1, MOCK_ITEM, MOCK_PLAYERS } from '@app/constants/tests.constants';

describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let myPlayerService: MyPlayerService;
    let playerListService: PlayerListService;
    let gameMapService: GameMapService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ItemManagerService,
                { provide: MyPlayerService, useValue: jasmine.createSpyObj('MyPlayerService', ['getUserName', 'setInventory']) },
                { provide: PlayerListService, useValue: jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'getPlayerByName']) },
                { provide: GameMapService, useValue: jasmine.createSpyObj('GameMapService', ['updateItemsAfterPickup', 'updateItemsAfterDrop']) }
            ]
        });

        service = TestBed.inject(ItemManagerService);
        myPlayerService = TestBed.inject(MyPlayerService);
        playerListService = TestBed.inject(PlayerListService);
        gameMapService = TestBed.inject(GameMapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle item pickup correctly', () => {
        const itemPickUpPayload: ItemPickupPayload = {
            itemType: ItemType.Boost1,
            newInventory: [MOCK_ADDED_BOOST_1]
        };

        const currentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        spyOn(playerListService, 'getCurrentPlayer').and.returnValue(currentPlayer);
        spyOn(myPlayerService, 'setInventory');
        spyOn(gameMapService, 'updateItemsAfterPickup');

        service.handleItemPickup(itemPickUpPayload);

        expect(currentPlayer.playerInGame.inventory).toEqual(itemPickUpPayload.newInventory);
        expect(myPlayerService.setInventory).toHaveBeenCalledWith(itemPickUpPayload.newInventory);
        expect(gameMapService.updateItemsAfterPickup).toHaveBeenCalledWith(ItemType.Boost1);
    });

    it('should handle item drop correctly', () => {
        const itemDropPayload: ItemDropPayload = {
            playerName: 'player1',
            item: MOCK_ITEM,
            newInventory: []
        };

        const player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        spyOn(playerListService, 'getPlayerByName').and.returnValue(player);
        spyOn(myPlayerService, 'setInventory');
        spyOn(gameMapService, 'updateItemsAfterDrop');

        service.handleItemDrop(itemDropPayload);

        expect(player.playerInGame.inventory).toEqual(itemDropPayload.newInventory);
        expect(myPlayerService.setInventory).toHaveBeenCalledWith(itemDropPayload.newInventory);
        expect(gameMapService.updateItemsAfterDrop).toHaveBeenCalledWith(itemDropPayload.item);
    });
});
