import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { RoomCreationService } from '@app/services/room-services/room-creation.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { PlayerRole } from '@common/constants/player.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, MapListComponent, MapInfoComponent, PlayerCreationComponent, MessageDialogComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    formIcon = FORM_ICONS;
    joinEventListener: Subscription;
    roomCode: string = '';

    constructor(
        public roomCreationService: RoomCreationService,
        private playerCreationService: PlayerCreationService,
        private routerService: Router,
        private refreshService: RefreshService,
        private roomSocketService: RoomSocketService,
        private myPlayerService: MyPlayerService,
    ) {}

    ngOnInit(): void {
        this.refreshService.setRefreshDetector();
        this.roomCreationService.initialize();
        this.joinEventListener = this.roomSocketService.listenForRoomJoined().subscribe((player) => {
            this.myPlayerService.myPlayer = player;
            console.log(this.myPlayerService.myPlayer.playerInfo.avatar);
            this.routerService.navigate(['/room', this.roomCode]);
        });
    }

    confirmMapSelection(): void {
        this.roomCreationService
            .isSelectionValid()
            .subscribe((isValid: boolean) => (isValid ? this.playerCreationModal.nativeElement.showModal() : this.manageError()));
    }

    onSubmit(formData: PlayerCreationForm): void {
        const newPlayer = this.playerCreationService.createPlayer(formData, PlayerRole.ORGANIZER);
        this.roomCreationService.submitCreation().subscribe(({ room, selectedMap }) => {
            if (room && selectedMap) {
                this.roomCode = room.roomCode;
                this.roomCreationService.handleRoomCreation(newPlayer, room.roomCode, selectedMap);
            } else {
                this.manageError();
            }
        });
    }

    private manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.roomCreationService.initialize();
    }
}
