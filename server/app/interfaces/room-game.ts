import { Room } from '@app/model/database/room';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Player } from '@common/interfaces/player';
import { Game } from './gameplay';

export interface RoomGame {
    room: Room;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalLog[];
    game: Game;
}
