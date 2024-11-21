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
