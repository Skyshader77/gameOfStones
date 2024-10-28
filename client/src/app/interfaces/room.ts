import { ChatMessage, JournalMessage } from '@common/interfaces/message';
import { Game } from './game-play';
import { Player } from './player';
export interface Room {
    roomCode: string;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalMessage[];
    isLocked: boolean;
    game: Game;
}
