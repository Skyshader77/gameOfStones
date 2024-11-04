import { Room } from '@app/model/database/room';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Game } from './gameplay';
import { Player } from '@app/interfaces/player';

export interface RoomGame {
    room: Room;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalLog[];
    game: Game;
}
