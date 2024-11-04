import { MOCK_ROOM } from '@app/constants/test.constants';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { RoomService } from './room.service';

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
        expect(await service.getRoom(room._id)).toEqual(expect.objectContaining({ ...room, _id: new Types.ObjectId(room._id) }));
    });

    it('GetRoom() should return null if the ID is invalid', async () => {
        const room = MOCK_ROOM;
        expect(await service.getRoom(room._id)).toBeNull();
    });

    it('GetRoom() should return null if the ID format is invalid', async () => {
        expect(await service.getRoom('invalid')).toBeNull();
    });

    it('GetRoom() should fail in mongodb query fails', async () => {
        jest.spyOn(roomModel, 'findOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.getRoom(room._id)).rejects.toBeTruthy();
    });

    it('GetAllRooms() should return all the rooms', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        const allRooms = await service.getAllRooms();
        expect(allRooms).toHaveLength(1);
        expect(allRooms).toContainEqual(expect.objectContaining({ ...room, _id: new Types.ObjectId(room._id) }));
    });

    it('AddRoom() should add a room to the database', async () => {
        const room = MOCK_ROOM;
        await service.addRoom({ ...room });
        expect(await roomModel.countDocuments()).toEqual(1);
        expect(await service.getRoom(room._id)).toEqual(expect.objectContaining({ ...room, _id: new Types.ObjectId(room._id) }));
    });

    it('AddRoom() should fail if mongodb query fails', async () => {
        jest.spyOn(roomModel, 'create').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.addRoom({ ...room })).rejects.toBeTruthy();
    });

    it('DeleteRoom() should delete the room with the specified ID', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        await service.deleteRoom(room._id);
        expect(await roomModel.countDocuments()).toEqual(0);
    });

    it('DeleteRoom() should fail if the room doesnt exist', async () => {
        const room = MOCK_ROOM;
        await expect(service.deleteRoom(room._id)).rejects.toBeTruthy();
    });

    it('DeleteRoom() should fail if the mongodb query fails', async () => {
        jest.spyOn(roomModel, 'deleteOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.deleteRoom(room._id)).rejects.toBeTruthy();
    });

    it('GetRoomByCode() should return the room with the specified room code', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        expect(await service.getRoomByCode(room.roomCode)).toEqual(expect.objectContaining({ ...room, _id: new Types.ObjectId(room._id) }));
    });

    it('modifyRoom() should fail if the mongodb query fails', async () => {
        jest.spyOn(roomModel, 'updateOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.modifyRoom(room)).rejects.toBeTruthy();
    });

    it('modifyRoom() should fail if the room doesnt exist', async () => {
        const room = MOCK_ROOM;
        await expect(service.modifyRoom(room)).rejects.toBeTruthy();
    });

    it('modifyRoom() should modify the Islocked attribute for a Room', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        const updatedRoom = MOCK_ROOM;
        updatedRoom.isLocked = !MOCK_ROOM.isLocked;
        await service.modifyRoom(updatedRoom);
        expect(await service.getRoom(room._id)).toEqual(expect.objectContaining({ ...updatedRoom, _id: new Types.ObjectId(updatedRoom._id) }));
    });

    it('deleteRoomByCode() should delete the room with the specified room code', async () => {
        const room = MOCK_ROOM;
        await roomModel.create(room);
        await service.deleteRoomByCode(room.roomCode);
        expect(await roomModel.countDocuments()).toEqual(0);
    });

    it("deleteRoomByCode() should fail if the room doesn't exist", async () => {
        const roomCode = 'nonexistent-code';
        await expect(service.deleteRoomByCode(roomCode)).rejects.toEqual("La salle n'a pas été trouvée");
    });

    it('deleteRoomByCode() should fail if the mongodb query fails', async () => {
        jest.spyOn(roomModel, 'deleteOne').mockRejectedValue('Database failure');
        const room = MOCK_ROOM;
        await expect(service.deleteRoomByCode(room.roomCode)).rejects.toBeTruthy();
    });

    it('modifyRoom() should fail if the mongodb query fails', async () => {
        const room = MOCK_ROOM;
        jest.spyOn(roomModel, 'replaceOne').mockRejectedValue(new Error('Database failure'));
        await expect(service.modifyRoom(room)).rejects.toEqual("La salle n'a pas pu être modifiée: Error: Database failure");
    });
});
