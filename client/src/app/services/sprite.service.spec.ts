/* eslint-disable */
import { TestBed } from '@angular/core/testing';

import { Item, TileTerrain } from '@app/interfaces/map';
import { SpriteService } from './sprite.service';

describe('SpriteService', () => {
    let service: SpriteService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpriteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load sprites on initialize', () => {
        const tileSpy = spyOn<any>(service, 'loadTileSprites');
        const itemSpy = spyOn<any>(service, 'loadItemSprites');

        expect(tileSpy).toHaveBeenCalled();
        expect(itemSpy).toHaveBeenCalled();
    });

    // it('should not load sprites again on initialize', () => {
    //     service.initialize();
    //     const tileSpy = spyOn<any>(service, 'loadTileSprites');
    //     const itemSpy = spyOn<any>(service, 'loadItemSprites');
    //     service.initialize();

    //     expect(tileSpy).not.toHaveBeenCalled();
    //     expect(itemSpy).toHaveBeenCalled();
    // });

    it('should not be loaded when not initialized', () => {
        expect(service.isLoaded()).toBeFalse();
    });

    it('should be loaded after initialization', () => {
        service.initialize();
        setTimeout(() => expect(service.isLoaded()).toBeTrue(), 500);
    });

    it('should return the right tile with getTileSprite', () => {
        service.initialize();

        setTimeout(() => {
            const grassTileMock = new Image();
            grassTileMock.src = 'assets/tiles/grass.png';

            grassTileMock.onload = () => {
                expect(service.getTileSprite(TileTerrain.GRASS)).toEqual(grassTileMock);
            };
        }, 500);
    });

    it('should return the right item with getItemSprite', () => {
        service.initialize();

        setTimeout(() => {
            const flagMock = new Image();
            flagMock.src = 'assets/tiles/flag.png';

            flagMock.onload = () => {
                expect(service.getItemSprite(Item.FLAG)).toEqual(flagMock);
            };
        }, 500);
    });

    it('should return undefined when getting item NONE', () => {
        service.initialize();

        setTimeout(() => {
            expect(service.getItemSprite(Item.NONE)).toBeUndefined();
        }, 500);
    });

    it('should return undefined when getting tile and not loaded', () => {
        expect(service.getTileSprite(TileTerrain.GRASS)).toBeUndefined();
    });

    it('should return undefined when getting item and not loaded', () => {
        expect(service.getItemSprite(Item.FLAG)).toBeUndefined();
    });
});
