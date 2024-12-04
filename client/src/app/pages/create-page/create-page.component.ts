import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { SfxButtonComponent } from '@app/components/sfx-button/sfx-button.component';
import { Pages } from '@app/interfaces/pages';
import { FORM_ICONS } from '@app/constants/player.constants';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { RoomSocketService } from '@app/services/communication-services/room-socket/room-socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { RoomCreationService } from '@app/services/room-services/room-creation/room-creation.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { PlayerRole } from '@common/enums/player-role.enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [
        RouterLink,
        FontAwesomeModule,
        MapListComponent,
        MapInfoComponent,
        PlayerCreationComponent,
        MessageDialogComponent,
        SfxButtonComponent,
        CommonModule,
    ],
})
export class CreatePageComponent implements OnInit, OnDestroy {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    formIcon = FORM_ICONS;
    joinEventListener: Subscription;
    roomCode: string = '';

    private roomCreationService = inject(RoomCreationService);
    private playerCreationService = inject(PlayerCreationService);
    private routerService = inject(Router);
    private refreshService = inject(RefreshService);
    private roomSocketService = inject(RoomSocketService);
    private myPlayerService = inject(MyPlayerService);

    get isMapSelected() {
        return this.roomCreationService.isMapSelected();
    }

    ngOnInit(): void {
        this.refreshService.setRefreshDetector();
        this.myPlayerService.role = PlayerRole.Organizer;
        this.roomCreationService.initialize();
        this.joinEventListener = this.roomSocketService.listenForRoomJoined().subscribe((player) => {
            this.myPlayerService.myPlayer = player;
            this.myPlayerService.myPlayer.renderInfo = this.playerCreationService.createInitialRenderInfo();
            this.routerService.navigate([`/${Pages.Room}`, this.roomCode]);
        });
    }

    confirmMapSelection(): void {
        this.roomCreationService
            .isSelectionValid()
            .subscribe((isValid: boolean) => (isValid ? this.playerCreationModal.nativeElement.showModal() : this.manageError()));
    }

    onSubmit(formData: PlayerCreationForm): void {
        const newPlayer = this.playerCreationService.createPlayer(formData, PlayerRole.Organizer);
        this.roomCreationService.submitCreation().subscribe(({ room, selectedMap }) => {
            if (room && selectedMap) {
                this.roomCode = room.roomCode;
                this.roomCreationService.handleRoomCreation(newPlayer, room.roomCode, selectedMap);
            } else {
                this.manageError();
            }
        });
    }

    ngOnDestroy(): void {
        this.joinEventListener.unsubscribe();
    }

    private manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.roomCreationService.initialize();
    }
}
