import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-chat-message-display',
  standalone: true,
  imports: [NgFor],
  templateUrl: './chat-message-display.component.html',
})
export class ChatMessageDisplayComponent {
  @Input() roomMessages: string[] = [];
}
