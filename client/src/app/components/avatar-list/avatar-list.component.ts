import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATARS } from '@app/constants/player.constants';
import { CommonModule } from '@angular/common';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { AvatarChoice } from '@common/constants/player.constants';

@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent implements OnInit {
    @Input() avatarsListControl: FormControl;
    constructor(private avatarListService: AvatarListService) {}

    avatars = AVATARS;

    ngOnInit(): void {
        if (this.avatarsListControl) {
            this.avatarsListControl.setValue(this.selectedAvatar);
        }
    }

    get avatarList(): Map<AvatarChoice, boolean> {
        console.log(this.avatarListService.avatarList);
        return this.avatarListService.avatarList;
    }

    get selectedAvatar(): AvatarChoice {
        return this.avatarListService.selectedAvatar;
    }

    checkAvatar(index: number): boolean | undefined {
        const avatar = AvatarChoice[`AVATAR${index}` as keyof typeof AvatarChoice];
        return this.avatarList.get(avatar);
    }

    selectAvatar(index: number): void {
        const avatar = AvatarChoice[`AVATAR${index}` as keyof typeof AvatarChoice];
        this.avatarListService.sendAvatarRequest(avatar);
    }
}
