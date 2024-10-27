import { Room, RoomDocument } from '@app/model/database/room';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) public roomModel: Model<RoomDocument>,
        private readonly logger: Logger,
    ) {}

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
            return Promise.reject(`La recherche de salle a échouée: ${error}`);
        }
    }

    async addRoom(room: Room): Promise<void> {
        try {
            await this.roomModel.create(room);
        } catch (error) {
            return Promise.reject(`L'insertion de salle a échouée: ${error}`);
        }
    }

    async deleteRoom(roomID: string): Promise<void> {
        try {
            const res = await this.roomModel.deleteOne({
                _id: roomID,
            });
            if (res.deletedCount === 0) {
                return Promise.reject("La salle n' a pas été trouvée");
            }
        } catch (error) {
            return Promise.reject(`La suppression de salle a échouée: ${error}`);
        }
    }

    async deleteRoomByCode(roomCode: string): Promise<void> {
        try {
            const res = await this.roomModel.deleteOne({
                roomCode,
            });
            if (res.deletedCount === 0) {
                return Promise.reject("La salle n' a pas été trouvée");
            }
        } catch (error) {
            return Promise.reject(`La suppression de salle a échouée: ${error}`);
        }
    }

    async getRoomByCode(roomCode: string): Promise<Room | null> {
        const filterQuery: FilterQuery<Room> = { roomCode };
        return await this.roomModel.findOne(filterQuery);
    }

    async modifyRoom(room:Room): Promise<void> {
        const filterQuery = { roomCode: room.roomCode };
        try {
            const res = await this.roomModel.replaceOne(filterQuery, room);
            if (res.matchedCount === 0) {
                return Promise.reject("La salle n'a pas été trouvée");
            }
        } catch (error) {
            return Promise.reject(`La salle n'a pas pu être modifiée: ${error}`);
        }
    }


    async getRoomLockStatus(roomCode: string): Promise<boolean | null> {
        const filterQuery: FilterQuery<Room> = { roomCode };
        return (await this.roomModel.findOne(filterQuery)).isLocked;
    }

}
