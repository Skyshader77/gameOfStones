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

    async getMap(searchedmapID: string): Promise<Map> {
        try {
            return Types.ObjectId.isValid(searchedmapID) ? this.mapModel.findOne({ _id: searchedmapID }) : null;
        } catch (error) {
            return Promise.reject(`La carte n'a pas été trouvée: ${error}`);
        }
    }

    async addMap(map: CreateMapDto): Promise<string> {
        try {
            const createdMap = await this.mapModel.create(map);
            return createdMap._id.toString();
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être insérée: ${error}`);
        }
    }

    async deleteMap(searchedmapID: string): Promise<void> {
        try {
            const res = await this.mapModel.deleteOne({ _id: searchedmapID });
            return res.deletedCount === 0 ? Promise.reject("La carte n'a pas été trouvée") : undefined;
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être supprimée: ${error}`);
        }
    }

    async modifyMap(map: Map): Promise<void> {
        try {
            const res = await this.mapModel.replaceOne({ _id: map._id }, map);
            return res.matchedCount === 0 ? Promise.reject("La carte n'a pas été trouvée") : undefined;
        } catch (error) {
            return Promise.reject(`La carte n'a pas pu être modifiée: ${error}`);
        }
    }

    async getMapByName(searchedName: string): Promise<Map | null> {
        const filterQuery: FilterQuery<Map> = { name: searchedName };
        return this.mapModel.findOne(filterQuery);
    }
}
