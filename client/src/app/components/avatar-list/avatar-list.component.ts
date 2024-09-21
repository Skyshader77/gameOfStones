import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent {
    @Input() avatars: string[] = [];
    @Input() selectedAvatar: number = 0;
    @Output() avatarSelected = new EventEmitter<number>();

    selectAvatar(index: number): void {
        this.avatarSelected.emit(index);
    }
}
