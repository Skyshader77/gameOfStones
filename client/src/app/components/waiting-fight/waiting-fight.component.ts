import { Component, inject } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { Avatar } from '@common/enums/avatar.enum';

@Component({
    selector: 'app-waiting-fight',
    standalone: true,
    imports: [],
    templateUrl: './waiting-fight.component.html',
})
export class WaitingFightComponent {
    private avatarSrc: Record<Avatar, string> = AVATAR_PROFILE;

    private fightService = inject(FightStateService);

    get fighters(): { playerInfo: { userName: string; avatar: Avatar } }[] {
        return this.fightService.currentFight?.fighters ?? [];
    }

    get fighterNames(): { player1: string; player2: string } {
        return {
            player1: this.fighters[0]?.playerInfo?.userName,
            player2: this.fighters[1]?.playerInfo?.userName,
        };
    }

    get fighterAvatars(): { player1: string; player2: string } {
        return {
            player1: this.avatarSrc[this.fighters[0]?.playerInfo?.avatar],
            player2: this.avatarSrc[this.fighters[1]?.playerInfo?.avatar],
        };
    }
}
