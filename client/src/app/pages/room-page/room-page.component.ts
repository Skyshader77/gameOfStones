import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { LEAVE_ROOM_CONFIRMATION_MESSAGE } from '@app/constants/room.constants';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule, FontAwesomeModule, PlayerListComponent, ChatComponent],
})
export class RoomPageComponent implements OnInit, OnDestroy {
    @ViewChild('kickPlayerDialog') kickPlayerDialog: ElementRef<HTMLDialogElement>;
    @ViewChild('leaveRoomDialog') leaveRoomDialog: ElementRef<HTMLDialogElement>;
    roomId: string;
    isRoomLocked: boolean = false;
    removedPlayerName: string;
    faLockIcon = faLock;
    faOpenLockIcon = faLockOpen;
    leaveRoomMessage = LEAVE_ROOM_CONFIRMATION_MESSAGE;

    myPlayerService: MyPlayerService = inject(MyPlayerService);
    roomStateService: RoomStateService = inject(RoomStateService);
    route = inject(ActivatedRoute);
    playerListService = inject(PlayerListService);
    refreshService = inject(RefreshService);
    roomSocketService = inject(RoomSocketService);
    routerService = inject(Router);
    modalMessageService = inject(ModalMessageService);

    private removalConfirmationSubscription: Subscription;

    ngOnInit() {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.routerService.navigate(['/init']);
        }
        this.roomId = this.route.snapshot.paramMap.get('id') || '';
        this.roomStateService.initialize();
        this.removalConfirmationSubscription = this.playerListService.removalConfirmation$.subscribe((userName: string) => {
            this.removedPlayerName = userName;
            if (this.kickPlayerDialog.nativeElement.isConnected) {
                this.kickPlayerDialog.nativeElement.showModal();
            }
        });
    }

    toggleRoomLock() {
        this.isRoomLocked = !this.isRoomLocked;
        this.roomSocketService.toggleRoomLock(this.roomId);
    }

    quitRoom() {
        // TODO place this in another service
        this.roomSocketService.leaveRoom();
        this.routerService.navigate(['/init']);
    }

    displayLeavingConfirmation() {
        this.leaveRoomDialog.nativeElement.showModal();
    }

    ngOnDestroy(): void {
        this.roomStateService.onCleanUp();
        this.removalConfirmationSubscription.unsubscribe();
    }
}
