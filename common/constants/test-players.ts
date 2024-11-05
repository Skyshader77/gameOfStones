import { ATTACK_DICE } from '../interfaces/dice';
import { PlayerInGame } from '../interfaces/player';

export const MOCK_PLAYER_IN_GAME: PlayerInGame = {
    attributes: {
        hp: 4,
        speed: 6,
        attack: 4,
        defense: 4,
    },
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

export const MOCK_PLAYER_IN_GAME_TWO: PlayerInGame = {
    attributes: {
        hp: 4,
        speed: 6,
        attack: 4,
        defense: 4,
    },
    dice: ATTACK_DICE,
    inventory: [],
    currentPosition: { x: 1, y: 1 },
    startPosition: { x: 0, y: 0 },
    winCount: 0,
    hasAbandoned: false,
    remainingMovement: 6,
    remainingHp: 4,
    remainingActions: 1,
};

export const MOCK_PLAYER_IN_GAME_ABANDONNED: PlayerInGame = {
    attributes: {
        hp: 4,
        speed: 6,
        attack: 4,
        defense: 4,
    },
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

