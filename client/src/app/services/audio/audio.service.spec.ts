import { TestBed } from '@angular/core/testing';

import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;
    let mockAudio: jasmine.SpyObj<HTMLAudioElement>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
        mockAudio = jasmine.createSpyObj('HTMLAudioElement', ['play'], {
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
});
