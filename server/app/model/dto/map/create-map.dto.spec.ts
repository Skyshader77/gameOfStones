import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMapDto } from './create-map.dto';

describe('CreateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: CreateMapDto = {
            name: 'Foxhound',
            sizeRow: 10,
            mode: 'CTF',
            mapArray: [{ tileType: 'grass', itemType: 'mushroom' }],
            mapDescription: 'A map for the Foxhound',
        };

        const dtoInstance = plainToInstance(CreateMapDto, validDto);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(0);
    });

    it('should fail validation when missing required fields', async () => {
        const invalidDto: Partial<CreateMapDto> = {
            name: 'Failed Map',
        };
        const dtoInstance = plainToInstance(CreateMapDto, invalidDto);
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'sizeRow',
                }),
                expect.objectContaining({
                    property: 'mode',
                }),
                expect.objectContaining({
                    property: 'mapArray',
                }),
                expect.objectContaining({
                    property: 'mapDescription',
                }),
            ]),
        );
    });

    it('should fail validation when mapArray is empty', async () => {
        const invalidDto: CreateMapDto = {
            name: 'Fullback',
            sizeRow: 10,
            mode: 'CTF',
            mapArray: [],
            mapDescription: 'A map for the Fullback',
        };

        const dtoInstance = plainToInstance(CreateMapDto, invalidDto);
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'mapArray',
                    constraints: {
                        arrayMinSize: 'mapArray must contain at least 1 elements',
                    },
                }),
            ]),
        );
    });
});
