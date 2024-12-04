import { CreationMap } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';

export interface ValidationStatus {
    doorAndWallNumberValid: boolean;
    wholeMapAccessible: boolean;
    allStartPointsPlaced: boolean;
    doorSurroundingsValid: boolean;
    flagPlaced: boolean;
    allItemsPlaced: boolean;
    nameValid: boolean;
    descriptionValid: boolean;
    isMapValid: boolean;
}

export interface ValidationResult {
    validationStatus: ValidationStatus;
    message: string;
}

export interface JsonValidationResult {
    isValid: boolean;
    message: string;
}

export type JsonValidation = (map: CreationMap) => JsonValidationResult;
export type JsonInterpolate = { [key: string]: string | number | Vec2 };
