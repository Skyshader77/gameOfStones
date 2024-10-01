import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { TileTerrain } from '@app/interfaces/tileTerrain';
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
                size: MapSize.SMALL,
                name: 'Engineers of War',
                mode: GameMode.CTF,
                mapArray: [
                    [
                        {
                            terrain: TileTerrain.GRASS,
                            item: Item.NONE,
                        },
                        {
                            terrain: TileTerrain.WATER,
                            item: Item.NONE,
                        },
                    ],
                ],
                placedItems: [],
                description: 'A map for the Engineers of War',
                imageData: 'fasnfagf',
            },
            {
                size: MapSize.LARGE,
                name: 'Battle of the Bastards',
                mode: GameMode.NORMAL,
                mapArray: [
                    [
                        {
                            terrain: TileTerrain.GRASS,
                            item: Item.NONE,
                        },
                        {
                            terrain: TileTerrain.WALL,
                            item: Item.NONE,
                        },
                    ],
                ],
                placedItems: [],
                description: 'The battle of the bastards, Jon Snow vs Ramsay Bolton',
                imageData: 'fakfaskfi',
            },
            {
                size: MapSize.MEDIUM,
                name: 'Bowser Castle',
                mode: GameMode.CTF,
                mapArray: [
                    [
                        {
                            terrain: TileTerrain.ICE,
                            item: Item.NONE,
                        },
                        {
                            terrain: TileTerrain.ICE,
                            item: Item.BOOST1,
                        },
                    ],
                ],
                placedItems: [Item.BOOST1],
                description: 'The castle of Bowser, the king of the Koopas',
                imageData: 'afadag',
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
            if (Types.ObjectId.isValid(searchedmapID)) {
                return await this.mapModel.findOne({ _id: searchedmapID });
            } else {
                return null;
            }
        } catch (error) {
            return Promise.reject(`Failed to get Map: ${error}`);
        }
    }

    async addMap(map: CreateMapDto): Promise<string> {
        try {
            const createdMap = await this.mapModel.create(map);
            return createdMap._id.toString();
        } catch (error) {
            return Promise.reject(`Failed to insert Map: ${error}`);
        }
    }

    async deleteMap(searchedmapID: string): Promise<void> {
        try {
            const res = await this.mapModel.deleteOne({
                _id: searchedmapID,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find Map');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete Map: ${error}`);
        }
    }

    async modifyMap(map: Map): Promise<void> {
        const filterQuery = { _id: map._id };
        try {
            const res = await this.mapModel.replaceOne(filterQuery, map);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find Map');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async getMapByName(searchedName: string): Promise<Map | null> {
        const filterQuery: FilterQuery<Map> = { name: searchedName };
        return await this.mapModel.findOne(filterQuery);
    }
}
