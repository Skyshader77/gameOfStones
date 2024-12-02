import { Injectable } from '@angular/core';
import { AUDIO_SFX_FILES, DEFAULT_VOLUME } from '@app/constants/audio.constants';
import { MILLI_PER_SECONDS } from '@app/constants/timer.constants';
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

    playSfx(sfx: Sfx, maxDuration: number = Infinity, volume: number = 1.0) {
        const audio = this.sfxFiles.get(sfx);
        if (audio) {
            audio.volume = Math.max(0, Math.min(volume, 1));
            audio.currentTime = 0;
            audio.play();

            if (maxDuration < Infinity) {
                const stopTime = Math.min(maxDuration, audio.duration) * MILLI_PER_SECONDS;
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

    // isLoaded(): boolean {
    //     return this.sfxFiles.size === Object.keys(AUDIO_SFX_FILES).length;
    // }

    private loadSfx() {
        Object.values(Sfx)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const sfx = value as Sfx;
                const audio = new Audio(AUDIO_SFX_FILES[sfx]);
                audio.volume = DEFAULT_VOLUME;
                this.sfxFiles.set(sfx, audio);
            });
    }
}
