/* eslint-disable @typescript-eslint/no-magic-numbers */

import { TestBed } from '@angular/core/testing';

import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;
    let mockAudio: jasmine.SpyObj<HTMLAudioElement>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
        mockAudio = jasmine.createSpyObj('HTMLAudioElement', ['play', 'pause'], {
            currentTime: 0,
        });
        spyOn(window, 'Audio').and.returnValue(mockAudio);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should play the sound effect when it exists in the sfxFiles map', () => {
        const sfx = Sfx.Bomb;

        Object.defineProperty(service, 'sfxFiles', {
            value: new Map([[sfx, mockAudio]]),
        });

        service.playSfx(sfx);

        expect(mockAudio.currentTime).toBe(0);
        expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should set volume within bounds when playing sound effect', () => {
        const sfx = Sfx.Bomb;
        const volume = 0.5;

        Object.defineProperty(service, 'sfxFiles', {
            value: new Map([[sfx, mockAudio]]),
        });

        service.playSfx(sfx, Infinity, volume);

        expect(mockAudio.volume).toBe(0.5);
    });

    it('should not play sound effect if it does not exist in the sfxFiles map', () => {
        const sfx = Sfx.Bomb;

        Object.defineProperty(service, 'sfxFiles', {
            value: new Map(),
        });

        service.playSfx(sfx);

        expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should stop the sound effect after the specified max duration and reset the audio', () => {
        const sfx = Sfx.Bomb;
        const maxDuration = 2;
        const mockDuration = 5;

        Object.defineProperty(service, 'sfxFiles', {
            value: new Map([[sfx, mockAudio]]),
        });

        Object.defineProperty(mockAudio, 'duration', {
            value: mockDuration,
        });

        jasmine.clock().install();

        service.playSfx(sfx, maxDuration);

        const stopTime = Math.min(maxDuration, mockDuration) * 1000;

        jasmine.clock().tick(stopTime);

        expect(mockAudio.pause).toHaveBeenCalled();
        expect(mockAudio.currentTime).toBe(0);

        jasmine.clock().uninstall();
    });

    it('should play random sound effect from the sfx bank', () => {
        const sfxBank = [Sfx.Bomb, Sfx.ButtonClicked];
        const randomIndex = Math.floor(Math.random() * sfxBank.length);
        const sfx = sfxBank[randomIndex];

        Object.defineProperty(service, 'sfxFiles', {
            value: new Map([[sfx, mockAudio]]),
        });

        spyOn(service, 'playSfx');

        service.playRandomSfx(sfxBank);

        expect(service.playSfx).toHaveBeenCalled();
    });
});
