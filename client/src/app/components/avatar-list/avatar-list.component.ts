import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent {
    @Input() avatars: string[] = [];
    @Input() control: FormControl | null;
    selectedAvatar: number = 0;

    selectAvatar(index: number): void {
        this.selectedAvatar = index;
        this.control?.setValue(index);
    }
}
