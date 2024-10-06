import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common'; 

@Component({
  selector: 'app-chat-input-box',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './chat-input-box.component.html',
})
export class ChatInputBoxComponent {
  @Output() sendMessage = new EventEmitter<string>();
  roomMessage: string = "";

  sendToRoom() {
    if (this.isValidMessage(this.roomMessage)) {
      this.sendMessage.emit(this.roomMessage);
      this.roomMessage = "";
    } else {
      console.log('Message must be between 1 and 200 characters.');
    }
  }

  isValidMessage(message: string): boolean {
    return message.length >= 1 && message.length <= 200;
  }
}
