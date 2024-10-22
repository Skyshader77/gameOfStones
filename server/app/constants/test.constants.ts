import { GameMode } from '@app/interfaces/game-mode';
import { Game } from '@app/interfaces/gameplay';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/map-size';
import { Player, PlayerInfo, PlayerInGame, PlayerStatistics } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@app/interfaces/tile-terrain';
import { Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { D6_ATTACK_FIELDS, PlayerRole } from '@common/interfaces/player.constants';
import { ObjectId } from 'mongodb';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';

export const ROOM_CODE_LENGTH = 4;
export const MOCK_MAPS: Map[] = [
    {
        size: MapSize.SMALL,
        name: 'Engineers of War',
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        isVisible: true,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.OPENDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
        ],
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
        mapArray: [
            [
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
            ],
        ],
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
    mapArray: [
        [
            {
                terrain: TileTerrain.ICE,
                item: Item.BOOST1,
            },
            {
                terrain: TileTerrain.WALL,
                item: Item.BOOST2,
            },
        ],
    ],
    description: 'A map for the Engineers of War',
    placedItems: [],
    imageData: 'ajfa',
};

const MOCK_PLAYER_STATS: PlayerStatistics = {
    isWinner: false,
    numbVictories: 0,
    numbDefeats: 0,
    numbEscapes: 0,
    numbBattles: 0,
    totalHpLost: 0,
    totalDamageGiven: 0,
    numbPickedUpItems: 0,
    percentageMapVisited: 0,
};

const MOCK_PLAYER_IN_GAME: PlayerInGame = {
    hp: 4,
    movementSpeed: 6,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    hasAbandonned: false,
    remainingMovement: 0,
};

const MOCK_PLAYER_INFO: PlayerInfo[] = [
    {
        id: '1',
        userName: 'mockPlayer',
        role: PlayerRole.HUMAN,
    },
    {
        id: '2',
        userName: 'mockPlayer2',
        role: PlayerRole.HUMAN,
    },
];
export const MOCK_PLAYERS: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME,
    },
];

export const MOCK_ROOM: Room = {
    _id: new ObjectId(),
    roomCode: '1A34',
};

export const MOCK_PLAYER_SOCKET_INDICES: PlayerSocketIndices = {
    room: 'roomSocket',
    chat: 'chatSocket',
    game: 'gameSocket',
};

export const MOCK_ROOM_GAME: RoomGame = {
    room: { roomCode: '1234' },
    players: [],
    chatList: [],
    journal: [],
    isLocked: false,
    game: new Game(),
};
