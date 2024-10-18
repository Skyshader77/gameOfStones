import { ItemType } from '@app/interfaces/item';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Map } from '@app/model/database/map';
import { GameMode } from '@app/interfaces/gamemode';
import { ObjectId } from 'mongodb';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { Room } from '@app/model/database/room';
import { MapSize } from '@app/interfaces/mapSize';

export const ROOM_CODE_LENGTH = 4;
export const MOCK_MAPS: Map[] = [
    {
        size: MapSize.SMALL,
        name: 'Engineers of War',
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        isVisible: true,
        mode: GameMode.NORMAL,
        mapArray: [[TileTerrain.OPENDOOR, TileTerrain.WATER]],
        description: 'A map for the Engineers of War',
        placedItems: [],
        _id: new ObjectId(),
        imageData: 'kesdf',
    },
    {
        size: MapSize.SMALL,
        name: 'Defenders of Satabis',
        dateOfLastModification: new Date('December 18, 1995 03:24:00'),
        isVisible: false,
        mode: GameMode.CTF,
        mapArray: [[TileTerrain.ICE, TileTerrain.WALL]],
        description: 'A map for the Defenders of Satabis',
        placedItems: [],
        _id: new ObjectId(),
        imageData: 'amvdvnak',
    },
];

export const MOCK_MAP_DTO: CreateMapDto = {
    name: 'Engineers of War',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: [[TileTerrain.ICE, TileTerrain.WALL]],
    description: 'A map for the Engineers of War',
    placedItems: [
        { position: { x: 0, y: 0 }, type: ItemType.BOOST1 },
        { position: { x: 0, y: 0 }, type: ItemType.BOOST1 },
    ],
    imageData: 'ajfa',
};

export const MOCK_ROOM: Room = {
    _id: new ObjectId(),
    roomCode: '1A34',
};
