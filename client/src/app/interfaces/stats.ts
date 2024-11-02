import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export enum PlayerAttributes {
    Hp = 'hp',
    Speed = 'speed',
    Attack = 'attack',
    Defense = 'defense',
}

export interface StatsFormField {
    name: string;
    value: string;
    description: string;
    icon: IconDefinition;
    color: string;
}
