import { Room } from '@app/model/database/room';
import { ChatMessage, JournalMessage } from '@common/interfaces/message';
import { Game } from './gameplay';
import { Player } from './player';
export interface RoomGame {
    room: Room;
    players: Player[];
    chatList: ChatMessage[];
    journal: JournalMessage[];
    game: Game;
}
