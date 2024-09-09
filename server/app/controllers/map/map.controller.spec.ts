import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from '@app/services/map/map.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { MapController } from './map.controller';
import { Map } from '@app/model/database/map';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('MapController', () => {
    let controller: MapController;
    let MapService: SinonStubbedInstance<MapService>;

    beforeEach(async () => {
        MapService = createStubInstance(MapService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MapController],
            providers: [
                {
                    provide: MapService,
                    useValue: MapService,
                },
            ],
        }).compile();

        controller = module.get<MapController>(MapController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allMaps() should return all Maps', async () => {
        const fakeMaps = [new Map(), new Map()];
        MapService.getAllMaps.resolves(fakeMaps);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (Maps) => {
            expect(Maps).toEqual(fakeMaps);
            return res;
        };

        await controller.allMaps(res);
    });

    it('allMaps() should return NOT_FOUND when service unable to fetch Maps', async () => {
        MapService.getAllMaps.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allMaps(res);
    });

    it('mapID() should return the subject code', async () => {
        const fakeMap = new Map();
        MapService.getMap.resolves(fakeMap);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (Maps) => {
            expect(Maps).toEqual(fakeMap);
            return res;
        };

        await controller.mapID('', res);
    });

    it('mapID() should return NOT_FOUND when service unable to fetch the Map', async () => {
        MapService.getMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.mapID('', res);
    });

    it('addMap() should succeed if service able to add the Map', async () => {
        MapService.addMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addMap(new Map(), res);
    });

    it('addMap() should return NOT_FOUND when service add the Map', async () => {
        MapService.addMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.addMap(new Map(), res);
    });

    it('modifyMap() should succeed if service able to modify the Map', async () => {
        MapService.modifyMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyMap(new Map(), res);
    });

    it('modifyMap() should return NOT_FOUND when service cannot modify the Map', async () => {
        MapService.modifyMap.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyMap(new Map(), res);
    });

    it('deleteMap() should succeed if service able to delete the Map', async () => {
        MapService.deleteMap.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteMap('', res);
    });

    it('deleteMap() should return NOT_FOUND when service cannot delete the Map', async () => {
        MapService.deleteMap.rejects();

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
        MapService.getMapsByName.resolves(fakeMaps);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (Maps) => {
            expect(Maps).toEqual(fakeMaps);
            return res;
        };

        await controller.getMapsByName('', res);
    });

    it('getMapsByName() should return NOT_FOUND when service unable to fetch name Maps', async () => {
        MapService.getMapsByName.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMapsByName('', res);
    });
});
