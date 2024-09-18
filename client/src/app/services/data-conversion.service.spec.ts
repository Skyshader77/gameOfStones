import { TestBed } from '@angular/core/testing';
import { Item, TileTerrain } from '@app/interfaces/map';
import { DataConversionService } from './data-conversion.service';

describe('DataConversionService', () => {
    let service: DataConversionService;

    const boost1: Item = Item.BOOST1;
    const boost2: Item = Item.BOOST2;
    const boost3: Item = Item.BOOST3;
    // const boost4: Item = Item.BOOST4;
    // const boost5: Item = Item.BOOST5;
    // const boost6: Item = Item.BOOST6;
    // const randItem: Item = Item.RANDOM;
    // const flagItem: Item = Item.FLAG;
    // const startItem: Item = Item.START;
    // const noneItem: Item = Item.NONE;

    const tile1: TileTerrain = TileTerrain.GRASS;

    const stringBoost1 = 'potionBlue';
    const stringBoost2 = 'potionGreen';
    const stringBoost3 = 'potionRed';

    const stringTile1 = 'grass';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DataConversionService);
    });

    it('should convert strings to Items', () => {
        expect(service.convertStringToItem(stringBoost1)).toEqual(boost1);
        expect(service.convertStringToItem(stringBoost2)).toEqual(boost2);
        expect(service.convertStringToItem('')).toEqual(Item.NONE);
    });

    it('should convert strings to Terrain', () => {
        expect(service.convertStringToTerrain(stringTile1)).toEqual(tile1);
    });

    it('should convert Items to strings', () => {
        expect(service.convertItemToString(boost1)).toEqual(stringBoost1);
        expect(service.convertItemToString(boost2)).toEqual(stringBoost2);
        expect(service.convertItemToString(boost3)).toEqual(stringBoost3);
        expect(service.convertItemToString(Item.NONE)).toEqual('');
    });

    it('should convert Terrain to strings', () => {
        expect(service.convertTerrainToString(tile1)).toEqual(stringTile1);
    });
});
