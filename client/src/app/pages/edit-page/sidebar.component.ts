import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
    @Output() tileTypeSelected = new EventEmitter<string>();
    @Output() itemTypeSelected = new EventEmitter<string>();

    selectTile(type: string) {
        this.tileTypeSelected.emit(type);
    }

    selectItem(type: string) {
        this.itemTypeSelected.emit(type);
    }
}
