import { Map } from '@app/model/database/map';
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
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getallMaps() should return all Maps', async () => {
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

    it('getallMaps() should return NOT_FOUND when service unable to fetch Maps', async () => {
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

    it('getmap() should return NOT_FOUND when service unable to fetch the Map', async () => {
        mapService.getMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.mapID('', res);
    });

    it('addMap() should succeed if service able to add the Map', async () => {
        mapService.addMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addMap(new Map(), res);
    });

    it('addMap() should return CONFLICT when service add the Map', async () => {
        mapService.addMap.rejects();

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

    it('getMapsByName() should return all name Maps', async () => {
        const fakeMaps = [new Map(), new Map()];
        mapService.getMapsByName.resolves(fakeMaps);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (maps) => {
            expect(maps).toEqual(fakeMaps);
            return res;
        };

        await controller.getMapsByName('', res);
    });

    it('getMapsByName() should return NOT_FOUND when service unable to fetch name Maps', async () => {
        mapService.getMapsByName.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMapsByName('', res);
    });
});
