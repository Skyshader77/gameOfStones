import { GameMode } from '@app/interfaces/gamemode';
import { Game, GameStats } from '@app/interfaces/gameplay';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { D6_ATTACK_FIELDS, PlayerRole, PlayerStatus } from '@common/interfaces/player.constants';
import { ObjectId } from 'mongodb';
export const ROOM_CODE_LENGTH = 4;
export const INVALID_POSITIVE_COORDINATE = 99;
export const INVALID_NEGATIVE_COORDINATE = -99;
const DEFAULT_DESCRIPTION = 'A mock map';
const DEFAULT_IMAGE_DATA = 'ajfa';
const DEFAULT_MAX_DISPLACEMENT = 5;
const DEFAULT_MAP_NAME = 'Engineers of War';

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

export const MOCK_ROOM: Room = {
    _id: new ObjectId(),
    roomCode: '1A34',
};

const wallsAndIce: TileTerrain[][] = [
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
];

const closedDoorsAndIce: TileTerrain[][] = [
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
];

const openDoorsAndIce: TileTerrain[][] = [
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
];

const zigZagPath: TileTerrain[][] = [
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.ICE],
    [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.ICE],
    [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.WATER],
];

const allWaterMap: TileTerrain[][] = [
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
];

const createMockMap = (
    name = DEFAULT_MAP_NAME,
    terrain: TileTerrain[][],
    description = DEFAULT_DESCRIPTION,
    imageData = DEFAULT_IMAGE_DATA
  ): Map => ({
    name,
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: terrain.map((row) =>
      row.map((terrainType) => ({ terrain: terrainType, item: Item.NONE }))
    ),
    description,
    placedItems: [],
    imageData,
    isVisible: false,
    dateOfLastModification: undefined,
  });

  const createMockGame = (
    map: Map,
    players: Player[],
    mode: GameMode = GameMode.NORMAL,
    currentPlayer: number = 0,
    winner: number = 0,
    actionsLeft: number = 3,
    stats: GameStats = {
      timeTaken: new Date(),
      percentageDoorsUsed: 0,
      numberOfPlayersWithFlag: 0,
      highestPercentageOfMapVisited: 0,
    },
    playerStatus: PlayerStatus = PlayerStatus.WAITING,
    isDebugMode: boolean = false,
    timerValue: number = 0
  ): Game => ({
    map,
    players,
    winner,
    mode,
    currentPlayer,
    actionsLeft,
    playerStatus,
    stats,
    isDebugMode,
    timerValue,
  });

const createMockPlayer = (
    id: string,
    userName: string,
    role: PlayerRole,
    x: number,
    y: number,
  ): Player => ({
    id,
    userName,
    role,
    statistics: {
      isWinner: false,
      numbVictories: 0,
      numbDefeats: 0,
      numbEscapes: 0,
      numbBattles: 0,
      totalHpLost: 0,
      totalDamageGiven: 0,
      numbPickedUpItems: 0,
      percentageMapVisited: 0,
    },
    playerInGame: {
      hp: 0,
      movementSpeed: DEFAULT_MAX_DISPLACEMENT,
      dice: D6_ATTACK_FIELDS,
      attack: 0,
      defense: 0,
      inventory: [],
      currentPosition: { x, y },
      hasAbandonned: false,
    },
  });

  const CORRIDOR_OF_WALLS = createMockMap('Engineers of War', wallsAndIce);
  
  const TRAPPED_PLAYER = createMockMap('Trapped Player Map', closedDoorsAndIce);
  
  const UNTRAPPED_PLAYER = createMockMap('Trapped Player Map', openDoorsAndIce);
  
  const ZIG_ZAP_PATH = createMockMap('Zig Zag Path', zigZagPath);

  const ALL_WATER_MAP = createMockMap('Water Only', allWaterMap);
  
  export const MOCK_GAME_CORRIDOR = createMockGame(
    CORRIDOR_OF_WALLS,
    [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)]
  );
  
  export const MOCK_GAME_TRAPPED = createMockGame(
    TRAPPED_PLAYER,
    [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)]
  );

  export const MOCK_GAME_UNTRAPPED = createMockGame(
    UNTRAPPED_PLAYER,
    [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)]
  );

  export const MOCK_GAME_ZIG_ZAP = createMockGame(
    ZIG_ZAP_PATH,
    [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 2)]
  );
  
  export const MOCK_GAME_MULTIPLE_PLAYERS = createMockGame(
    ALL_WATER_MAP,
    [
      createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 0),
      createMockPlayer('2', 'Player2', PlayerRole.HUMAN, 0, 1),
      createMockPlayer('3', 'Player3', PlayerRole.HUMAN, 1, 1)
    ]
  );
