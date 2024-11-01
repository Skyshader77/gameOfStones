import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { D6_ATTACK_FIELDS, PlayerRole } from '@common/constants/player.constants';
import { MAXIMUM_NUMBER_OF_VICTORIES } from './gameplay.constants';
import { CONSTANTS, MOCK_ROOM_GAMES } from './player.movement.test.constants';
import { MOCK_ROOM } from './test.constants';

const createMockPlayerForEndGame = (id: string, userName: string, role: PlayerRole, hasAbandonned: boolean, numbVictories: number): Player => ({
    playerInfo: {
        id,
        userName,
        role,
    },
    statistics: {
        isWinner: false,
        numbVictories,
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
        movementSpeed: CONSTANTS.game.defaultMaxDisplacement,
        dice: D6_ATTACK_FIELDS,
        attack: 0,
        defense: 0,
        inventory: [],
        currentPosition: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 },
        hasAbandonned,
        isCurrentPlayer: false,
        remainingMovement: CONSTANTS.game.defaultMaxDisplacement,
    },
});

export const MOCK_WINS = [2, MAXIMUM_NUMBER_OF_VICTORIES, 1];

export const MOCK_ROOM_MULTIPLE_PLAYERS_WINNER: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.HUMAN, false, 2),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.HUMAN, false, MAXIMUM_NUMBER_OF_VICTORIES),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.HUMAN, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};

export const MOCK_ROOM_MULTIPLE_PLAYERS_WINNER_BY_DEFAULT: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.HUMAN, true, 0),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.HUMAN, true, 0),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.HUMAN, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};

export const MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING: RoomGame = {
    players: [
        createMockPlayerForEndGame('1', 'Player1', PlayerRole.HUMAN, false, 0),
        createMockPlayerForEndGame('2', 'Player2', PlayerRole.HUMAN, false, 0),
        createMockPlayerForEndGame('3', 'Player3', PlayerRole.HUMAN, false, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    game: MOCK_ROOM_GAMES.multiplePlayers.game,
};
