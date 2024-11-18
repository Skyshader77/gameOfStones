import { AiState } from '@app/interfaces/ai-action';
import { Player } from '@common/interfaces/player';
import { Inject, Injectable } from '@nestjs/common';
import { PlayerMovementService } from '../player-movement/player-movement.service';

@Injectable()
export class VirtualPlayerLogicService {
    private virtualPlayerStates: Map<string, AiState>; //String is the virtual playerName
    @Inject() private playerMovementService: PlayerMovementService;

    startVirtualPlayerTurn(virtualPlayer: Player) {
        //TODO: will probably need a while loop to use manageTurnAIPlayer within it.
        // while(){
        //     manageActionsAIPlayer
        // }
    }
}
