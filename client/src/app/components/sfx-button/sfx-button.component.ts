import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-sfx-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sfx-button.component.html',
})
export class SfxButtonComponent {
    @Input() disabled: boolean;
    @Input() enabledSfx: Sfx | undefined = Sfx.ButtonSuccess;
    @Input() disabledSfx: Sfx | undefined = Sfx.ButtonError;
    @Input() buttonClasses: string = '';
    @Output() enabledClick = new EventEmitter<void>();
    @Output() disabledClick = new EventEmitter<void>();

    constructor(private audioService: AudioService) {}

    onEnabledClick() {
        if (this.enabledSfx || this.enabledSfx === Sfx.ButtonSuccess) {
            this.audioService.playSfx(this.enabledSfx);
        }
        this.enabledClick.emit();
    }

    onDisabledClick() {
        if (!this.disabled) return;
        if (this.disabledSfx || this.disabledSfx === Sfx.ButtonSuccess) {
            this.audioService.playSfx(this.disabledSfx);
        }
        this.disabledClick.emit();
    }
}
