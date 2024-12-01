import { Injectable } from '@angular/core';
import { AUDIO_SFX_FILES } from '@app/constants/audio.constants';
import { Sfx } from '@app/interfaces/sfx';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private sfxFiles: Map<Sfx, HTMLAudioElement>;

    constructor() {
        this.sfxFiles = new Map<Sfx, HTMLAudioElement>();
        this.loadSfx();
    }

    playSfx(sfx: Sfx, volume: number = 1.0, maxDuration: number = Infinity) {
        const audio = this.sfxFiles.get(sfx);
        if (audio) {
            audio.volume = Math.max(0, Math.min(volume, 1));
            audio.currentTime = 0;
            audio.play();

            if (maxDuration < Infinity) {
                const stopTime = Math.min(maxDuration, audio.duration) * 1000;
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, stopTime);
            }
        }
    }

    playRandomSfx(sfxBank: Sfx[], volume: number = 1.0, maxDuration: number = Infinity) {
        const randomIndex = Math.floor(Math.random() * sfxBank.length);
        this.playSfx(sfxBank[randomIndex], volume, maxDuration);
    }

    private loadSfx() {
        Object.values(Sfx)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const sfx = value as Sfx;
                const audio = new Audio(AUDIO_SFX_FILES[sfx]);
                this.sfxFiles.set(sfx, audio);
            });
    }
}
