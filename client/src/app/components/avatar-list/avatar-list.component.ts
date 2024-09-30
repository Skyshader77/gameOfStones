import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AVATARS } from '@app/constants/player.constants';

@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent implements OnInit {
    @Input() avatarsListControl: FormControl;
    selectedAvatar: number = 0;
    avatars: string[] = AVATARS;

    ngOnInit(): void {
        if (this.avatarsListControl) {
            this.avatarsListControl.setValue(this.selectedAvatar);
        }
    }

    selectAvatar(index: number): void {
        this.selectedAvatar = index;
        this.avatarsListControl?.setValue(index);
    }
}
