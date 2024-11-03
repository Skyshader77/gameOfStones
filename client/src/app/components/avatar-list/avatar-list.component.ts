import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATAR_TO_PATH } from '@app/constants/player.constants';
import { CommonModule } from '@angular/common';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { AvatarChoice } from '@common/constants/player.constants';
import { Subscription } from 'rxjs';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent implements OnInit, OnDestroy {
    @Input() avatarsListControl: FormControl;

    avatars = Object.values(AVATAR_TO_PATH);

    private avatarSubscription: Subscription;
    constructor(
        private avatarListService: AvatarListService,
        private myPlayerService: MyPlayerService,
    ) {}

    get isOrganizer(): boolean {
        return this.myPlayerService.isOrganizer();
    }

    get avatarTakenStateList(): boolean[] {
        return this.avatarListService.avatarTakenStateList;
    }

    get selectedAvatar(): AvatarChoice {
        return this.avatarListService.selectedAvatar.value;
    }

    ngOnInit(): void {
        this.avatarSubscription = this.avatarListService.selectedAvatar.subscribe((avatar: AvatarChoice) => {
            this.avatarsListControl.setValue(avatar);
        });
    }

    selectAvatar(index: number): void {
        this.avatarListService.setSelectedAvatar(index);
    }

    requestSelectAvatar(index: number): void {
        this.avatarListService.sendAvatarRequest(index as AvatarChoice);
    }

    ngOnDestroy(): void {
        if (this.avatarSubscription) {
            this.avatarSubscription.unsubscribe();
        }
    }
}
