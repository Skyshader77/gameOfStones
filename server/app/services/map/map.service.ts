import { Map, MapDocument } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { UpdateMapDto } from '@app/model/dto/map/update-map.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
@Injectable()
export class MapService {
    constructor(
        @InjectModel(Map.name) public mapModel: Model<MapDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.mapModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const maps: CreateMapDto[] = [
            {
                mapID: 'Mig29OV',
                sizeRow: 20,
                name: 'Engineers of War',
                dateOfLastModification: new Date(),
                mode: 'CTF',
                isVisible: false,
                mapArray: [
                    {
                        tileType: 'grass',
                        itemType: 'mushroom',
                    },
                    {
                        tileType: 'grass',
                        itemType: 'hammer',
                    },
                ],
            },
            {
                mapID: 'F15StrikeEagle',
                sizeRow: 10,
                name: 'Game of Stones',
                dateOfLastModification: new Date(),
                mode: 'CTF',
                isVisible: false,
                mapArray: [
                    {
                        tileType: 'grass',
                        itemType: 'star',
                    },
                    {
                        tileType: 'grass',
                        itemType: 'mushroom',
                    },
                ],
            },
            {
                mapID: 'F16FightingFalcon',
                sizeRow: 15,
                name: 'Game of Drones',
                dateOfLastModification: new Date(),
                mode: 'Classic',
                isVisible: false,
                mapArray: [
                    {
                        tileType: 'grass',
                        itemType: 'sword',
                    },
                    {
                        tileType: 'door',
                        itemType: 'mushroom',
                    },
                ],
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.mapModel.insertMany(maps);
        this.logger.log('DONE ADDING ALL MAPS');
    }

    async getAllMaps(): Promise<Map[]> {
        return await this.mapModel.find({});
    }

    async getMap(searchedmapID: string): Promise<Map> {
        try {
            const map = await this.mapModel.findOne({ mapID: searchedmapID });
            if (map == null) {
                throw new Error('Cannot find Map');
            }
            return map;
        } catch (error) {
            return Promise.reject(`Failed to get Map: ${error}`);
        }
    }

    async addMap(map: CreateMapDto): Promise<void> {
        try {
            await this.mapModel.create(map);
        } catch (error) {
            return Promise.reject(`Failed to insert Map: ${error}`);
        }
    }

    async deleteMap(searchedmapID: string): Promise<void> {
        try {
            const res = await this.mapModel.deleteOne({
                mapID: searchedmapID,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find Map');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete Map: ${error}`);
        }
    }

    async modifyMap(map: UpdateMapDto): Promise<void> {
        const filterQuery = { mapID: map.mapID };
        try {
            const res = await this.mapModel.replaceOne(filterQuery, map);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find Map');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async getMapsByName(searchedName: string): Promise<Map[]> {
        const filterQuery: FilterQuery<Map> = { name: searchedName };
        return await this.mapModel.find(filterQuery);
    }
}
