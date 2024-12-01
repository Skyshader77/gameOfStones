import { Game } from '@app/interfaces/gameplay';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { Player } from '@common/interfaces/player';
import { MAXIMUM_NUMBER_OF_VICTORIES } from './gameplay.constants';
import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS, TERRAIN_PATTERNS } from './player.movement.test.constants';
import { MOCK_GAME_STATS } from './test-stats.constants';
import { MOCK_ROOM, MOCK_ROOM_LOCKED, MOCK_TIMER } from './test.constants';
import { MOCK_VIRTUAL_PLAYER_STATE } from './virtual-player-test.constants';

const createMockPlayerForEndGame = (id: string, userName: string, role: PlayerRole, hasAbandoned: boolean, numbVictories: number): Player => ({
    playerInfo: {
        id,
        avatar: Avatar.MaleNinja,
        userName,
        role,
    },
    playerInGame: {
        ...MOCK_PLAYER_IN_GAME,
        winCount: numbVictories,
        hasAbandoned,
    },
});

export const MOCK_WINS = [2, MAXIMUM_NUMBER_OF_VICTORIES, 1];

export const MOCK_ROOM_MULTIPLE_PLAYERS_WINNER: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.Human, false, 2),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.Human, false, MAXIMUM_NUMBER_OF_VICTORIES),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.Human, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};

export const MOCK_ROOM_ONE_PLAYER_LEFT: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.Human, true, 0),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.Human, true, 0),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.Human, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};

export const MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.Human, false, 0),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.Human, false, 0),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.Human, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};

const MOCK_START_ITEM_PLAYER1: Item = { position: { x: 0, y: 0 }, type: ItemType.Start };
const MOCK_START_ITEM_PLAYER2: Item = { position: { x: 1, y: 0 }, type: ItemType.Start };
const MOCK_START_ITEM_PLAYER3: Item = { position: { x: 2, y: 0 }, type: ItemType.Start };
const MOCK_START_ITEM_PLAYER4: Item = { position: { x: 3, y: 0 }, type: ItemType.Start };
const MOCK_START_ITEM_PLAYER5: Item = { position: { x: 4, y: 0 }, type: ItemType.Start };
const MOCK_START_ITEM_PLAYER6: Item = { position: { x: 5, y: 0 }, type: ItemType.Start };

const mockFactoriesStartPosition = {
    createMapwithStartPosition: (terrain: TileTerrain[][], name = MOVEMENT_CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.Large,
        mode: GameMode.Normal,
        mapArray: terrain.map((row) => [...row]),
        description: MOVEMENT_CONSTANTS.game.defaultDescription,
        placedItems: [
            MOCK_START_ITEM_PLAYER1,
            MOCK_START_ITEM_PLAYER2,
            MOCK_START_ITEM_PLAYER3,
            MOCK_START_ITEM_PLAYER4,
            MOCK_START_ITEM_PLAYER5,
            MOCK_START_ITEM_PLAYER6,
        ],
        imageData: MOVEMENT_CONSTANTS.game.defaultImageData,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),
    createGamewithStartPosition: (map: Map, options: Partial<Game>): Game => ({
        map,
        winner: '',
        mode: GameMode.Normal,
        currentPlayer: '0',
        hasPendingAction: false,
        status: GameStatus.Waiting,
        stats: MOCK_GAME_STATS,
        virtualState: MOCK_VIRTUAL_PLAYER_STATE,
        isDebugMode: false,
        timer: MOCK_TIMER,
        isTurnChange: false,
        ...options,
    }),
};

export const MOCK_MAP_ITEM = {
    startPosition: mockFactoriesStartPosition.createMapwithStartPosition(TERRAIN_PATTERNS.allGrass),
};

export const MOCK_GAMES_ITEM = {
    startPosition: mockFactoriesStartPosition.createGamewithStartPosition(MOCK_MAP_ITEM.startPosition, { currentPlayer: 'Player1' }),
};

export const MOCK_NEW_PLAYER_ORGANIZER: Player = {
    playerInfo: {
        id: '',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Organizer,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 1,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 1,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: { x: 0, y: 0 },
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 6,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_NEW_PLAYER_TWO: Player = {
    playerInfo: {
        id: '',
        userName: 'Player2',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 2,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 2,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: { x: 2, y: 0 },
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 6,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_NEW_PLAYER_THREE: Player = {
    playerInfo: {
        id: '',
        userName: 'Player3',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 3,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 3,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: undefined,
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 0,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_NEW_PLAYER_FOUR: Player = {
    playerInfo: {
        id: '',
        userName: 'Player4',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 4,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 4,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: undefined,
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 0,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_NEW_PLAYER_FIVE: Player = {
    playerInfo: {
        id: '',
        userName: 'Player5',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 5,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 5,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: undefined,
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 0,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_NEW_PLAYER_SIX: Player = {
    playerInfo: {
        id: '',
        userName: 'Player6',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    playerInGame: {
        dice: undefined,
        baseAttributes: {
            hp: 0,
            speed: 6,
            attack: 0,
            defense: 0,
        },
        attributes: {
            hp: 0,
            speed: 6,
            attack: 0,
            defense: 0,
        },
        inventory: [],
        currentPosition: undefined,
        startPosition: undefined,
        winCount: 0,
        remainingMovement: 0,
        remainingActions: 0,
        remainingHp: 0,
        hasAbandoned: false,
    },
};

export const MOCK_ROOM_START_POSITION: RoomGame = {
    room: MOCK_ROOM_LOCKED,
    players: [MOCK_NEW_PLAYER_ORGANIZER, MOCK_NEW_PLAYER_TWO, MOCK_NEW_PLAYER_THREE, MOCK_NEW_PLAYER_FOUR, MOCK_NEW_PLAYER_FIVE, MOCK_NEW_PLAYER_SIX],
    chatList: [],
    journal: [],
    game: MOCK_GAMES_ITEM.startPosition,
};

export const MOCK_PLAYER_STARTS_TESTS: PlayerStartPosition[] = [
    {
        userName: 'Player 1',
        startPosition: { x: 1, y: 1 },
    },
    {
        userName: 'Player 2',
        startPosition: { x: 6, y: 6 },
    },
];

export const MOCK_ROOM_ONE_PLAYER_LEFT_WITH_BOTS: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.AggressiveAI, false, 0),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.DefensiveAI, false, 0),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.Human, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};
