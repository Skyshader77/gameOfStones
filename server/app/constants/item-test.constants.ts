import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { BombAffectedObjects, Item } from '@common/interfaces/item';
import { Player } from '@common/interfaces/player';
import { MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO } from './gameplay.test.constants';
import { MOVEMENT_CONSTANTS, TERRAIN_PATTERNS } from './player.movement.test.constants';
import { MOCK_ROOM, MOCK_TIMER } from './test.constants';
import { MOCK_VIRTUAL_PLAYER_STATE } from './virtual-player-test.constants';

export const MOCK_ITEM1: Item = { position: { x: 1, y: 1 }, type: ItemType.BismuthShield };
export const MOCK_ITEM2: Item = { position: { x: 2, y: 2 }, type: ItemType.GlassStone };
export const MOCK_RANDOM_ITEM2: Item = { position: { x: 2, y: 2 }, type: ItemType.Random };
export const MOCK_RANDOM_ITEM1: Item = { position: { x: 2, y: 2 }, type: ItemType.Random };
export const MOCK_OFFENSIVE_ITEM: Item = { position: { x: 1, y: 1 }, type: ItemType.GeodeBomb };
export const MOCK_DEFENSIVE_ITEM: Item = { position: { x: 2, y: 2 }, type: ItemType.BismuthShield };
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
    createMapwithRandomItems: (terrain: TileTerrain[][], name = MOVEMENT_CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: terrain.map((row) => [...row]),
        description: MOVEMENT_CONSTANTS.game.defaultDescription,
        placedItems: [MOCK_ITEM1, MOCK_ITEM2, MOCK_RANDOM_ITEM1, MOCK_RANDOM_ITEM2],
        imageData: MOVEMENT_CONSTANTS.game.defaultImageData,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),
    createMapwithOffensiveAndDefensiveItems: (terrain: TileTerrain[][], name = MOVEMENT_CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: terrain.map((row) => [...row]),
        description: MOVEMENT_CONSTANTS.game.defaultDescription,
        placedItems: [MOCK_OFFENSIVE_ITEM, MOCK_DEFENSIVE_ITEM],
        imageData: MOVEMENT_CONSTANTS.game.defaultImageData,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),
    createGamewithItems: (map: Map, options: Partial<Game>): Game => ({
        map,
        winner: '',
        mode: GameMode.Normal,
        currentPlayer: 'Player1',
        isCurrentPlayerDead: false,
        removedSpecialItems: [],
        hasPendingAction: false,
        hasSlipped: false,
        status: GameStatus.Waiting,
        stats: undefined,
        virtualState: MOCK_VIRTUAL_PLAYER_STATE,
        isDebugMode: false,
        timer: MOCK_TIMER,
        isTurnChange: false,
        ...options,
    }),
    createGamewithRandomItems: (map: Map, options: Partial<Game>): Game => ({
        map,
        winner: '',
        mode: GameMode.Normal,
        currentPlayer: 'Player1',
        isCurrentPlayerDead: false,
        removedSpecialItems: [],
        hasPendingAction: false,
        hasSlipped: false,
        status: GameStatus.Waiting,
        stats: undefined,
        virtualState: MOCK_VIRTUAL_PLAYER_STATE,
        isDebugMode: false,
        timer: MOCK_TIMER,
        isTurnChange: false,
        ...options,
    }),
};

export const MOCK_NEW_PLAYER_INVENTORY_EXCESS: Player = {
    playerInfo: {
        id: '',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Organizer,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 4,
            speed: 4,
            attack: 4,
            defense: 4,
        },
        attributes: {
            hp: 0,
            speed: 1,
            attack: 0,
            defense: 0,
        },
        inventory: [ItemType.BismuthShield, ItemType.GlassStone, ItemType.QuartzSkates],
        currentPosition: { x: 0, y: 0 },
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 0,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_MAP_ITEMS = {
    mapWithItems: mockFactoriesItem.createMapwithItems(TERRAIN_PATTERNS.allGrass),
    mapWithDefensiveAndOffensiveItems: mockFactoriesItem.createMapwithOffensiveAndDefensiveItems(TERRAIN_PATTERNS.allGrass),
};

export const MOCK_MAP_RANDOM_ITEMS = {
    mapWithItems: mockFactoriesItem.createMapwithRandomItems(TERRAIN_PATTERNS.allGrass),
};

export const MOCK_GAMES_ITEMS = {
    gameWithItems: mockFactoriesItem.createGamewithItems(MOCK_MAP_ITEMS.mapWithItems, { currentPlayer: 'Player1' }),
    gameWithOffensiveAndDefensiveItems: mockFactoriesItem.createGamewithItems(MOCK_MAP_ITEMS.mapWithDefensiveAndOffensiveItems, {
        currentPlayer: 'Player1',
    }),
};

export const MOCK_GAMES_RANDOM_ITEMS = {
    gameWithItems: mockFactoriesItem.createGamewithRandomItems(MOCK_MAP_ITEMS.mapWithItems, { currentPlayer: 'Player1' }),
};

export const MOCK_ROOM_ITEMS: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_GAMES_ITEMS.gameWithItems,
};

export const MOCK_ROOM_ITEMS_EXCESS: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_NEW_PLAYER_INVENTORY_EXCESS, MOCK_NEW_PLAYER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_GAMES_ITEMS.gameWithItems,
};

export const MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_GAMES_ITEMS.gameWithOffensiveAndDefensiveItems,
};

export const MOCK_AFFECTED_OBJECTS: BombAffectedObjects = {
    players: [MOCK_NEW_PLAYER_ORGANIZER],
    blownupTiles: [{ x: 0, y: 0 }],
};
