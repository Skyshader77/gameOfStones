import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-lobby-page',
    standalone: true,
    templateUrl: './lobby-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class LobbyPageComponent implements OnInit {
    id: string;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || '';
    }

    // setRoomId(id: string | null): void {
    //     this.id = id || '';
    // }
}
