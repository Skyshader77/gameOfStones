import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-player-creation-page',
    standalone: true,
    templateUrl: './player-creation-page.component.html',
    styleUrls: [],
    imports: [RouterLink, ReactiveFormsModule],
})
export class PlayerCreationPageComponent {
    // TODO how to do the avatars (carousel, card dropdown, menu, etc.)?
    // TODO how to restrain options to what we want?
    // TODO how to do dynamic updating of the available avatars with the lobby?

    playerForm = new FormGroup({
        name: new FormControl('', Validators.required),
        avatar: new FormControl('', Validators.required),
        bonus: new FormControl('', Validators.required),
        d6Bonus: new FormControl('', Validators.required),
    });

    constructor(private router: Router) {}

    onSubmit() {
        // TODO send post to server or via websocket
        this.router.navigateByUrl('/lobby');
    }
}
