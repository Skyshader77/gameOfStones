import { Room } from '@app/model/database/room';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Game } from './gameplay';
import { Player } from '@common/interfaces/player';

export interface RoomGame {
    room: Room;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalLog[];
    game: Game;
}
