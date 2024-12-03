import { PlayerAttributeType, StatsFormField } from '@app/interfaces/stats';
import { Direction } from '@common/interfaces/move';
import { faBackward, faCircleInfo, faHandFist, faHeart, faPlay, faShieldHalved, faSquare, faX } from '@fortawesome/free-solid-svg-icons';

export const STATS_ICON_SIZE = 32;
export const INITIAL_OFFSET = { x: 0, y: 0 };
export const FORM_ICONS = { faCircleInfo, faSquare, faX, faBackward, faPlay };

type SpriteDirectionMap = { [key in Direction]: number };
export const SPRITE_DIRECTION_INDEX: SpriteDirectionMap = {
    [Direction.UP]: 1,
    [Direction.DOWN]: 7,
    [Direction.LEFT]: 10,
    [Direction.RIGHT]: 4,
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
