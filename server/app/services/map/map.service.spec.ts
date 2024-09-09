import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { MapService } from './map.service';

import { Map, MapDocument, mapSchema } from '@app/model/database/map';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';

/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe MapService) or
 * - Use mongodb memory server implementation (see describe MapServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('MapService', () => {
    let service: MapService;
    let MapModel: Model<MapDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        MapModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<MapDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MapService,
                Logger,
                {
                    provide: getModelToken(Map.name),
                    useValue: MapModel,
                },
            ],
        }).compile();

        service = module.get<MapService>(MapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('database should be populated when there is no data', async () => {
        jest.spyOn(MapModel, 'countDocuments').mockResolvedValue(0);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('database should not be populated when there is some data', async () => {
        jest.spyOn(MapModel, 'countDocuments').mockResolvedValue(1);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });
});

describe('MapServiceEndToEnd', () => {
    let service: MapService;
    let MapModel: Model<MapDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Map.name, schema: mapSchema }]),
            ],
            providers: [MapService, Logger],
        }).compile();

        service = module.get<MapService>(MapService);
        MapModel = module.get<Model<MapDocument>>(getModelToken(Map.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await MapModel.deleteMany({});
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(MapModel).toBeDefined();
    });

    it('start() should populate the database when there is no data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await MapModel.deleteMany({});
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('populateDB() should add 3 new maps', async () => {
        const eltCountsBefore = await MapModel.countDocuments();
        await service.populateDB();
        const eltCountsAfter = await MapModel.countDocuments();
        expect(eltCountsAfter).toBeGreaterThan(eltCountsBefore);
    });

    it('getAllMaps() return all Maps in database', async () => {
        const Map = getFakeMap();
        await MapModel.create(Map);
        expect((await service.getAllMaps()).length).toBeGreaterThan(0);
    });

    it('getMap() return Map with the specified map ID', async () => {
        const Map = getFakeMap();
        await MapModel.create(Map);
        expect(await service.getMap(Map.mapID)).toEqual(expect.objectContaining(Map));
    });

    it('modifyMap() should fail if Map does not exist', async () => {
        const Map = getFakeMap();
        await expect(service.modifyMap(Map)).rejects.toBeTruthy();
    });

    it('modifyMap() should fail if mongo query failed', async () => {
        jest.spyOn(MapModel, 'updateOne').mockRejectedValue('');
        const Map = getFakeMap();
        await expect(service.modifyMap(Map)).rejects.toBeTruthy();
    });

    it('getMapsByName() return Map with the specified name', async () => {
        const Map = getFakeMap();
        await MapModel.create(Map);
        await MapModel.create(Map);
        const Maps = await service.getMapsByName(Map.name);
        expect(Maps.length).toEqual(1);
        expect(Maps[0]).toEqual(expect.objectContaining(Map));
    });

    it('deleteMap() should delete the Map', async () => {
        const Map = getFakeMap();
        await MapModel.create(Map);
        await service.deleteMap(Map.mapID);
        expect(await MapModel.countDocuments()).toEqual(0);
    });

    it('deleteMap() should fail if the Map does not exist', async () => {
        const Map = getFakeMap();
        await expect(service.deleteMap(Map.mapID)).rejects.toBeTruthy();
    });

    it('deleteMap() should fail if mongo query failed', async () => {
        jest.spyOn(MapModel, 'deleteOne').mockRejectedValue('');
        const Map = getFakeMap();
        await expect(service.deleteMap(Map.mapID)).rejects.toBeTruthy();
    });

    it('addMap() should add the Map to the DB', async () => {
        const Map = getFakeMap();
        await service.addMap({ ...Map });
        expect(await MapModel.countDocuments()).toEqual(1);
    });

    it('addMap() should fail if mongo query failed', async () => {
        jest.spyOn(MapModel, 'create').mockImplementation(async () => Promise.reject(''));
        const Map = getFakeMap();
        await expect(service.addMap({ ...Map, mapID: 'Su27Flanker', mode: "Classic" })).rejects.toBeTruthy();
    });
});

const getFakeMap = (): Map => ({
    "mapID": "Su27Flanker",
    "sizeRow": 10,
    "name": "Engineers of War",
    "dateOfLastModification": new Date('December 17, 1995 03:24:00'),
    "mode": "Classic",
    "mapArray": [
        {
            "tileType": "grass",
            "isStartingSpot": true,
            "itemType": "sword"
        },
        {
            "tileType": "ice",
            "isStartingSpot": true,
            "itemType": "stone"
        }
    ]
});


