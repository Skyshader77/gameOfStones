import { MOCK_MOVEMENT_MAPS } from '@app/constants/player.movement.test.constants';
import { MOCK_PLAYERS } from '@app/constants/test.constants';
import { Map } from '@app/model/database/map';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Test, TestingModule } from '@nestjs/testing';
import { ConditionalItemService } from './conditional-item.service';

describe('ConditionalItemService', () => {
    let service: ConditionalItemService;
    let mockPlayer: Player;
    let mockMap: Map;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConditionalItemService],
        }).compile();

        service = module.get<ConditionalItemService>(ConditionalItemService);

        mockPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        mockMap = MOCK_MOVEMENT_MAPS.allice;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('applyQuartzSkates', () => {
        it('should apply Quartz Skates bonuses if player is on Ice', () => {

            mockPlayer.playerInGame.inventory.push(ItemType.QuartzSkates);

            const expectedAttackResult=7;

            mockPlayer.playerInGame.currentPosition = { x: 1, y: 1 };

            service.applyQuartzSkates(mockPlayer, mockMap);

            expect(mockPlayer.playerInGame.attributes.attack).toBe(
                expectedAttackResult,
            );
            expect(mockPlayer.playerInGame.attributes.defense).toBe(
                expectedAttackResult,
            );
        });

        it('should not apply Quartz Skates bonuses if player is not on Ice', () => {

            const expectedAttackResult=4;

            mockMap.mapArray[1][1] = TileTerrain.Grass;

            service.applyQuartzSkates(mockPlayer, mockMap);

            expect(mockPlayer.playerInGame.attributes.attack).toBe(expectedAttackResult);
            expect(mockPlayer.playerInGame.attributes.defense).toBe(expectedAttackResult);
        });
    });

    describe('areSapphireFinsApplied', () => {
        it('should return true if player has Sapphire Fins and is on Water', () => {

            mockPlayer.playerInGame.inventory.push(ItemType.SapphireFins);
            const currentTile = TileTerrain.Water;

            const result = service.areSapphireFinsApplied(mockPlayer, currentTile);

            expect(result).toBe(true);
        });

        it('should return false if player does not have Sapphire Fins', () => {

            const currentTile = TileTerrain.Water;


            const result = service.areSapphireFinsApplied(mockPlayer, currentTile);


            expect(result).toBe(false);
        });

        it('should return false if player is not on Water', () => {

            mockPlayer.playerInGame.inventory.push(ItemType.SapphireFins);
            const currentTile = TileTerrain.Grass;

            const result = service.areSapphireFinsApplied(mockPlayer, currentTile);

            expect(result).toBe(false);
        });
    });
});
