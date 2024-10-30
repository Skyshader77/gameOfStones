import { Injectable } from '@nestjs/common';
import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';
import { RoomGame } from '@app/interfaces/room-game';

@Injectable()
export class PlayerNameService {
    setPlayerName(name: string, room: RoomGame): string {
        let count = INITIAL_NAME_EXTENSION;
        while (room?.players.some((existingPlayer) => existingPlayer.playerInfo.userName === name)) {
            name = `${name}-${count}`;
            count++;
        }
        return name;
    }
}
