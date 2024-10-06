import { Component, OnInit } from '@angular/core';
import { ChatClientService } from '@app/services/chat-service/chat-client.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ChatMessageDisplayComponent } from "../../components/chat/chat-message-display/chat-message-display.component";
import { ChatInputBoxComponent } from "../../components/chat/chat-input-box/chat-input-box.component";

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [FormsModule, NgFor, ChatMessageDisplayComponent, ChatInputBoxComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: []
})
export class ChatPageComponent implements OnInit {
  chatInput = "";
  broadcastMessage = "";
  serverMessages: string[] = [];

  roomMessage = "";
  roomMessages: string[] = [];

  constructor(public socketService: ChatClientService) {}

  get socketId() {
    return this.socketService.socket.id ? this.socketService.socket.id: '';
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
    this.socketService.on("connect", () => {
      console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
    });

    // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
    this.socketService.on('massMessage', (broadcastMessage: string) => {
      console.log(broadcastMessage);
      console.log(`${this.socketService.socket.id}`);
      this.serverMessages.push(broadcastMessage);
    });

    this.socketService.on('roomMessage', (roomMessage: string) => {
      this.roomMessages.push(roomMessage);
    });
  }

  broadcastMessageToAll() {
    this.socketService.send('broadcastAll', this.broadcastMessage);
    this.broadcastMessage = "";
  }

  joinRoom() {
    this.socketService.send("joinRoom");
  }

  sendToRoom(roomMessage: string) {
    this.socketService.send('roomMessage', roomMessage);
  }
}
