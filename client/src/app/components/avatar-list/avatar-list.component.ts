import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-avatar-list',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './avatar-list.component.html',
})
export class AvatarListComponent {
    @Input() avatarsListcontrol: FormControl | null;
    selectedAvatar: number = 0;
    avatars: string[] = [
        'assets/avatar/goat.jpg',
        'assets/avatar/knight.jpg',
        'assets/avatar/Aishula.png',
        'assets/avatar/Claradore.png',
        'assets/avatar/Eugeny.jpg',
        'assets/avatar/Gwuine.png',
        'assets/avatar/Hardrakka.png',
        'assets/avatar/Livia.png',
        'assets/avatar/Sassan.png',
        'assets/avatar/The_Creator.png',
        'assets/avatar/Vakkon.png',
        'assets/avatar/Hood.png',
    ];

    selectAvatar(index: number): void {
        this.selectedAvatar = index;
        this.avatarsListcontrol?.setValue(index);
    }
}
