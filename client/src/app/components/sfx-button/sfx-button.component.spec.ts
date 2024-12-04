import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { SfxButtonComponent } from './sfx-button.component';

describe('SfxButtonComponent', () => {
    let component: SfxButtonComponent;
    let fixture: ComponentFixture<SfxButtonComponent>;
    let audioServiceMock: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        audioServiceMock = jasmine.createSpyObj('AudioService', ['playSfx']);

        await TestBed.configureTestingModule({
            imports: [SfxButtonComponent],
            providers: [{ provide: AudioService, useValue: audioServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(SfxButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit enabledClick and play enabledSfx on onEnabledClick', () => {
        spyOn(component.enabledClick, 'emit');

        component.enabledSfx = Sfx.Bomb;

        component.onEnabledClick();

        expect(audioServiceMock.playSfx).toHaveBeenCalledWith(Sfx.Bomb);
        expect(component.enabledClick.emit).toHaveBeenCalled();
    });

    it('should not play enabledSfx if enabledSfx is undefined', () => {
        spyOn(component.enabledClick, 'emit');

        component.enabledSfx = undefined;
        component.onEnabledClick();

        expect(audioServiceMock.playSfx).not.toHaveBeenCalled();
        expect(component.enabledClick.emit).toHaveBeenCalled();
    });

    it('should emit disabledClick and play disabledSfx on onDisabledClick if disabled is true', () => {
        component.disabled = true;
        component.disabledSfx = Sfx.ButtonError;
        spyOn(component.disabledClick, 'emit');

        component.onDisabledClick();

        expect(audioServiceMock.playSfx).toHaveBeenCalledWith(Sfx.ButtonError);
        expect(component.disabledClick.emit).toHaveBeenCalled();
    });

    it('should not play disabledSfx or emit disabledClick if disabled is false', () => {
        component.disabled = false;
        component.disabledSfx = Sfx.ButtonError;
        spyOn(component.disabledClick, 'emit');

        component.onDisabledClick();

        expect(audioServiceMock.playSfx).not.toHaveBeenCalled();
        expect(component.disabledClick.emit).not.toHaveBeenCalled();
    });

    it('should not play disabledSfx if disabledSfx is undefined, even when disabled is true', () => {
        component.disabled = true;
        component.disabledSfx = undefined;
        spyOn(component.disabledClick, 'emit');

        component.onDisabledClick();

        expect(audioServiceMock.playSfx).not.toHaveBeenCalled();
        expect(component.disabledClick.emit).toHaveBeenCalled();
    });
});
