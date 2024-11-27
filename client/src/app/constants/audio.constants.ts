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
    [Sfx.Create]: AUDIO_SFX_FOLDER + 'create' + AUDIO_SFX_EXTENSION,
    [Sfx.Admin]: AUDIO_SFX_FOLDER + 'admin' + AUDIO_SFX_EXTENSION,
    [Sfx.Backward]: AUDIO_SFX_FOLDER + 'backward' + AUDIO_SFX_EXTENSION,
    [Sfx.Lock]: AUDIO_SFX_FOLDER + 'lock' + AUDIO_SFX_EXTENSION,
    [Sfx.NewPlayer]: AUDIO_SFX_FOLDER + 'new-player' + AUDIO_SFX_EXTENSION,
    [Sfx.ButtonClicked]: AUDIO_SFX_FOLDER + 'button-clicked' + AUDIO_SFX_EXTENSION,
    [Sfx.PlayerKicked]: AUDIO_SFX_FOLDER + 'player-kicked' + AUDIO_SFX_EXTENSION,
};
