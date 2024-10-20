/* eslint-disable */
import { TestBed } from '@angular/core/testing';

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
});
