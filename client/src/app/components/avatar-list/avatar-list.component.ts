import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATARS } from '@app/constants/player.constants';
import { CommonModule } from '@angular/common';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';


@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './avatar-list.component.html',
})

export class AvatarListComponent implements OnInit {
    @Input() avatarsListControl: FormControl;
    constructor(private avatarListService: AvatarListService) {}

    selectedAvatar: number = 0;
    previousAvatar: number;
    avatars: string[] = AVATARS;

    ngOnInit(): void {
        if (this.avatarsListControl) {
            this.avatarsListControl.setValue(this.selectedAvatar);
        }
    }

    get avatarList() {
        return this.avatarListService.avatarList;
    }

    checkAvatar(index: number): boolean | undefined {
        const avatarPath = AVATARS[index];
        return this.avatarList.get(avatarPath);
        
    }

    selectAvatar(index: number): void {
        this.previousAvatar = this.selectedAvatar;
        this.selectedAvatar = index;
        this.avatarListService.selectAvatar(this.previousAvatar, this.selectedAvatar)
        this.avatarsListControl?.setValue(index);
    }
}
