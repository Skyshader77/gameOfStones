import { BISMUTH_SHIELD_STATS, GLASS_STONE_STATS } from '@app/constants/item.constants';
import { MOCK_PLAYERS } from '@app/constants/test.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Player } from '@common/interfaces/player';
import { Test, TestingModule } from '@nestjs/testing';
import { SimpleItemService } from './simple-item.service';

describe('SimpleItemService', () => {
    let service: SimpleItemService;
    let mockPlayer:Player;

    const mockBismuthStats = BISMUTH_SHIELD_STATS;
    const mockGlassStoneStats = GLASS_STONE_STATS;

    beforeEach(async () => {
        mockPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const module: TestingModule = await Test.createTestingModule({
            providers: [SimpleItemService],
        }).compile();

        service = module.get<SimpleItemService>(SimpleItemService);
        jest.spyOn(service as any, 'getItemStatChanges').mockImplementation((item) => {
            if (item === ItemType.BismuthShield) return mockBismuthStats;
            if (item === ItemType.GlassStone) return mockGlassStoneStats;
            return { hp: 0, speed: 0, attack: 0, defense: 0 };
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });


    it('should apply Bismuth Shield stats correctly', () => {
        const player = mockPlayer;
        player.playerInGame.inventory = [ItemType.BismuthShield];

        service.applySimpleItems(player);

        expect(player.playerInGame.attributes).toEqual({
            hp: 4,
            speed: 5, 
            attack: 4,
            defense: 6, 
        });
    });


    it('should apply Glass Stone stats correctly', () => {
        const player = mockPlayer;
        player.playerInGame.inventory = [ItemType.GlassStone];

        service.applySimpleItems(player);

        expect(player.playerInGame.attributes).toEqual({
            hp: 4,
            speed: 6, 
            attack: 6,
            defense: 3, 
        });
    });

    it('should combine effects of multiple items', () => {
        const player = mockPlayer;
        player.playerInGame.inventory = [ItemType.BismuthShield, ItemType.GlassStone];

        service.applySimpleItems(player);

        expect(player.playerInGame.attributes).toEqual({
            hp: 4,
            speed: 5, 
            attack: 6,
            defense: 5, 
        });
    });

    it('should ignore unknown items', () => {
        const player = mockPlayer;
        player.playerInGame.inventory = [ItemType.GeodeBomb];

        service.applySimpleItems(player);

        expect(player.playerInGame.attributes).toEqual({
            hp: 4,
            speed: 6,
            attack: 4,
            defense: 4,
        });
    });
});