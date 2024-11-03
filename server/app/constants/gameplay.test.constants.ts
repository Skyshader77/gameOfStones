import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { MAXIMUM_NUMBER_OF_VICTORIES } from './gameplay.constants';
import { MOCK_ROOM } from './test.constants';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MOCK_ROOM_GAMES } from './player.movement.test.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';

const createMockPlayerForEndGame = (id: string, userName: string, role: PlayerRole, hasAbandoned: boolean, numbVictories: number): Player => ({
    playerInfo: {
        id,
        avatar: Avatar.MaleNinja,
        userName,
        role,
    },
    statistics: {
        isWinner: false,
        numbDefeats: 0,
        numbEscapes: 0,
        numbBattles: 0,
        totalHpLost: 0,
        totalDamageGiven: 0,
        numbPickedUpItems: 0,
        percentageMapVisited: 0,
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
