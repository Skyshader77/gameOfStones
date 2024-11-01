import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATARS } from '@app/constants/player.constants';
import { CommonModule } from '@angular/common';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { AvatarChoice } from '@common/constants/player.constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent implements OnInit, OnDestroy {
    @Input() avatarsListControl: FormControl;
    @Input() isOrganizer: boolean;

    private avatarSubscription: Subscription;
    constructor(private avatarListService: AvatarListService) {}

    avatars = AVATARS;

    ngOnInit(): void {
        this.avatarSubscription = this.avatarListService.selectedAvatar.subscribe((avatar: AvatarChoice) => {
            this.avatarsListControl.setValue(avatar);
        });
    }

    get avatarList(): boolean[] {
        return this.avatarListService.avatarList;
    }

    get selectedAvatar(): AvatarChoice {
        return this.avatarListService.selectedAvatar.value;
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
