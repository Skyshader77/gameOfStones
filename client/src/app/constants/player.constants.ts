import { PlayerAttributeType, StatsFormField } from '@app/interfaces/stats';
import { Avatar } from '@common/enums/avatar.enum';
import { Direction } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { faBackward, faCircleInfo, faHandFist, faHeart, faPlay, faShieldHalved, faSquare, faX } from '@fortawesome/free-solid-svg-icons';
import { SPRITE_FILE_EXTENSION } from './rendering.constants';

export const STATS_ICON_SIZE = 32;
export const INITIAL_OFFSET = { x: 0, y: 0 };
export const SPRITE_FOLDER = 'assets/sprites/';
export const FORM_ICONS = { faCircleInfo, faSquare, faX, faBackward, faPlay };

export const AVATAR_FOLDER = 'assets/avatar/';

export const AVATAR_PROFILE: { [key in Avatar]: string } = {
    [Avatar.FemaleHealer]: AVATAR_FOLDER + 'clericF.jpeg',
    [Avatar.MaleHealer]: AVATAR_FOLDER + 'clericM.jpeg',
    [Avatar.FemaleMage]: AVATAR_FOLDER + 'mageF.jpeg',
    [Avatar.MaleMage]: AVATAR_FOLDER + 'mageM.jpeg',
    [Avatar.FemaleNinja]: AVATAR_FOLDER + 'ninjaF.jpeg',
    [Avatar.MaleNinja]: AVATAR_FOLDER + 'ninjaM.jpeg',
    [Avatar.FemaleRanger]: AVATAR_FOLDER + 'rangerF.jpeg',
    [Avatar.MaleRanger]: AVATAR_FOLDER + 'rangerM.jpeg',
    [Avatar.FemaleTownFolk]: AVATAR_FOLDER + 'merchantM.jpeg',
    [Avatar.MaleTownFolk]: AVATAR_FOLDER + 'merchantF.jpeg',
    [Avatar.FemaleWarrior]: AVATAR_FOLDER + 'warriorF.jpeg',
    [Avatar.MaleWarrior]: AVATAR_FOLDER + 'warriorM.jpeg',
};

export const AVATAR_SPRITE_SHEET: { [key in Avatar]: string } = {
    [Avatar.FemaleHealer]: SPRITE_FOLDER + 'healer_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleHealer]: SPRITE_FOLDER + 'healer_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleMage]: SPRITE_FOLDER + 'mage_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleMage]: SPRITE_FOLDER + 'mage_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleNinja]: SPRITE_FOLDER + 'ninja_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleNinja]: SPRITE_FOLDER + 'ninja_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleRanger]: SPRITE_FOLDER + 'ranger_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleRanger]: SPRITE_FOLDER + 'ranger_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleTownFolk]: SPRITE_FOLDER + 'townfolk1_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleTownFolk]: SPRITE_FOLDER + 'townfolk1_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleWarrior]: SPRITE_FOLDER + 'warrior_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleWarrior]: SPRITE_FOLDER + 'warrior_m' + SPRITE_FILE_EXTENSION,
};

export const SPRITE_DIRECTION_INDEX: { [key in Direction]: number } = {
    [Direction.UP]: 1,
    [Direction.DOWN]: 7,
    [Direction.LEFT]: 10,
    [Direction.RIGHT]: 4,
};

export const DIRECTION_TO_MOVEMENT: { [key in Direction]: Vec2 } = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT]: { x: -1, y: 0 },
    [Direction.RIGHT]: { x: 1, y: 0 },
};

export const SPRITE_LEFT_STEP = 1;
export const SPRITE_RIGHT_STEP = -1;

export const HP_SPEED_FIELDS: StatsFormField[] = [
    {
        name: 'Vie',
        value: PlayerAttributeType.Hp,
        description: 'Les points de vie sont utiles pour survivre durant un combat',
        icon: faHeart,
        color: 'red-700',
    },
    {
        name: 'Rapidité',
        value: PlayerAttributeType.Speed,
        description: "La rapidité impacte la vitesse des coups portés lors d'un combat",
        icon: faPlay,
        color: 'green-700',
    },
];

export const ATTACK_DEFENSE_FIELDS: StatsFormField[] = [
    {
        name: 'Attaque',
        value: PlayerAttributeType.Attack,
        description: "Les points d'attaque indiquent les dégâts pouvant être infligés à vos adversaires",
        icon: faHandFist,
        color: 'yellow-500',
    },
    {
        name: 'Défense',
        value: PlayerAttributeType.Defense,
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
