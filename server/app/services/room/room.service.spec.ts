import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { RoomService } from './room.service';
import { MOCK_ROOM } from '@app/constants/test-constants';

import { Room, RoomDocument, roomSchema } from '@app/model/database/room';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';

describe('MapServiceEndToEnd', () => {
    let service: RoomService;
    let roomModel: Model<RoomDocument>;
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
                MongooseModule.forFeature([{ name: Room.name, schema: roomSchema }]),
            ],
            providers: [RoomService, Logger],
        }).compile();

        service = module.get<RoomService>(RoomService);
        roomModel = module.get<Model<RoomDocument>>(getModelToken(Room.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await roomModel.deleteMany({});
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(roomModel).toBeDefined();
    });

    it('GetRoom() should return a room with the specified ID', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        expect(await service.getRoom(room._id.toString())).toEqual(expect.objectContaining(room));
    });

    it('GetRoom() should return null if the ID is invalid', async () => {
        const room = MOCK_ROOM;
        expect(await service.getRoom(room._id.toString())).toBeNull();
    });

    it('GetRoom() should return null if the ID format is invalid', async () => {
        expect(await service.getRoom('invalid')).toBeNull();
    });

    it('GetRoom() should fail in mongodb query fails', async () => {
        jest.spyOn(roomModel, 'findOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.getRoom(room._id.toString())).rejects.toBeTruthy();
    });

    it('GetAllRooms() should return all the rooms', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        const allRooms = await service.getAllRooms();
        expect(allRooms).toHaveLength(1);
        expect(allRooms).toContainEqual(expect.objectContaining(room));
    });

    it('AddRoom() should add a room to the database', async () => {
        const room = MOCK_ROOM;
        await service.addRoom({ ...room });
        expect(await roomModel.countDocuments()).toEqual(1);
        expect(await service.getRoom(room._id.toString())).toEqual(expect.objectContaining(room));
    });

    it('AddRoom() should fail if mongodb query fails', async () => {
        jest.spyOn(roomModel, 'create').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.addRoom({ ...room })).rejects.toBeTruthy();
    });

    it('DeleteRoom() should delete the room with the specified ID', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        await service.deleteRoom(room._id.toString());
        expect(await roomModel.countDocuments()).toEqual(0);
    });

    it('DeleteRoom() should fail if the room doesnt exist', async () => {
        const room = MOCK_ROOM;
        await expect(service.deleteRoom(room._id.toString())).rejects.toBeTruthy();
    });

    it('DeleteRoom() should fail if the mongodb query fails', async () => {
        jest.spyOn(roomModel, 'deleteOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.deleteRoom(room._id.toString())).rejects.toBeTruthy();
    });

    it('GetRoomByCode() should return the room with the specified room code', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        expect(await service.getRoomByCode(room.roomCode)).toEqual(expect.objectContaining(room));
    });
});
