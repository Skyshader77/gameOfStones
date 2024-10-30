import { Player } from '@app/interfaces/player';
import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '../room-manager/room-manager.service';

@Injectable()
export class PlayerAbandonService {
    constructor(
        private roomManagerService: RoomManagerService,
    ) {}
    processPlayerAbandonment(roomCode:string,playerName:string):boolean{
        let room=this.roomManagerService.getRoom(roomCode);
        const index = room.players.findIndex((player: Player) => player.playerInfo.userName === playerName);
        if (index>=0){
            room.players[index].playerInGame.hasAbandonned=true;
            return true;
        }
        return false;
    }
}
