import { MOCK_MAPS } from '@app/constants/test.constants';
import { Map, MapDocument, mapSchema } from '@app/model/database/map';
import { GameMode } from '@common/enums/game-mode.enum';
import { Logger } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { MapService } from './map.service';

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

    it('getMap() should return Map with the specified map ID', async () => {
        const map = MOCK_MAPS[0];
        await mapModel.create(map);
        expect(await service.getMap(map._id)).toEqual(expect.objectContaining({ ...map, _id: new Types.ObjectId(map._id) }));
    });

    it('getMap() should return null if Map does not exist', async () => {
        const map = MOCK_MAPS[0];
        expect(await service.getMap(map._id)).toBeNull();
    });

    it('getMap() should return null if id has incorrect format', async () => {
        const fakeId = 'abcd';
        expect(await service.getMap(fakeId)).toBeNull();
    });

    it('getMap() should fail if mongo query fails', async () => {
        jest.spyOn(mapModel, 'findOne').mockRejectedValue('Database failure');
        const map = MOCK_MAPS[0];
        await expect(service.getMap(map._id)).rejects.toBeTruthy();
    });

    it('getAllMaps() return all Maps in database', async () => {
        const map = MOCK_MAPS[0];
        await mapModel.create(map);
        const allMaps = await service.getAllMaps();
        expect(allMaps.length).toBeGreaterThan(0);
        expect(allMaps).toContainEqual(expect.objectContaining({ ...map, _id: new Types.ObjectId(map._id) }));
    });

    it('modifyMap() should succeed if Map exists', async () => {
        const map = MOCK_MAPS[0];
        const secondMap = MOCK_MAPS[1];
        secondMap._id = map._id;
        await mapModel.create(map);
        await service.modifyMap(secondMap);
        expect(await service.getMap(map._id)).toEqual(expect.objectContaining({ ...secondMap, _id: new Types.ObjectId(secondMap._id) }));
    });

    it('modifyMap() should fail if Map does not exist', async () => {
        const map = MOCK_MAPS[0];
        await expect(service.modifyMap(map)).rejects.toBeTruthy();
    });

    it('modifyMap() should fail if mongo query failed', async () => {
        jest.spyOn(mapModel, 'replaceOne').mockRejectedValue('Database failure');
        const map = MOCK_MAPS[0];
        await expect(service.modifyMap(map)).rejects.toBeTruthy();
    });

    it('deleteMap() should delete the Map', async () => {
        const map = MOCK_MAPS[0];
        await mapModel.create(map);
        await service.deleteMap(map._id);
        expect(await mapModel.countDocuments()).toEqual(0);
        expect(await service.getMap(map._id)).toBeNull();
    });

    it('deleteMap() should fail if the Map does not exist', async () => {
        const map = MOCK_MAPS[0];
        await expect(service.deleteMap(map._id)).rejects.toBeTruthy();
    });

    it('deleteMap() should fail if Mongo query failed', async () => {
        jest.spyOn(mapModel, 'deleteOne').mockRejectedValue('');
        const map = MOCK_MAPS[0];
        await expect(service.deleteMap(map._id)).rejects.toBeTruthy();
    });

    it('addMap() should add the Map to the DB', async () => {
        const map = MOCK_MAPS[0];
        await service.addMap({ ...map });
        expect(await mapModel.countDocuments()).toEqual(1);
        expect(await service.getMap(map._id)).toEqual(expect.objectContaining({ ...map, _id: new Types.ObjectId(map._id) }));
    });

    it('addMap() should fail if mongo query failed', async () => {
        jest.spyOn(mapModel, 'create').mockImplementation(async () => Promise.reject('Database failure'));
        const map = MOCK_MAPS[0];
        await expect(service.addMap({ ...map, mode: GameMode.Normal })).rejects.toBeTruthy();
    });

    it('getMapByName() should return the Map with the specified name', async () => {
        const map = MOCK_MAPS[0];
        await mapModel.create(map);
        const dbMap = await service.getMapByName(map.name);
        expect(dbMap).toEqual(expect.objectContaining({ ...map, _id: new Types.ObjectId(map._id) }));
    });

    it('getMapByName() should return an empty array if no Map with the specified name', async () => {
        const map = MOCK_MAPS[0];
        const dbMap = await service.getMapByName(map.name);
        expect(dbMap).toBeNull();
    });
});
