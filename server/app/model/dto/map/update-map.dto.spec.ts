import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateMapDto } from './update-map.dto';

describe('UpdateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: UpdateMapDto = {
            mapID: 'Mig31Foxhound',
            name: 'Foxhound',
            sizeRow: 10,
            mode: 'CTF',
            isVisible: true,
            mapArray: [{ tileType: 'grass', itemType: 'mushroom' }],
            dateOfLastModification: new Date(),
        };

        const dtoInstance = plainToInstance(UpdateMapDto, validDto);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(0);
    });

    it('should fail validation when missing required fields', async () => {
        const invalidDto: Partial<UpdateMapDto> = {
            name: 'Failed Map',
        };
        const dtoInstance = plainToInstance(UpdateMapDto, invalidDto);
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when mapArray is empty', async () => {
        const invalidDto: UpdateMapDto = {
            mapID: 'Su34Fullback',
            name: 'Fullback',
            sizeRow: 10,
            mode: 'CTF',
            isVisible: false,
            mapArray: [],
            dateOfLastModification: new Date(),
        };

        const dtoInstance = plainToInstance(UpdateMapDto, invalidDto);
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
