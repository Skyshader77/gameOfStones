import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-lobby-page',
    standalone: true,
    templateUrl: './lobby-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class LobbyPageComponent {
    id: string;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || '';
    }
}
