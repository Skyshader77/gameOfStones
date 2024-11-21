import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';

export function isPlayerHuman(player: Player): boolean {
    return [PlayerRole.Human, PlayerRole.Organizer].includes(player.playerInfo.role);
}
