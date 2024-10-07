import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ChatMessageDisplayComponent } from '@app/components/chat/chat-message-display/chat-message-display.component';
import { ChatInputBoxComponent } from '@app/components/chat/chat-input-box/chat-input-box.component';
import { ChatClientService } from '@app/services/chat-service/chat-client.service';
import { JournalEntryDisplayComponent } from '@app/components/journal/journal-entry-display/journal-entry-display.component';
import { JournalEntry, EntryType } from '@app/interfaces/journal-entry';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [ChatMessageDisplayComponent, ChatInputBoxComponent, JournalEntryDisplayComponent, NgIf],
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {
    inLobby: boolean = true;
    displayChat: boolean = true;

    chatInput = '';
    broadcastMessage = '';
    serverMessages: string[] = [];

    roomMessage = '';
    roomMessages: string[] = [];

    journalEntries: JournalEntry[] = [
        {
            date: new Date(),
            type: EntryType.TURNSTART,
            message: 'Joueur X débute son tour.',
        },
        {
            date: new Date(),
            type: EntryType.COMBATSTART,
            message: 'Un combat entre joueur X et joueur Y commence',
        },
        {
            date: new Date(),
            type: EntryType.COMBATEND,
            message: 'Le combat entre joueur X et joueur Y est terminé',
        },
        {
            date: new Date(),
            type: EntryType.COMBATRESULT,
            message: 'Joueur X a vaincu joueur Y',
        },
        {
            date: new Date(),
            type: EntryType.DOOROPEN,
            message: 'Joueur X a ouvert une porte.',
        },
        {
            date: new Date(),
            type: EntryType.DOORCLOSE,
            message: 'Joueur X a fermé une porte.',
        },
        {
            date: new Date(),
            type: EntryType.PLAYERABANDON,
            message: 'Joueur z a abandonné le jeu.',
        },
        {
            date: new Date(),
            type: EntryType.GAMEEND,
            message: 'Fin de la partie.',
        },
    ];

    constructor(public socketService: ChatClientService) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    toggleDisplay() {
        this.displayChat = !this.displayChat;
    }

    toggleInLobby() {
        this.inLobby = !this.inLobby;
    }

    ngOnInit(): void {
        this.connect();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    configureBaseSocketFeatures() {
        // can be used for testing
        // this.socketService.on('connect', () => {
        //     console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
        // });

        this.socketService.on('massMessage', (broadcastMessage: string) => {
            // can be used for testing
            // console.log(broadcastMessage);
            // console.log(`${this.socketService.socket.id}`);
            this.serverMessages.push(broadcastMessage);
        });

        this.socketService.on('roomMessage', (roomMessage: string) => {
            this.roomMessages.push(roomMessage);
        });
    }

    broadcastMessageToAll() {
        this.socketService.send('broadcastAll', this.broadcastMessage);
        this.broadcastMessage = '';
    }

    joinRoom() {
        this.socketService.send('joinRoom');
    }

    sendToRoom(roomMessage: string) {
        this.socketService.send('roomMessage', roomMessage);
    }
}
