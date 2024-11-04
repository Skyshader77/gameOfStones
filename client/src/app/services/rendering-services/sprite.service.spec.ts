import { TestBed } from '@angular/core/testing';

import { SpriteService } from './sprite.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { Avatar } from '@common/enums/avatar.enum';
import { SPRITE_HEIGHT, SPRITE_WIDTH } from '@app/constants/rendering.constants';
import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { Direction } from '@common/interfaces/move';

describe('SpriteService', () => {
    let service: SpriteService;

    beforeEach((done) => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpriteService);

        setTimeout(() => {
            done();
        }, 200);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be loaded on created', () => {
        expect(service.isLoaded()).toBeTrue();
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
                expect(service.getItemSprite(value as ItemType)).not.toBeUndefined();
            });
    });

    it('should get player sprite on getPlayerSprite', () => {
        Object.values(Avatar)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                expect(service.getPlayerSpriteSheet(value as Avatar)).not.toBeUndefined();
            });
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
