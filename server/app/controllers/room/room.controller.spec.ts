import { Room } from '@app/model/database/room';
import { RoomService } from '@app/services/room/room.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomController } from './room.controller';
import { mockRoom } from '@app/constants/test-constants';

describe('RoomController', () => {
    let roomService: SinonStubbedInstance<RoomService>;
    let controller: RoomController;
    beforeEach(async () => {
        roomService = createStubInstance(RoomService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoomController],
            providers: [
                {
                    provide: RoomService,
                    useValue: roomService,
                },
            ],
        }).compile();

        controller = module.get<RoomController>(RoomController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('GetAllRooms() should return all the rooms', async () => {
        const fakeRooms = [new Room(), new Room()];
        roomService.getAllRooms.resolves(fakeRooms);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (rooms) => {
            expect(rooms).toEqual(fakeRooms);
            return res;
        };

        await controller.getAllRooms(res);
    });

    it('GetAllRooms() should return INTERNAL_SERVER_ERROR when service is unable to fetch the rooms', async () => {
        roomService.getAllRooms.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.getAllRooms(res);
    });

    it('GetRoom() should return the room', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.resolves(fakeRoom);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (room) => {
            expect(room).toEqual(fakeRoom);
            return res;
        };

        await controller.getRoomID(fakeRoom._id.toString(), res);
    });

    it('GetRoom() should return NOT_FOUND when room does not exist', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getRoomID(fakeRoom._id.toString(), res);
    });

    it('GetRoom() should return INTERNAL_SERVER_ERROR when service is unable to fetch the room', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.getRoomID(fakeRoom._id.toString(), res);
    });

    it('AddRoom() should add a new room', async () => {
        roomService.addRoom.resolves();
        roomService.getRoomByCode.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addRoom(res);
    });

    it('AddRoom() should return INTERNAL_SERVER_ERROR when service is unable to add the room', async () => {
        roomService.addRoom.rejects();
        roomService.getRoomByCode.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.addRoom(res);
    });

    it('DeleteRoom() should delete the room', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.resolves(fakeRoom);
        roomService.deleteRoom.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteRoom(fakeRoom._id.toString(), res);
    });

    it('DeleteRoom() should return NOT_FOUND when room does not exist', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteRoom(fakeRoom._id.toString(), res);
    });

    it('DeleteRoom() should return INTERNAL_SERVER_ERROR when service is unable to delete the room', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoom.resolves(fakeRoom);
        roomService.deleteRoom.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.deleteRoom(fakeRoom._id.toString(), res);
    });

    it('getRoomByCode() should return the room by code', async () => {
        const fakeRoom: Room = mockRoom;
        roomService.getRoomByCode.resolves(fakeRoom);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (room) => {
            expect(room).toEqual(fakeRoom);
            return res;
        };

        await controller.getRoomByCode(fakeRoom.roomCode, res);
    });

    it('getRoomByCode() should return NOT_FOUND when room does not exist', async () => {
        roomService.getRoomByCode.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getRoomByCode('B24F', res);
    });

    it('getRoomByCode() should return INTERNAL_SERVER_ERROR when service is unable to fetch the room by code', async () => {
        roomService.getRoomByCode.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.getRoomByCode('B24F', res);
    });
});
