import { TestBed } from '@angular/core/testing';

import { RenderingService } from './rendering.service';
// import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';
// import { GameMode, generateMapArray, Map, TileTerrain } from '@app/interfaces/map';

describe('RenderingService', () => {
    let service: RenderingService;
    // let mapStateSpy: jasmine.SpyObj<MapRenderingStateService>;
    let spriteSpy: jasmine.SpyObj<SpriteService>;
    // const mapMock: Map = {
    //     _id: 'ayo',
    //     name: 'test',
    //     description: '',
    //     size: 20,
    //     mode: GameMode.NORMAL,
    //     isVisible: false,
    //     dateOfLastModification: new Date(),
    //     placedItems: [],
    //     mapArray: generateMapArray(20, TileTerrain.WALL),
    // };

    beforeEach(() => {
        // mapStateSpy = jasmine.createSpyObj('MapRenderingStateService', [], { map: mapMock });
        spriteSpy = jasmine.createSpyObj('SpriteService', ['initialize', 'getTileSprite', 'getItemSprite']);
        TestBed.configureTestingModule({});
        service = TestBed.inject(RenderingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize spriteService on initialize', () => {
        service.initialize(new CanvasRenderingContext2D());

        expect(spriteSpy.initialize).toHaveBeenCalled();
    });
});
