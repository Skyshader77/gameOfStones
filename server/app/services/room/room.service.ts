import {
    ERROR_ROOM_DELETION_FAILED,
    ERROR_ROOM_INSERTION_FAILED,
    ERROR_ROOM_MODIFY_FAILED,
    ERROR_ROOM_NOT_FOUND,
    ERROR_ROOM_SEARCH_FAILED,
} from '@app/constants/room.constants';
import { Room, RoomDocument } from '@app/model/database/room';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class RoomService {
    constructor(@InjectModel(Room.name) public roomModel: Model<RoomDocument>) {}

    async getAllRooms(): Promise<Room[]> {
        return await this.roomModel.find({});
    }

    async getRoom(roomId: string): Promise<Room> {
        try {
            if (Types.ObjectId.isValid(roomId)) {
                return await this.roomModel.findOne({ _id: roomId });
            } else {
                return null;
            }
        } catch (error) {
            return Promise.reject(`${ERROR_ROOM_SEARCH_FAILED} ${error}`);
        }
    }

    async addRoom(room: Room): Promise<void> {
        try {
            await this.roomModel.create(room);
        } catch (error) {
            return Promise.reject(`${ERROR_ROOM_INSERTION_FAILED} ${error}`);
        }
    }

    async deleteRoom(roomID: string): Promise<void> {
        try {
            const res = await this.roomModel.deleteOne({
                _id: roomID,
            });
            if (res.deletedCount === 0) {
                return Promise.reject(ERROR_ROOM_NOT_FOUND);
            }
        } catch (error) {
            return Promise.reject(`${ERROR_ROOM_DELETION_FAILED} ${error}`);
        }
    }

    async deleteRoomByCode(roomCode: string): Promise<void> {
        try {
            const res = await this.roomModel.deleteOne({
                roomCode,
            });
            if (res.deletedCount === 0) {
                return Promise.reject(ERROR_ROOM_NOT_FOUND);
            }
        } catch (error) {
            return Promise.reject(`${ERROR_ROOM_DELETION_FAILED} ${error}`);
        }
    }

    async getRoomByCode(roomCode: string): Promise<Room | null> {
        const filterQuery: FilterQuery<Room> = { roomCode };
        return await this.roomModel.findOne(filterQuery);
    }

    async modifyRoom(room: Room): Promise<void> {
        const filterQuery = { roomCode: room.roomCode };
        try {
            const res = await this.roomModel.replaceOne(filterQuery, room);
            if (res.matchedCount === 0) {
                return Promise.reject(ERROR_ROOM_NOT_FOUND);
            }
        } catch (error) {
            return Promise.reject(`${ERROR_ROOM_MODIFY_FAILED} ${error}`);
        }
    }
}
