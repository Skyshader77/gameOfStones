import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function is2dEnum(enumType: object, enumName: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'is2dEnum',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                // Needs to validate anything, so the type needs to be any here
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                validate(value: any) {
                    if (!Array.isArray(value)) return false;
                    for (const row of value) {
                        if (!Array.isArray(row)) return false;
                        for (const element of row) {
                            if (!(element in enumType)) return false;
                        }
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a 2D array of ` + enumName;
                },
            },
        });
    };
}
