import { Statistic, StatsFormField } from '@app/interfaces/stats';
import { faBackward, faCircleInfo, faHandFist, faHeart, faPlay, faShieldHalved, faSquare, faX } from '@fortawesome/free-solid-svg-icons';

export const DEFAULT_INITIAL_STAT = 4;
export const MAX_INITIAL_STAT = 6;
export const STATS_ICON_SIZE = 32;

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
