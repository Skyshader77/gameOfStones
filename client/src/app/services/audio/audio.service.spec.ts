import { TestBed } from '@angular/core/testing';

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
});
