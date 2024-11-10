import { Game } from '@app/interfaces/gameplay';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MOVEMENT_CONSTANTS, TERRAIN_PATTERNS } from './player.movement.test.constants';
import { MOCK_ROOM, MOCK_TIMER } from './test.constants';
import { Map } from '@app/model/database/map';
import { ItemType } from '@common/enums/item-type.enum';
import { Item } from '@common/interfaces/item';
import { MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO } from './gameplay.test.constants';
import { RoomGame } from '@app/interfaces/room-game';

export const MOCK_ITEM1: Item = { position: { x: 1, y: 1 }, type: ItemType.Boost1 };
export const MOCK_ITEM2: Item = { position: { x: 2, y: 2 }, type: ItemType.Boost2 };

const mockFactoriesItem = {
    createMapwithItems: (terrain: TileTerrain[][], name = MOVEMENT_CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: terrain.map((row) => [...row]),
        description: MOVEMENT_CONSTANTS.game.defaultDescription,
        placedItems: [MOCK_ITEM1, MOCK_ITEM2],
        imageData: MOVEMENT_CONSTANTS.game.defaultImageData,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),
    createGamewithItems: (map: Map, options: Partial<Game>): Game => ({
        map,
        winner: '',
        mode: GameMode.Normal,
        currentPlayer: '0',
        hasPendingAction: false,
        status: GameStatus.Waiting,
        stats: {
            timeTaken: new Date(),
            percentageDoorsUsed: 0,
            numberOfPlayersWithFlag: 0,
            highestPercentageOfMapVisited: 0,
        },
        isDebugMode: false,
        timer: MOCK_TIMER,
        isTurnChange: false,
        ...options,
    }),
};

export const MOCK_MAP_ITEMS = {
    mapWithItems: mockFactoriesItem.createMapwithItems(TERRAIN_PATTERNS.allGrass),
};

export const MOCK_GAMES_ITEMS = {
    gameWithItems: mockFactoriesItem.createGamewithItems(MOCK_MAP_ITEMS.mapWithItems, { currentPlayer: 'Player1' }),
};

export const MOCK_ROOM_ITEMS: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_GAMES_ITEMS.gameWithItems,
};
