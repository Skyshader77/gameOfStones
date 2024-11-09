import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-sfx-button',
    standalone: true,
    imports: [],
    templateUrl: './sfx-button.component.html',
})
export class SfxButtonComponent {
    @Input() disabled: boolean;
    @Output() successClick = new EventEmitter<void>();
    @Output() disabledClick = new EventEmitter<void>();

    constructor(private audioService: AudioService) {}

    onSuccessClick() {
        this.audioService.playSfx(Sfx.ButtonSuccess);
    }

    onDisabledClick() {
        if (this.disabled) {
            this.audioService.playSfx(Sfx.ButtonError);
        }
    }
}
