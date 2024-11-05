import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { Avatar } from '@common/enums/avatar.enum';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent implements OnInit, OnDestroy {
    @Input() avatarsListControl: FormControl;

    avatars = Object.values(AVATAR_PROFILE);

    private avatarSubscription: Subscription;
    constructor(
        private avatarListService: AvatarListService,
        private myPlayerService: MyPlayerService,
    ) {}

    get isOrganizer(): boolean {
        return this.myPlayerService.isOrganizer();
    }

    get avatarTakenStateList(): boolean[] {
        return this.avatarListService.avatarsTakenState;
    }

    get selectedAvatar(): Avatar {
        return this.avatarListService.selectedAvatar.value;
    }

    ngOnInit(): void {
        this.avatarSubscription = this.avatarListService.selectedAvatar.subscribe((avatar: Avatar) => {
            this.avatarsListControl.setValue(avatar);
        });
    }

    selectAvatar(index: number): void {
        this.avatarListService.setSelectedAvatar(index);
    }

    requestSelectAvatar(index: number): void {
        this.avatarListService.sendAvatarRequest(index as Avatar);
    }

    ngOnDestroy(): void {
        if (this.avatarSubscription) {
            this.avatarSubscription.unsubscribe();
        }
    }
}
