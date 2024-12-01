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
    [Sfx.PlayerInfo]: AUDIO_SFX_FOLDER + 'player-info' + AUDIO_SFX_EXTENSION,
    [Sfx.ButtonClicked]: AUDIO_SFX_FOLDER + 'button-clicked' + AUDIO_SFX_EXTENSION,
    [Sfx.PlayerKicked]: AUDIO_SFX_FOLDER + 'player-kicked' + AUDIO_SFX_EXTENSION,
    [Sfx.TileInfo]: AUDIO_SFX_FOLDER + 'tile-info' + AUDIO_SFX_EXTENSION,
    [Sfx.MapDeleted]: AUDIO_SFX_FOLDER + 'map-deleted' + AUDIO_SFX_EXTENSION,
    [Sfx.MapEdited]: AUDIO_SFX_FOLDER + 'map-edited' + AUDIO_SFX_EXTENSION,
    [Sfx.MapExported]: AUDIO_SFX_FOLDER + 'map-exported' + AUDIO_SFX_EXTENSION,
    [Sfx.MapCreated]: AUDIO_SFX_FOLDER + 'map-created' + AUDIO_SFX_EXTENSION,
    [Sfx.MapSaved]: AUDIO_SFX_FOLDER + 'map-saved' + AUDIO_SFX_EXTENSION,
    [Sfx.MapReset]: AUDIO_SFX_FOLDER + 'map-reset' + AUDIO_SFX_EXTENSION,
    [Sfx.MessageSend]: AUDIO_SFX_FOLDER + 'message-send' + AUDIO_SFX_EXTENSION,
    [Sfx.MessageReceived]: AUDIO_SFX_FOLDER + 'message-received' + AUDIO_SFX_EXTENSION,
    [Sfx.PlayerSlip]: AUDIO_SFX_FOLDER + 'slip' + AUDIO_SFX_EXTENSION,
    [Sfx.OpenDoor]: AUDIO_SFX_FOLDER + 'door-open' + AUDIO_SFX_EXTENSION,
    [Sfx.CloseDoor]: AUDIO_SFX_FOLDER + 'door-close' + AUDIO_SFX_EXTENSION,
    [Sfx.ItemPickedUp]: AUDIO_SFX_FOLDER + 'pickup' + AUDIO_SFX_EXTENSION,
    [Sfx.FightStart]: AUDIO_SFX_FOLDER + 'fight-start' + AUDIO_SFX_EXTENSION,
    [Sfx.FighterEvade]: AUDIO_SFX_FOLDER + 'evade' + AUDIO_SFX_EXTENSION,
    [Sfx.FighterAttack1]: AUDIO_SFX_FOLDER + 'attack-1' + AUDIO_SFX_EXTENSION,
    [Sfx.FighterAttack2]: AUDIO_SFX_FOLDER + 'attack-2' + AUDIO_SFX_EXTENSION,
    [Sfx.PlayerWin]: AUDIO_SFX_FOLDER + 'win' + AUDIO_SFX_EXTENSION,
    [Sfx.PlayerLose]: AUDIO_SFX_FOLDER + 'lose' + AUDIO_SFX_EXTENSION,
};
