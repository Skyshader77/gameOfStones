import { MapMouseEvent, MapMouseEventButton } from '@app/interfaces/map-mouse-event';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Player, PlayerRenderInfo } from '@app/interfaces/player';
import { PlayerAttributeType } from '@app/interfaces/stats';
import { ValidationResult } from '@app/interfaces/validation';
import { MOCK_PLAYER_IN_GAME, MOCK_PLAYER_IN_GAME_ABANDONNED } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { DiceType } from '@common/enums/dice.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { AttackResult, Fight, FightResult } from '@common/interfaces/fight';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { CreationMap, Map, TileInfo } from '@common/interfaces/map';
import { JournalLog, Message } from '@common/interfaces/message';
import { Direction, ReachableTile } from '@common/interfaces/move';
import { PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { Room } from '@common/interfaces/room';
import { Vec2 } from '@common/interfaces/vec2';
import { of } from 'rxjs';
import { INITIAL_OFFSET } from './player.constants';
import { Item } from '@common/interfaces/item';

export const MOCK_MAPS: Map[] = [
    {
        _id: 'Su27FLanker',
        name: 'Game of Drones',
        description: 'Test Map 1',
        size: MapSize.Small,
        mode: GameMode.Normal,
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
        ],
        isVisible: false,
        imageData: '',
    },
    {
        _id: 'F35jsf',
        name: 'Engineers of War',
        description: 'Test Map 2',
        size: MapSize.Medium,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1997 03:24:00'),
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [],
        isVisible: true,
        imageData: '',
    },
    {
        _id: 'NabMap',
        name: 'Game of Thrones',
        description: 'Test Map 2.5',
        size: MapSize.Small,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1998 03:24:00'),
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.QuartzSkates },
            { position: { x: 0, y: 1 }, type: ItemType.GraniteHammer },
            { position: { x: 1, y: 1 }, type: ItemType.SapphireFins },
        ],
        isVisible: true,
        imageData: '',
    },
];

export const MOCK_PLAYER_FORM_DATA_HP_ATTACK = {
    name: 'player_name',
    avatarId: 2,
    statsBonus: PlayerAttributeType.Hp,
    dice6: PlayerAttributeType.Attack,
};

export const MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE = {
    name: 'player_name',
    avatarId: 2,
    statsBonus: PlayerAttributeType.Speed,
    dice6: PlayerAttributeType.Defense,
};

export const MOCK_PLAYER_INFO: PlayerInfo[] = [
    { id: '1', userName: 'Player 1', avatar: Avatar.FemaleHealer, role: PlayerRole.Organizer },
    { id: '2', userName: 'Player 2', avatar: Avatar.MaleHealer, role: PlayerRole.AggressiveAI },
    { id: '3', userName: 'Player 3', avatar: Avatar.FemaleMage, role: PlayerRole.Human },
];

export const MOCK_ROOM: Room = {
    roomCode: '5721',
    isLocked: false,
};

export const MOCK_NEW_MAP: Map = {
    _id: 'Su27FLanker',
    name: 'NewMapTest',
    description: 'Test Map',
    size: MapSize.Small,
    mode: GameMode.Normal,
    mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
    placedItems: [],
    isVisible: false,
    dateOfLastModification: new Date(),
    imageData: '',
};

export const MOCK_MAP_WALLS_ONLY: CreationMap = {
    name: 'Mock Map Walls Only',
    description: 'Mock Map Walls Only',
    size: MapSize.Small,
    mode: GameMode.Normal,
    mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Wall)),
    placedItems: [],
    imageData: '',
};

export const MOCK_GOD_NAME = 'Othmane';

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

export const MOCK_ADDED_BOOST_1: ItemType = ItemType.BismuthShield;
export const MOCK_ADDED_RANDOM_ITEM: ItemType = ItemType.Random;
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
export const MOCK_MESSAGE: Message = { content: 'Test message', time: new Date() };
export const MOCK_JOURNAL_LOG: JournalLog = { message: MOCK_MESSAGE, entry: JournalEntry.TurnStart, players: [MOCK_GOD_NAME] };

export const MOCK_PLAYER_RENDER_INFO: PlayerRenderInfo = {
    currentSprite: 0,
    currentStep: 1,
    offset: INITIAL_OFFSET,
};

export const MOCK_PLAYERS: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        playerInGame: JSON.parse(JSON.stringify(MOCK_PLAYER_IN_GAME)) as PlayerInGame,
        renderInfo: MOCK_PLAYER_RENDER_INFO,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        playerInGame: JSON.parse(JSON.stringify(MOCK_PLAYER_IN_GAME)) as PlayerInGame,
        renderInfo: MOCK_PLAYER_RENDER_INFO,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[2],
        playerInGame: JSON.parse(JSON.stringify(MOCK_PLAYER_IN_GAME)) as PlayerInGame,
        renderInfo: MOCK_PLAYER_RENDER_INFO,
    },
];

export const MOCK_VALID_ROOM_CODE = '1234';
export const MOCK_INVALID_ROOM_CODE = '';
export const MOCK_SOCKET_EVENT = 'mockEvent';
export const MOCK_SOCKET_GENERIC_DATA = { message: 'test' };

export const AVATAR_LIST_LENGTH = 12;

export const MOCK_ACTIVATED_ROUTE = {
    params: of({}),
    queryParams: of({}),
};

export const MOCK_PLAYER_STARTS: PlayerStartPosition[] = [
    {
        userName: 'player1',
        startPosition: { x: 0, y: 0 },
    },
    {
        userName: 'player2',
        startPosition: { x: 5, y: 5 },
    },
];

export const MOCK_ITEM: Item = {
    position: ADDED_ITEM_POSITION_1,
    type: ItemType.BismuthShield,
};

export const MOCK_REACHABLE_TILE: ReachableTile = {
    position: { x: 0, y: 0 },
    remainingMovement: 0,
    cost: 0,
    path: [
        { direction: Direction.DOWN, remainingMovement: 1 },
        { direction: Direction.DOWN, remainingMovement: 0 },
    ],
};

export const MOCK_TILE_DIMENSION = 10;
export const MOCK_RENDER_POSITION: Vec2 = { x: 0, y: 0 };
export const MOCK_RASTER_POSITION: Vec2 = { x: 1, y: 1 };
export const MOCK_GAME_MAP_CLICK_POSITION: Vec2 = { x: 100, y: 100 };
export const MOCK_LEFT_MOUSE_EVENT: MapMouseEvent = { tilePosition: MOCK_CLICK_POSITION_0, button: MapMouseEventButton.Left };
export const MOCK_RIGHT_MOUSE_EVENT: MapMouseEvent = { tilePosition: MOCK_CLICK_POSITION_0, button: MapMouseEventButton.Right };
export const MOCK_TILE_INFO: TileInfo = { tileTerrainName: 'grass', cost: 0 };
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
export const MOCK_DICE = [DiceType.Six, DiceType.Four];

export const MOCK_ATTACK_RESULT: AttackResult = {
    hasDealtDamage: true,
    wasWinningBlow: false,
    attackRoll: 5,
    defenseRoll: 3,
};

export const MOCK_FIGHT_RESULT: FightResult = {
    respawnPosition: { x: 0, y: 0 },
    winner: 'Player 1',
    loser: 'Player 2',
};

export const MOCK_WINNING_ATTACK_RESULT: AttackResult = {
    hasDealtDamage: true,
    wasWinningBlow: true,
    attackRoll: 10,
    defenseRoll: 3,
};

export const MOCK_FIGHT: Fight = {
    fighters: [MOCK_PLAYERS[0], MOCK_PLAYERS[1]],
    result: MOCK_FIGHT_RESULT,
    isFinished: true,
    numbEvasionsLeft: [1, 1],
    currentFighter: 1,
};

export const MOCK_ABANDONNED_PLAYER_LIST: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        playerInGame: JSON.parse(JSON.stringify(MOCK_PLAYER_IN_GAME_ABANDONNED)) as PlayerInGame,
        renderInfo: MOCK_PLAYER_RENDER_INFO,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        playerInGame: JSON.parse(JSON.stringify(MOCK_PLAYER_IN_GAME)) as PlayerInGame,
        renderInfo: MOCK_PLAYER_RENDER_INFO,
    },
];
