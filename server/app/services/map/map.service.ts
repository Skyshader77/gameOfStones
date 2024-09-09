import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Map, MapDocument } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { UpdateMapDto } from '@app/model/dto/map/update-map.dto';
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
                "mapID": "Mig29OV",
                "sizeRow": 20,
                "name": "Engineers of War",
                "dateOfLastModification": new Date(),
                "mode": "CTF",
                "mapArray": [
                    {
                        "tileType": "grass",
                        "isStartingSpot": true,
                        "itemType": "mushroom"
                    },
                    {
                        "tileType": "grass",
                        "isStartingSpot": true,
                        "itemType": "hammer"
                    }
                ]
            },
            {
                "mapID": "F15StrikeEagle",
                "sizeRow": 10,
                "name": "Game of Stones",
                "dateOfLastModification": new Date(),
                "mode": "CTF",
                "mapArray": [
                    {
                        "tileType": "grass",
                        "isStartingSpot": false,
                        "itemType": "star"
                    },
                    {
                        "tileType": "grass",
                        "isStartingSpot": false,
                        "itemType": "mushroom"
                    }
                ]
            }, ,
            {
                "mapID": "F16FightingFalcon",
                "sizeRow": 15,
                "name": "Game of Drones",
                "dateOfLastModification": new Date(),
                "mode": "Classic",
                "mapArray": [
                    {
                        "tileType": "grass",
                        "isStartingSpot": true,
                        "itemType": "sword"
                    },
                    {
                        "tileType": "door",
                        "isStartingSpot": false,
                        "itemType": "mushroom"
                    }
                ]
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.mapModel.insertMany(maps);
    }

    async getAllMaps(): Promise<Map[]> {
        return await this.mapModel.find({});
    }

    async getMap(searchedmapID: string): Promise<Map> {
        // NB: This can return null if the Map does not exist, you need to handle it
        return await this.mapModel.findOne({ mapID: searchedmapID });
    }

    async addMap(Map: CreateMapDto): Promise<void> {
        try {
            await this.mapModel.create(Map);
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

    async modifyMap(Map: UpdateMapDto): Promise<void> {
        const filterQuery = { mapID: Map.mapID };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.mapModel.replaceOne(filterQuery, Map);
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
