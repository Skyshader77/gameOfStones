import { Statistic, StatsFormField } from '@app/interfaces/stats';
import { AvatarChoice } from '@common/constants/player.constants';
import { faBackward, faCircleInfo, faHandFist, faHeart, faPlay, faShieldHalved, faSquare, faX } from '@fortawesome/free-solid-svg-icons';

export const DEFAULT_INITIAL_STAT = 4;
export const MAX_INITIAL_STAT = 6;
export const STATS_ICON_SIZE = 32;
export const INITIAL_OFFSET = { x: 0, y: 0 };
export const INITIAL_POSITION = { x: 0, y: 0 };
export const SPRITE_FOLDER = 'assets/sprites/';
export const FORM_ICONS = { faCircleInfo, faSquare, faX, faBackward, faPlay };

export const AVATAR_FOLDER = 'assets/avatar/';

export const AVATAR_TO_PATH: { [key in AvatarChoice]: string } = {
    [AvatarChoice.AVATAR0]: AVATAR_FOLDER + 'goat.jpg',
    [AvatarChoice.AVATAR1]: AVATAR_FOLDER + 'knight.jpg',
    [AvatarChoice.AVATAR2]: AVATAR_FOLDER + 'Aishula.png',
    [AvatarChoice.AVATAR3]: AVATAR_FOLDER + 'Claradore.png',
    [AvatarChoice.AVATAR4]: AVATAR_FOLDER + 'Eugeny.jpg',
    [AvatarChoice.AVATAR5]: AVATAR_FOLDER + 'Gwuine.png',
    [AvatarChoice.AVATAR6]: AVATAR_FOLDER + 'Hardrakka.png',
    [AvatarChoice.AVATAR7]: AVATAR_FOLDER + 'Livia.png',
    [AvatarChoice.AVATAR8]: AVATAR_FOLDER + 'Sassan.png',
    [AvatarChoice.AVATAR9]: AVATAR_FOLDER + 'The_Creator.png',
    [AvatarChoice.AVATAR10]: AVATAR_FOLDER + 'Vakkon.png',
    [AvatarChoice.AVATAR11]: AVATAR_FOLDER + 'Hood.png',
};

export const AVATARS: string[] = [
    AVATAR_FOLDER + 'goat.jpg',
    AVATAR_FOLDER + 'knight.jpg',
    AVATAR_FOLDER + 'Aishula.png',
    AVATAR_FOLDER + 'Claradore.png',
    AVATAR_FOLDER + 'Eugeny.jpg',
    AVATAR_FOLDER + 'Gwuine.png',
    AVATAR_FOLDER + 'Hardrakka.png',
    AVATAR_FOLDER + 'Livia.png',
    AVATAR_FOLDER + 'Sassan.png',
    AVATAR_FOLDER + 'The_Creator.png',
    AVATAR_FOLDER + 'Vakkon.png',
    AVATAR_FOLDER + 'Hood.png',
];

export enum SpriteSheetChoice {
    SPRITE0 = SPRITE_FOLDER + 'healer_f.png',
    SPRITE1 = SPRITE_FOLDER + 'healer_m.png',
    SPRITE2 = SPRITE_FOLDER + 'mage_f.png',
    SPRITE3 = SPRITE_FOLDER + 'mage_m.png',
    SPRITE4 = SPRITE_FOLDER + 'ninja_f.png',
    SPRITE5 = SPRITE_FOLDER + 'ninja_m.png',
    SPRITE6 = SPRITE_FOLDER + 'ranger_f.png',
    SPRITE7 = SPRITE_FOLDER + 'ranger_m.png',
    SPRITE8 = SPRITE_FOLDER + 'townfolk1_f.png',
    SPRITE9 = SPRITE_FOLDER + 'townfolk1_m.png',
    SPRITE10 = SPRITE_FOLDER + 'warrior_f.png',
    SPRITE11 = SPRITE_FOLDER + 'warrior_m.png',
    NINJA_DOWN = SPRITE_FOLDER + 'ninja_d.png',
    NINJA_LEFT = SPRITE_FOLDER + 'ninja_l.png',
    NINJA_RIGHT = SPRITE_FOLDER + 'ninja_r.png',
    NINJA_UP = SPRITE_FOLDER + 'ninja_u.png',
}

export const HP_SPEED_FIELDS: StatsFormField[] = [
    {
        name: 'Vie',
        value: Statistic.HP,
        description: 'Les points de vie sont utiles pour survivre durant un combat',
        icon: faHeart,
        color: 'red-700',
    },
    {
        name: 'Rapidité',
        value: Statistic.SPEED,
        description: "La rapidité impacte la vitesse des coups portés lors d'un combat",
        icon: faPlay,
        color: 'green-700',
    },
];

export const ATTACK_DEFENSE_FIELDS: StatsFormField[] = [
    {
        name: 'Attaque',
        value: Statistic.ATTACK,
        description: "Les points d'attaque indiquent les dégâts pouvant être infligés à vos adversaires",
        icon: faHandFist,
        color: 'yellow-500',
    },
    {
        name: 'Défense',
        value: Statistic.DEFENSE,
        description: 'Les points de défense informe sur la capacité à encaisser les coups de vos adversaires',
        icon: faShieldHalved,
        color: 'blue-700',
    },
];

export const INITIAL_PLAYER_FORM_VALUES = {
    name: '',
    avatarId: 0,
    statsBonus: '',
    dice6: '',
};
