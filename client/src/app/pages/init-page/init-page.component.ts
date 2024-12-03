import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { Pages } from '@app/interfaces/pages';
import { TEAM_NAMES, TEAM_NUMBER } from '@app/constants/team.constants';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { AvatarListService } from '@app/services/states/avatar-list/avatar-list.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { RoomStateService } from '@app/services/states/room-state/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';

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
    pages = Pages;

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

    constructor(private audioService: AudioService) {}

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
        this.fightStateService.initialize();
    }

    ngAfterViewInit(): void {
        const storedMessage = this.modalMessageService.getStoredMessage();
        if (storedMessage) {
            this.modalMessageService.showMessage(storedMessage);
        }
    }

    onJoinClick() {
        this.audioService.playSfx(Sfx.Join);
    }

    onCreateClick() {
        this.audioService.playSfx(Sfx.Create);
    }

    onAdminClick() {
        this.audioService.playSfx(Sfx.Admin);
    }
}
