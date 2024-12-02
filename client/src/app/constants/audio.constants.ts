import { Sfx } from '@app/interfaces/sfx';

export const AUDIO_SFX_FOLDER = 'assets/audio/ui/';
export const AUDIO_SFX_EXTENSION = '.mp3';

type SfxAudioMap = Record<Sfx, string>;
export const AUDIO_SFX_FILES: SfxAudioMap = {
    [Sfx.ButtonSuccess]: AUDIO_SFX_FOLDER + 'muffled-button' + AUDIO_SFX_EXTENSION,
    [Sfx.ButtonError]: AUDIO_SFX_FOLDER + 'error5' + AUDIO_SFX_EXTENSION,
    [Sfx.Error]: AUDIO_SFX_FOLDER + 'error4' + AUDIO_SFX_EXTENSION,
    [Sfx.Join]: AUDIO_SFX_FOLDER + 'join' + AUDIO_SFX_EXTENSION,
    [Sfx.StartGame]: AUDIO_SFX_FOLDER + 'game-start' + AUDIO_SFX_EXTENSION,
    [Sfx.Bomb]: AUDIO_SFX_FOLDER + 'explosion' + AUDIO_SFX_EXTENSION,
};
