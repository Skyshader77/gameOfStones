import { ClosestObject } from '@app/interfaces/ai-action';

export const MAX_AI_DISPLACEMENT_VALUE = 1000;

export const MAX_AI_FIGHT_ACTION_DELAY = 2990;
export const MIN_AI_FIGHT_ACTION_DELAY = 1000;

export const MAX_AI_ACTION_DELAY = 2000;
export const MIN_AI_ACTION_DELAY = 1000;

export interface AiPlayerActionOutput {
    hasSlipped: boolean;
    isBeforeObstacle: boolean;
}

export interface AiPlayerActionInput {
    closestPlayer: ClosestObject;
    closestItem: ClosestObject;
    isBeforeObstacle: boolean;
}
