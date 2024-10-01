import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Map } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { MapService } from '@app/services/map/map.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MapController } from './map.controller';

describe('MapController', () => {
    let mapService: SinonStubbedInstance<MapService>;
    let controller: MapController;
    beforeEach(async () => {
        mapService = createStubInstance(MapService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MapController],
            providers: [
                {
                    provide: MapService,
                    useValue: mapService,
                },
            ],
        }).compile();

        controller = module.get<MapController>(MapController);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllMaps() should return all Maps', async () => {
        const fakeMaps = [new Map(), new Map()];
        mapService.getAllMaps.resolves(fakeMaps);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (maps) => {
            expect(maps).toEqual(fakeMaps);
            return res;
        };

        await controller.allMaps(res);
    });

    it('getAllMaps() should return NOT_FOUND when service unable to fetch Maps', async () => {
        mapService.getAllMaps.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allMaps(res);
    });

    it('getmap() should return the map id', async () => {
        const fakeMap = new Map();
        mapService.getMap.resolves(fakeMap);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (maps) => {
            expect(maps).toEqual(fakeMap);
            return res;
        };

        await controller.mapID('', res);
    });

    it('getmap() should return INTERNAL_SERVER_ERROR when service unable to fetch the Map', async () => {
        mapService.getMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.mapID('', res);
    });

    it("getmap() should return NOT_FOUND when map doesn't exist", async () => {
        mapService.getMap.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.mapID('', res);
    });

    it('addMap() should succeed if the service was able to add the Map', async () => {
        mapService.addMap.resolves();
        mapService.getMapByName.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        const map: CreateMapDto = getFakeMap();

        await controller.addMap(map, res);
    });

    it('addMap() should return INTERNAL_SERVER_ERROR when service fails to add the Map', async () => {
        mapService.addMap.rejects();
        const map = getFakeMap();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.addMap(map, res);
    });

    it('addMap() should return BAD_REQUEST when the json format is wrong', async () => {
        mapService.addMap.resolves();
        mapService.getMapByName.resolves(null);

        const fakeMap = getFakeMap();
        const badFormatMap = { ...fakeMap, randomThing: [] };

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addMap(badFormatMap, res);
    });

    it('addMap() should return BAD_REQUEST when the json format for the array is wrong', async () => {
        mapService.addMap.resolves();
        mapService.getMapByName.resolves(null);

        const fakeMap = getFakeMap();
        const badFormatMap = { ...fakeMap, mapArray: [[{ terrain: TileTerrain.CLOSEDDOOR, item: Item.BOOST1, fakeParameter: 'This is fake' }]] };

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addMap(badFormatMap, res);
    });

    it('addMap() should return CONFLICT when the name is not unique', async () => {
        mapService.addMap.resolves();
        mapService.getMapByName.resolves(new Map());

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = () => res;

        await controller.addMap(new Map(), res);
    });

    it('modifyMap() should succeed if service able to modify the Map', async () => {
        mapService.modifyMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyMap(new Map(), res);
    });

    it('modifyMap() should return NOT_FOUND when service cannot modify the Map', async () => {
        mapService.modifyMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyMap(new Map(), res);
    });

    it('deleteMap() should succeed if service able to delete the Map', async () => {
        mapService.deleteMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteMap('', res);
    });

    it('deleteMap() should return NOT_FOUND when service cannot delete the Map', async () => {
        mapService.deleteMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteMap('', res);
    });

    it('getMapByName() should return all name Maps', async () => {
        const fakeMaps = new Map();
        mapService.getMapByName.resolves(fakeMaps);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (maps) => {
            expect(maps).toEqual(fakeMaps);
            return res;
        };

        await controller.getMapByName('', res);
    });

    it('getMapByName() should return INTERNAL_SERVER_ERROR when service unable to fetch name Map', async () => {
        mapService.getMapByName.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.getMapByName('', res);
    });

    it('getMapByName() should return NOT_FOUND when Map is not in the database', async () => {
        mapService.getMapByName.resolves();
        mapService.getMapByName.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMapByName('', res);
    });

    const getFakeMap = (): CreateMapDto => ({
        name: 'Engineers of War',
        size: 10,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.ICE,
                    item: Item.BOOST1,
                },
                {
                    terrain: TileTerrain.WALL,
                    item: Item.BOOST2,
                },
            ],
        ],
        description: 'A map for the Engineers of War',
        placedItems: [],
        imageData: 'ajfa',
    });
});
