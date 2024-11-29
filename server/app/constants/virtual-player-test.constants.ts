import { ClosestObjectData, VirtualPlayerState, VirtualPlayerTurnData } from '@app/interfaces/ai-state';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { MOCK_ROOM_GAME } from './test.constants';
import { Subject } from 'rxjs';

export const MOCK_AGGRESSIVE_VIRTUAL_PLAYER: Player = {
    playerInfo: {
        id: 'id',
        userName: 'VP1',
        avatar: Avatar.MaleNinja,
        role: PlayerRole.AggressiveAI,
    },
    playerInGame: {
        ...MOCK_PLAYER_IN_GAME,
        currentPosition: { x: 1, y: 0 },
        startPosition: { x: 0, y: 0 },
    },
};

export const MOCK_CLOSEST_OBJECT_DATA: ClosestObjectData = {
    closestPlayer: {
        position: { x: 1, y: 1 },
        cost: 0,
    },
    closestItem: { position: { x: 2, y: 2 }, cost: 3 },
};

export const MOCK_VIRTUAL_PLAYER_STATE: VirtualPlayerState = {
    obstacle: null,
    isSeekingPlayers: false,
    hasSlipped: false,
    justWonFight: false,
    aiTurnSubject: new Subject(),
    aiTurnSubscription: null,
};

export const MOCK_TURN_DATA: VirtualPlayerTurnData = {
    closestObjectData: MOCK_CLOSEST_OBJECT_DATA,
    virtualPlayer: MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
    virtualPlayerState: MOCK_VIRTUAL_PLAYER_STATE,
    room: MOCK_ROOM_GAME,
};
