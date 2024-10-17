import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { RoomChatComponent } from '@app/components/chat/room-chat/room-chat.component';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';

@Component({
    selector: 'app-chat-page',
    standalone: true,
    imports: [FormsModule, NgFor, RoomChatComponent, GameChatComponent],
    templateUrl: './chat-page.component.html',
    styleUrls: [],
})
export class ChatPageComponent {}
