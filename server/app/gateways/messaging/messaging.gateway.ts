import { RoomGame } from '@app/interfaces/room-game';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { JournalManagerService } from '@app/services/journal-manager/journal-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { MAX_CHAT_MESSAGE_LENGTH } from '@common/constants/chat.constants';
import { Gateway } from '@common/constants/gateway.constants';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { MessagingEvents } from '@common/enums/sockets.events/messaging.events';
import { AttackResult } from '@common/interfaces/fight';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: `/${Gateway.MESSAGING}`, cors: true })
@Injectable()
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
        private journalManagerService: JournalManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.MESSAGING, this.server);
    }

    @SubscribeMessage(MessagingEvents.DesiredChatMessage)
    desiredChatMessage(socket: Socket, message: ChatMessage) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        if (roomCode && message.message.content.length <= MAX_CHAT_MESSAGE_LENGTH) {
            this.sendChatMessage(message, roomCode);
        }
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
    }

    sendChatMessage(message: ChatMessage, roomCode: string) {
        this.chatManagerService.addChatMessageToRoom(message, roomCode);
        this.server.to(roomCode).emit(MessagingEvents.ChatMessage, message);
    }

    sendChatHistory(socket: Socket, roomCode: string) {
        const olderMessages = this.chatManagerService.fetchOlderMessages(roomCode);
        if (olderMessages && olderMessages.length > 0) {
            socket.emit(MessagingEvents.ChatHistory, olderMessages);
        }
    }

    sendPublicJournal(room: RoomGame, journalType: JournalEntry) {
        const journal: JournalLog = this.journalManagerService.generateJournal(journalType, room);
        if (!journal) return;
        this.journalManagerService.addJournalToRoom(journal, room.room.roomCode);
        this.server.to(room.room.roomCode).emit(MessagingEvents.JournalLog, journal);
    }

    sendPrivateJournal(room: RoomGame, playerNames: string[], journalType: JournalEntry) {
        const journal: JournalLog = this.journalManagerService.generateJournal(journalType, room);
        if (!journal) return;
        this.journalManagerService.addJournalToRoom(journal, room.room.roomCode);
        playerNames.forEach((playerName: string) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, playerName, Gateway.MESSAGING);
            if (socket) {
                socket.emit(MessagingEvents.JournalLog, journal);
            }
        });
    }

    sendAttackResultJournal(room: RoomGame, attackResult: AttackResult) {
        const journal = this.journalManagerService.fightAttackResultJournal(room, attackResult);
        this.journalManagerService.addJournalToRoom(journal, room.room.roomCode);
        room.game.fight.fighters.forEach((fighter: Player) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.MESSAGING);
            if (socket) {
                socket.emit(MessagingEvents.JournalLog, journal);
            }
        });
    }

    sendEvasionResultJournal(room: RoomGame, evasionSuccessful: boolean) {
        const journal = this.journalManagerService.fightEvadeResultJournal(room, evasionSuccessful);
        this.journalManagerService.addJournalToRoom(journal, room.room.roomCode);
        room.game.fight.fighters.forEach((fighter: Player) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.MESSAGING);
            if (socket) {
                socket.emit(MessagingEvents.JournalLog, journal);
            }
        });
    }

    sendAbandonJournal(room: RoomGame, deserterName: string) {
        const journal = this.journalManagerService.abandonJournal(deserterName);
        this.journalManagerService.addJournalToRoom(journal, room.room.roomCode);
        this.server.to(room.room.roomCode).emit(MessagingEvents.JournalLog, journal);
    }
}
