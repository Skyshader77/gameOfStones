import { TestBed } from '@angular/core/testing';

import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { SPRITE_HEIGHT, SPRITE_WIDTH } from '@app/constants/rendering.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction } from '@common/interfaces/move';
import { SpriteService } from './sprite.service';

describe('SpriteService', () => {
    let service: SpriteService;

    beforeEach((done) => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpriteService);

        const LOADING_DELAY = 100;

        setTimeout(() => {
            done();
        }, LOADING_DELAY);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be loaded on created', () => {
        expect(service.isLoaded()).toBeTrue();
    });

    it('should return a background sprite for a valid sprite sheet number', () => {
        const validSpriteSheetNumber: number = 1;
        const sprite = service.getBackgroundSpriteSheet(validSpriteSheetNumber);
        expect(sprite).toBeDefined();
        expect(sprite instanceof HTMLImageElement).toBe(true);
    });

    it('should return undefined for an invalid sprite sheet number', () => {
        const invalidSpriteSheetNumber: number = -1;
        const sprite = service.getBackgroundSpriteSheet(invalidSpriteSheetNumber);
        expect(sprite).toBeUndefined();
    });

    it('should return a player fight sprite for a valid Avatar', () => {
        const playerAvatar: Avatar = Avatar.FemaleHealer;
        const sprite = service.getPlayerFightSpriteSheet(playerAvatar);
        expect(sprite).toBeDefined();
        expect(sprite instanceof HTMLImageElement).toBe(true);
    });

    it('should return undefined for an invalid Avatar', () => {
        const invalidAvatar: Avatar = -1 as Avatar;
        const sprite = service.getPlayerFightSpriteSheet(invalidAvatar);
        expect(sprite).toBeUndefined();
    });

    it('should get tile sprite on getTileSprite', () => {
        Object.values(TileTerrain)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                expect(service.getTileSprite(value as TileTerrain)).not.toBeUndefined();
            });
    });

    it('should get item sprite on getItemSprite', () => {
        Object.values(ItemType)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const item = value as ItemType;

                expect(service.getItemSprite(item)).not.toBeUndefined();
            });
    });

    it('should get player sprite on getPlayerSprite', (done) => {
        const avatars = Object.values(Avatar).filter((v) => !isNaN(Number(v)));
        const LOADING_DELAY = 500;

        setTimeout(() => {
            avatars.forEach((value) => {
                expect(service.getPlayerSpriteSheet(value as Avatar)).not.toBeUndefined();
            });
            done();
        }, LOADING_DELAY);
    });

    it('should get the desired sprite position on sprite position', () => {
        const position0 = service.getSpritePosition(0);
        expect(position0.x).toEqual(0);
        expect(position0.y).toEqual(0);

        const position1 = service.getSpritePosition(1);
        expect(position1.x).toEqual(SPRITE_WIDTH);
        expect(position1.y).toEqual(0);

        const position2 = service.getSpritePosition(SPRITE_DIRECTION_INDEX[Direction.DOWN]);
        expect(position2.x).toEqual(SPRITE_WIDTH);
        expect(position2.y).toEqual(2 * SPRITE_HEIGHT);
    });
});
