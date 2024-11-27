import { Map } from '@common/interfaces/map';
import { Avatar } from '@common/enums/avatar.enum'
import { PlayerSocketIndices } from './player-socket-indices';
import { Player } from './player';

export interface RoomCreationPayload {
    roomCode: string,
    map: Map,
    avatar: Avatar,
}

export interface RoomJoinPayload {
    roomCode: string,
    playerSocketIndices: PlayerSocketIndices,
    player: Player,
}
