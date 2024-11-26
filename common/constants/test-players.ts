import { ATTACK_DICE } from '../interfaces/dice';
import { PlayerAttributes, PlayerInGame } from '../interfaces/player';

export const MOCK_FAST_BASE_ATTRIBUTES: PlayerAttributes = {
    hp: 4,
    speed: 6,
    attack: 4,
    defense: 4,
}

export const MOCK_TANK_BASE_ATTRIBUTES: PlayerAttributes = {
    hp: 6,
    speed: 4,
    attack: 4,
    defense: 4,
}

export const MOCK_PLAYER_IN_GAME: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_ICE: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 1, y: 0 },
    startPosition: { x: 0, y: 0 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_TWO: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 1, y: 1 },
    startPosition: { x: 2, y: 2 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_ABANDONNED: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    winCount: 0,
    hasAbandoned: true,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_ONE_CONFLICT_POSITION: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 1, y: 1 },
    startPosition: { x: 2, y: 2 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_TWO_CONFLICT_POSITION: PlayerInGame = {
    baseAttributes: MOCK_FAST_BASE_ATTRIBUTES,
    attributes: MOCK_FAST_BASE_ATTRIBUTES,
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 2, y: 2 },
    startPosition: { x: 1, y: 1 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

