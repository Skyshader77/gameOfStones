import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MIN_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGE_LENGTH } from '@app/constants/validation.constants';

@Component({
    selector: 'app-chat-input-box',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './chat-input-box.component.html',
})
export class ChatInputBoxComponent {
    @Output() sendMessage = new EventEmitter<string>();

    roomMessage: string = '';

    sendToRoom() {
        if (this.isValidMessage(this.roomMessage)) {
            this.sendMessage.emit(this.roomMessage);
            this.roomMessage = '';
        }
    }

    isValidMessage(message: string): boolean {
        return message.length >= MIN_CHAT_MESSAGE_LENGTH && message.length <= MAX_CHAT_MESSAGE_LENGTH;
    }
}
