import { ERROR_MAP_DELETE_FAILED, ERROR_MAP_INSERT_FAILED, ERROR_MAP_MODIFY_FAILED, ERROR_MAP_NOT_FOUND } from '@app/constants/map.constants';
import { Map, MapDocument } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class MapService {
    constructor(@InjectModel(Map.name) public mapModel: Model<MapDocument>) {}

    async getAllMaps(): Promise<Map[]> {
        return this.mapModel.find({});
    }

    async getMap(searchedMapID: string): Promise<Map> {
        try {
            return Types.ObjectId.isValid(searchedMapID) ? this.mapModel.findOne({ _id: searchedMapID }) : null;
        } catch (error) {
            return Promise.reject(`${ERROR_MAP_NOT_FOUND} ${error}`);
        }
    }

    async addMap(map: CreateMapDto): Promise<string> {
        try {
            const createdMap = await this.mapModel.create(map);
            return createdMap._id.toString();
        } catch (error) {
            return Promise.reject(`${ERROR_MAP_INSERT_FAILED} ${error}`);
        }
    }

    async deleteMap(searchedMapID: string): Promise<void> {
        try {
            const res = await this.mapModel.deleteOne({ _id: searchedMapID });
            return res.deletedCount === 0 ? Promise.reject(ERROR_MAP_NOT_FOUND) : undefined;
        } catch (error) {
            return Promise.reject(`${ERROR_MAP_DELETE_FAILED} ${error}`);
        }
    }

    async modifyMap(map: Map): Promise<void> {
        try {
            const res = await this.mapModel.replaceOne({ _id: map._id }, map);
            return res.matchedCount === 0 ? Promise.reject(ERROR_MAP_NOT_FOUND) : undefined;
        } catch (error) {
            return Promise.reject(`${ERROR_MAP_MODIFY_FAILED} ${error}`);
        }
    }

    async getMapByName(searchedName: string): Promise<Map | null> {
        const filterQuery: FilterQuery<Map> = { name: searchedName };
        return this.mapModel.findOne(filterQuery);
    }
}
