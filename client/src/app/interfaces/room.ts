import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Game } from './game-play';
import { Player } from './player';
export interface Room {
    roomCode: string;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalLog[];
    isLocked: boolean;
    game: Game;
}
