import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { MapService } from './map.service';

import { Map, MapDocument, mapSchema } from '@app/model/database/map';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';

describe('MapService', () => {
    let service: MapService;
    let mapModel: Model<MapDocument>;

    beforeEach(async () => {
        mapModel = {
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
                    useValue: mapModel,
                },
            ],
        }).compile();

        service = module.get<MapService>(MapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('database should be populated when there is no data', async () => {
        jest.spyOn(mapModel, 'countDocuments').mockResolvedValue(0);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('database should not be populated when there is some data', async () => {
        jest.spyOn(mapModel, 'countDocuments').mockResolvedValue(1);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });
});

describe('MapServiceEndToEnd', () => {
    let service: MapService;
    let mapModel: Model<MapDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
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
        mapModel = module.get<Model<MapDocument>>(getModelToken(Map.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await mapModel.deleteMany({});
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(mapModel).toBeDefined();
    });

    it('start() should populate the database when there is no data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await mapModel.deleteMany({});
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('populateDB() should add 3 new maps', async () => {
        const eltCountsBefore = await mapModel.countDocuments();
        await service.populateDB();
        const eltCountsAfter = await mapModel.countDocuments();
        expect(eltCountsAfter).toBeGreaterThan(eltCountsBefore);
    });

    it('getMap() return Map with the specified map ID', async () => {
        const map = getFakeMap();
        await mapModel.create(map);
        expect(await service.getMap(map._id.toString())).toEqual(expect.objectContaining(map));
    });

    it('getMap() should return null if Map does not exist', async () => {
        const map = getFakeMap();
        expect(await service.getMap(map._id.toString())).toBeNull();
    });

    it('getMap() should return null if id has incorrect format', async () => {
        const fakeId = 'abcd';
        expect(await service.getMap(fakeId)).toBeNull();
    });

    it('getMap() should fail if mongo query fails', async () => {
        jest.spyOn(mapModel, 'findOne').mockRejectedValue('Database failure');
        const map = getFakeMap();
        await expect(service.getMap(map._id.toString())).rejects.toBeTruthy();
    });

    it('getAllMaps() return all Maps in database', async () => {
        const map = getFakeMap();
        await mapModel.create(map);
        expect((await service.getAllMaps()).length).toBeGreaterThan(0);
        expect(await service.getMap(map._id.toString())).toEqual(expect.objectContaining(map));
    });

    it('modifyMap() should succeed if Map exists', async () => {
        const map = getFakeMap();
        const secondMap = getSecondFakeMap();
        secondMap._id = map._id;
        await mapModel.create(map);
        await service.modifyMap(secondMap);
        expect(await service.getMap(map._id.toString())).toEqual(expect.objectContaining(secondMap));
    });

    it('modifyMap() should fail if Map does not exist', async () => {
        const map = getFakeMap();
        await expect(service.modifyMap(map)).rejects.toBeTruthy();
    });

    it('modifyMap() should fail if mongo query failed', async () => {
        jest.spyOn(mapModel, 'replaceOne').mockRejectedValue('Database failure');
        const map = getFakeMap();
        await expect(service.modifyMap(map)).rejects.toBeTruthy();
    });

    it('deleteMap() should delete the Map', async () => {
        const map = getFakeMap();
        await mapModel.create(map);
        await service.deleteMap(map._id.toString());
        expect(await mapModel.countDocuments()).toEqual(0);
        expect(await service.getMap(map._id.toString())).toBeNull();
    });

    it('deleteMap() should fail if the Map does not exist', async () => {
        const map = getFakeMap();
        await expect(service.deleteMap(map._id.toString())).rejects.toBeTruthy();
    });

    it('deleteMap() should fail if Mongo query failed', async () => {
        jest.spyOn(mapModel, 'deleteOne').mockRejectedValue('');
        const map = getFakeMap();
        await expect(service.deleteMap(map._id.toString())).rejects.toBeTruthy();
    });

    it('addMap() should add the Map to the DB', async () => {
        const map = getFakeMap();
        await service.addMap({ ...map });
        expect(await mapModel.countDocuments()).toEqual(1);
        expect(await service.getMap(map._id.toString())).toEqual(expect.objectContaining(map));
    });

    it('addMap() should fail if mongo query failed', async () => {
        jest.spyOn(mapModel, 'create').mockImplementation(async () => Promise.reject('Database failure'));
        const map = getFakeMap();
        await expect(service.addMap({ ...map, mode: 'Classic' })).rejects.toBeTruthy();
    });

    it('getMapByName() should return the Map with the specified name', async () => {
        const map = getFakeMap();
        await mapModel.create(map);
        expect(await service.getMapByName(map.name)).toEqual(expect.objectContaining(map));
    });

    it('getMapByName() should return an empty array if no Map with the specified name', async () => {
        const map = getFakeMap();
        expect(await service.getMapByName(map.name)).toBeNull();
    });
});

const getFakeMap = (): Map => ({
    sizeRow: 10,
    name: 'Engineers of War',
    dateOfLastModification: new Date('December 17, 1995 03:24:00'),
    isVisible: true,
    mode: 'Classic',
    mapArray: [
        {
            tileType: 'grass',
            itemType: 'sword',
        },
        {
            tileType: 'ice',
            itemType: 'stone',
        },
    ],
    mapDescription: 'A map for the Engineers of War',
    _id: new ObjectId(),
});

const getSecondFakeMap = (): Map => ({
    sizeRow: 10,
    name: 'Defenders of Satabis',
    dateOfLastModification: new Date('December 18, 1995 03:24:00'),
    isVisible: false,
    mode: 'CTF',
    mapArray: [
        {
            tileType: 'grass',
            itemType: 'lava',
        },
        {
            tileType: 'ice',
            itemType: 'door',
        },
    ],
    mapDescription: 'A map for the Defenders of Satabis',
    _id: new ObjectId(),
});
