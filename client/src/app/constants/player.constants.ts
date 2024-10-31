import { Direction } from '@app/interfaces/reachable-tiles';
import { Statistic, StatsFormField } from '@app/interfaces/stats';
import { faBackward, faCircleInfo, faHandFist, faHeart, faPlay, faShieldHalved, faSquare, faX } from '@fortawesome/free-solid-svg-icons';
import { SPRITE_FILE_EXTENSION } from './rendering.constants';

export const DEFAULT_INITIAL_STAT = 4;
export const MAX_INITIAL_STAT = 6;
export const STATS_ICON_SIZE = 32;
export const INITIAL_OFFSET = { x: 0, y: 0 };
export const INITIAL_POSITION = { x: 0, y: 0 };
export const SPRITE_FOLDER = 'assets/sprites/';
export const FORM_ICONS = { faCircleInfo, faSquare, faX, faBackward, faPlay };

export const AVATAR_FOLDER = 'assets/avatar/';

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

// TODO the enum should really not be a file path.
export enum AvatarChoice {
    AVATAR0 = AVATAR_FOLDER + 'goat.jpg',
    AVATAR1 = AVATAR_FOLDER + 'knight.jpg',
    AVATAR2 = AVATAR_FOLDER + 'Aishula.png',
    AVATAR3 = AVATAR_FOLDER + 'Claradore.png',
    AVATAR4 = AVATAR_FOLDER + 'Eugeny.jpg',
    AVATAR5 = AVATAR_FOLDER + 'Gwuine.png',
    AVATAR6 = AVATAR_FOLDER + 'Hardrakka.png',
    AVATAR7 = AVATAR_FOLDER + 'Livia.png',
    AVATAR8 = AVATAR_FOLDER + 'Sassan.png',
    AVATAR9 = AVATAR_FOLDER + 'The_Creator.png',
    AVATAR10 = AVATAR_FOLDER + 'Vakkon.png',
    AVATAR11 = AVATAR_FOLDER + 'Hood.png',
}

export enum SpriteSheetChoice {
    FemaleHealer,
    MaleHealer,
    FemaleMage,
    MaleMage,
    FemaleNinja,
    MaleNinja,
    FemaleRanger,
    MaleRanger,
    FemaleTownFolk,
    MaleTownFolk,
    FemaleWarrior,
    MaleWarrior,
}

export const SPRITE_SHEET_TO_PATH: { [key in SpriteSheetChoice]: string } = {
    [SpriteSheetChoice.FemaleHealer]: SPRITE_FOLDER + 'healer_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleHealer]: SPRITE_FOLDER + 'healer_m' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.FemaleMage]: SPRITE_FOLDER + 'mage_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleMage]: SPRITE_FOLDER + 'mage_m' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.FemaleNinja]: SPRITE_FOLDER + 'ninja_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleNinja]: SPRITE_FOLDER + 'ninja_m' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.FemaleRanger]: SPRITE_FOLDER + 'ranger_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleRanger]: SPRITE_FOLDER + 'ranger_m' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.FemaleTownFolk]: SPRITE_FOLDER + 'townfolk1_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleTownFolk]: SPRITE_FOLDER + 'townfolk1_m' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.FemaleWarrior]: SPRITE_FOLDER + 'warrior_f' + SPRITE_FILE_EXTENSION,
    [SpriteSheetChoice.MaleWarrior]: SPRITE_FOLDER + 'warrior_m' + SPRITE_FILE_EXTENSION,
};

export const SPRITE_DIRECTION_INDEX: { [key in Direction]: number } = {
    [Direction.UP]: 1,
    [Direction.DOWN]: 4,
    [Direction.LEFT]: 10,
    [Direction.RIGHT]: 7,
};

export const SPRITE_LEFT_STEP = 1;
export const SPRITE_RIGHT_STEP = -1;

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
