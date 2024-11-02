import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { AttackResult, Fight } from '@common/interfaces/fight';
import { SocketService } from '../communication-services/socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { Observable, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FightManagerService {
  fight: Fight;
  attackerName: string;
  defenderName: string;
  attackResult: AttackResult;
  hasEvaded: boolean;

  constructor(
    private socketService: SocketService
  ) { }

  initializeFightService(fightOrder: string[]) {
    this.attackerName = fightOrder[0];
    this.defenderName = fightOrder[1];
    this.fight.numbEvasionsLeft = [2, 2];
  }

  listenToAttackResult(): Subscription {
    return this.socketService.on<AttackResult>(Gateway.GAME, GameEvents.FighterAttack).subscribe(
      (attackResult) => { this.attackResult = attackResult }
    )
  }

  listenToEvadeResult(): Subscription {
    return this.socketService.on<boolean>(Gateway.GAME, GameEvents.FighterEvade).subscribe(
      (hasEvaded) => {
        if (this.hasEvaded) {
          //TO DO: SEND SOMETHING TO THE COMPONENT TO TELL THE PLAYERS THAT ONE OF THEM HAS DODGED AN ATTACK.
        } else {
          const defenderIndex = this.fight.fighters.findIndex((player) => (player.playerInfo.userName === this.attackerName));
          this.fight.numbEvasionsLeft[defenderIndex]--;
        }
      }
    )
  }

  listenToFightEnd(): Observable<string> {
    //TO DO: SEND SOMETHING TO THE COMPONENT TO TELL IT TO CLOSE.
    return this.socketService.on<string>(Gateway.GAME, GameEvents.FightEnd);
  }

  listenToNextFightingPlayerTurn(): Subscription {
    return this.socketService.on<string>(Gateway.GAME, GameEvents.StartFightTurn).subscribe(
      (attackerName) => {
        this.attackerName = attackerName
        const defender = this.fight.fighters.find((player) => (player.playerInfo.userName !== attackerName));
        if (defender) {
          this.defenderName = defender.playerInfo.userName;
        }
      }
    )
  }
}
