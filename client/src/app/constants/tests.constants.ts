import { Game } from '@app/interfaces/game-play';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Player, PlayerInfo, PlayerInGame } from '@app/interfaces/player';
import { Room } from '@app/interfaces/room';
import { Statistic } from '@app/interfaces/stats';
import { ValidationResult } from '@app/interfaces/validation';
import { D6_ATTACK_FIELDS, PlayerRole, AvatarChoice } from '@common/constants/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { DEFAULT_INITIAL_STAT, INITIAL_OFFSET, INITIAL_POSITION, MAX_INITIAL_STAT, SpriteSheetChoice } from './player.constants';
import { MapSize } from '@common/enums/map-size.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap, Map } from '@common/interfaces/map';

export const MOCK_MAPS: Map[] = [
    {
        _id: 'Su27FLanker',
        name: 'Game of Drones',
        description: 'Test Map 1',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.BOOST3 },
            { position: { x: 1, y: 1 }, type: ItemType.BOOST2 },
        ],
        isVisible: false,
        imageData: '',
    },
    {
        _id: 'F35jsf',
        name: 'Engineers of War',
        description: 'Test Map 2',
        size: MapSize.MEDIUM,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1997 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
        placedItems: [],
        isVisible: true,
        imageData: '',
    },
    {
        _id: 'NabMap',
        name: 'Game of Thrones',
        description: 'Test Map 2.5',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1998 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.BOOST3 },
            { position: { x: 0, y: 1 }, type: ItemType.BOOST6 },
            { position: { x: 1, y: 1 }, type: ItemType.BOOST4 },
        ],
        isVisible: true,
        imageData: '',
    },
];

export const MOCK_PLAYER_FORM_DATA_HP_ATTACK = { name: 'player_name', avatarId: 2, statsBonus: Statistic.HP, dice6: Statistic.ATTACK };
export const MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE = { name: 'player_name', avatarId: 2, statsBonus: Statistic.SPEED, dice6: Statistic.DEFENSE };

// export const MOCK_IN_GAME_PLAYER: PlayerInGame = {
//     hp: 4,
//     isCurrentPlayer: false,
//     isFighting: false,
//     movementSpeed: 4,
//     remainingSpeed: 4,
//     dice: D6_ATTACK_FIELDS,
//     attack: 4,
//     defense: 4,
//     inventory: [],
//     renderInfo: { spriteSheet: SpriteSheetChoice.SPRITE0, offset: { x: 0, y: 0 } },
//     currentPosition: { x: 0, y: 0 },
//     startPosition: { x: 0, y: 0 },
//     hasAbandonned: false,
// };

export const MOCK_PLAYER_INFO: PlayerInfo[] = [
    { id: '1', userName: 'Player 1', avatar: AvatarChoice.AVATAR0, role: PlayerRole.ORGANIZER },
    { id: '2', userName: 'Player 2', avatar: AvatarChoice.AVATAR1, role: PlayerRole.AGGRESSIVEAI },
    { id: '3', userName: 'Player 3', avatar: AvatarChoice.AVATAR2, role: PlayerRole.HUMAN },
];

export const MOCK_ROOM: Room = {
    roomCode: '5721',
    players: [],
    chatList: [],
    journal: [],
    isLocked: false,
    game: new Game(),
};

export const MOCK_NEW_MAP: Map = {
    _id: 'Su27FLanker',
    name: 'NewMapTest',
    description: 'Test Map',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
    placedItems: [],
    isVisible: false,
    dateOfLastModification: new Date(),
    imageData: '',
};

export const MOCK_MAP_WALLS_ONLY: CreationMap = {
    name: 'Mock Map Walls Only',
    description: 'Mock Map Walls Only',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.WALL)),
    placedItems: [],
    imageData: '',
};

export const MOCK_TOP_ROW_INDEX = 0;
export const MOCK_LEFTMOST_COL_INDEX = 0;
export const MOCK_BOTTOM_ROW_INDEX = 9;
export const MOCK_RIGHTMOST_COL_INDEX = 9;
export const MOCK_POSITION = { x: 0, y: 0 };
export const MOCK_WALL_ROW_1 = 4;
export const MOCK_WALL_ROW_2 = 6;
export const MOCK_DOOR_ROW = 5;
export const MOCK_COL = 3;

export const MOCK_FAIL_VALIDATION_RESULT: ValidationResult = {
    validationStatus: {
        doorAndWallNumberValid: false,
        wholeMapAccessible: false,
        allStartPointsPlaced: false,
        doorSurroundingsValid: false,
        flagPlaced: false,
        allItemsPlaced: false,
        nameValid: false,
        descriptionValid: false,
        isMapValid: false,
    },
    message: 'La carte est invalide.',
};

export const MOCK_SUCCESS_VALIDATION_RESULT: ValidationResult = {
    validationStatus: {
        doorAndWallNumberValid: true,
        wholeMapAccessible: true,
        allStartPointsPlaced: true,
        doorSurroundingsValid: true,
        flagPlaced: true,
        allItemsPlaced: true,
        nameValid: true,
        descriptionValid: true,
        isMapValid: true,
    },
    message: 'La carte est valide.',
};

export const MOCK_CLICK_POSITION_0: Vec2 = { x: 0, y: 0 };
export const MOCK_CLICK_POSITION_1: Vec2 = { x: 1, y: 1 };
export const MOCK_CLICK_POSITION_2: Vec2 = { x: 2, y: 2 };
export const MOCK_CLICK_POSITION_3: Vec2 = { x: 3, y: 3 };
export const MOCK_CLICK_POSITION_4: Vec2 = { x: 4, y: 4 };
export const MOCK_CLICK_POSITION_5: Vec2 = { x: 3, y: 2 };

export const MOCK_SMALL_MAP_SIZE = 10;
export const MOCK_CTF_GAME_MODE = 1;

export const MOCK_ADDED_BOOST_1: ItemType = ItemType.BOOST1;
export const MOCK_ADDED_RANDOM_ITEM: ItemType = ItemType.RANDOM;
export const COL_INCREMENT_LIMIT_1 = 1;
export const COL_INCREMENT_LIMIT_2 = 3;
export const COL_INCREMENT_LIMIT_3 = 5;

export const MAX_WALL_ROW_INDEX = 3;
export const MAX_DOOR_ROW_INDEX = 6;

export const ADDED_ITEM_POSITION_1: Vec2 = { x: 5, y: 5 };
export const ADDED_ITEM_POSITION_2: Vec2 = { x: 7, y: 7 };
export const ADDED_ITEM_POSITION_3: Vec2 = { x: 3, y: 3 };
export const ADDED_ITEM_POSITION_4: Vec2 = { x: 2, y: 2 };
export const ADDED_ITEM_POSITION_5: Vec2 = { x: 4, y: 4 };
export const ADDED_ITEM_POSITION_6: Vec2 = { x: 8, y: 8 };
export const ADDED_ITEM_POSITION_7: Vec2 = { x: 6, y: 6 };

export const MOCK_MODAL_MESSAGE: ModalMessage = { title: 'Title', content: 'Message' };

export const MOCK_IN_GAME_PLAYER: PlayerInGame = {
    hp: MAX_INITIAL_STAT,
    movementSpeed: DEFAULT_INITIAL_STAT,
    isCurrentPlayer: false,
    isFighting: false,
    dice: D6_ATTACK_FIELDS,
    attack: DEFAULT_INITIAL_STAT,
    defense: DEFAULT_INITIAL_STAT,
    inventory: [],
    currentPosition: INITIAL_POSITION,
    renderInfo: {
        spriteSheet: SpriteSheetChoice.FemaleHealer,
        currentSprite: 0,
        offset: INITIAL_OFFSET,
    },
    hasAbandonned: false,
    startPosition: { x: 0, y: 0 },
    remainingMovement: DEFAULT_INITIAL_STAT,
};
export const MOCK_PLAYERS: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        playerInGame: MOCK_IN_GAME_PLAYER,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        playerInGame: MOCK_IN_GAME_PLAYER,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[2],
        playerInGame: MOCK_IN_GAME_PLAYER,
    },
];

export const MOCK_INVALID_ROOM_CODE = '';
export const MOCK_SOCKET_EVENT = 'mockEvent';
export const MOCK_SOCKET_GENERIC_DATA = { message: 'test' };

export const AVATAR_LIST_LENGTH = 12;
