import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ChatComponent } from '@app/components/chat/chat/chat.component';

@Component({
    selector: 'app-chat-page',
    standalone: true,
    imports: [FormsModule, NgFor, ChatComponent],
    templateUrl: './chat-page.component.html',
    styleUrls: [],
})
export class ChatPageComponent {
    @ViewChild(ChatComponent) chatComponent!: ChatComponent;

    toggleLobby() {
        this.chatComponent.toggleInLobby(); // Call the toggle method
    }
}
