import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export enum Statistic {
    HP = 'hp',
    SPEED = 'speed',
    ATTACK = 'attack',
    DEFENSE = 'defense',
}

export interface StatsFormField {
    name: string;
    value: string;
    description: string;
    icon: IconDefinition;
    color: string;
}
