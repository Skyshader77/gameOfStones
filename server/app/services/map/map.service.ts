import { Map, MapDocument } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class MapService {
    constructor(
        @InjectModel(Map.name) public mapModel: Model<MapDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllMaps(): Promise<Map[]> {
        return await this.mapModel.find({});
    }

    async getMap(searchedmapID: string): Promise<Map> {
        try {
            if (Types.ObjectId.isValid(searchedmapID)) {
                return await this.mapModel.findOne({ _id: searchedmapID });
            } else {
                return null;
            }
        } catch (error) {
            return Promise.reject(`La carte n'a pas été trouvée: ${error}`);
        }
    }

    async addMap(map: CreateMapDto): Promise<string> {
        try {
            const createdMap = await this.mapModel.create(map);
            return createdMap._id.toString();
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être inserée: ${error}`);
        }
    }

    async deleteMap(searchedmapID: string): Promise<void> {
        try {
            const res = await this.mapModel.deleteOne({
                _id: searchedmapID,
            });
            if (res.deletedCount === 0) {
                return Promise.reject("La carte n'a pas été trouvée");
            }
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être supprimée: ${error}`);
        }
    }

    async modifyMap(map: Map): Promise<void> {
        const filterQuery = { _id: map._id };
        try {
            const res = await this.mapModel.replaceOne(filterQuery, map);
            if (res.matchedCount === 0) {
                return Promise.reject("La carte n'a pas été trouvée");
            }
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être modifiée: ${error}`);
        }
    }

    async getMapByName(searchedName: string): Promise<Map | null> {
        const filterQuery: FilterQuery<Map> = { name: searchedName };
        return await this.mapModel.findOne(filterQuery);
    }
}
