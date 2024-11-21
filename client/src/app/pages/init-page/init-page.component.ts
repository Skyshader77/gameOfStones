import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { TEAM_NAMES, TEAM_NUMBER } from '@app/constants/team.constants';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state/rendering-state.service';
import { AvatarListService } from '@app/services/room-services/avatar-list/avatar-list.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list/player-list.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';

@Component({
    selector: 'app-init-page',
    standalone: true,
    templateUrl: './init-page.component.html',
    styleUrls: ['./init-page.component.scss'],
    imports: [RouterLink, CommonModule, MessageDialogComponent],
})
export class InitPageComponent implements OnInit, AfterViewInit {
    teamNumber = TEAM_NUMBER;
    teamNames = TEAM_NAMES;

    private modalMessageService: ModalMessageService = inject(ModalMessageService);
    private chatListService: ChatListService = inject(ChatListService);
    private journalListService: JournalListService = inject(JournalListService);
    private avatarListService: AvatarListService = inject(AvatarListService);
    private renderingStateService: RenderingStateService = inject(RenderingStateService);
    private fightStateService: FightStateService = inject(FightStateService);
    private gameMapService: GameMapService = inject(GameMapService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private playerListService: PlayerListService = inject(PlayerListService);
    private roomStateService: RoomStateService = inject(RoomStateService);

    ngOnInit() {
        this.chatListService.startChat();
        this.journalListService.startJournal();
        this.avatarListService.initializeAvatarList();
        this.renderingStateService.initialize();
        this.fightStateService.setInitialFight();
        this.gameMapService.initialize();
        this.myPlayerService.initialize();
        this.playerListService.startPlayerList();
        this.roomStateService.setInitialRoom();
    }

    ngAfterViewInit(): void {
        const storedMessage = this.modalMessageService.getStoredMessage();
        if (storedMessage) {
            this.modalMessageService.showMessage(storedMessage);
        }
    }
}
