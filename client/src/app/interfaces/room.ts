import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Game } from './gameplay';
import { Player } from './player';
export interface Room {
    roomCode: string;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalLog[];
    isLocked: boolean;
    game: Game;
}
