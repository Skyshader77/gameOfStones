import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMapDto } from './create-map.dto';

describe('CreateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: CreateMapDto = {
            mapID: 'Mig31Foxhound',
            name: 'Foxhound',
            sizeRow: 10,
            mode: 'CTF',
            isVisible: true,
            mapArray: [{ tileType: 'grass', itemType: 'mushroom' }],
            dateOfLastModification: new Date(),
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
                    property: 'mapID',
                }),
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
                    property: 'dateOfLastModification',
                }),
                expect.objectContaining({
                    property: 'isVisible',
                }),
            ]),
        );
    });

    it('should fail validation when mapArray is empty', async () => {
        const invalidDto: CreateMapDto = {
            mapID: 'Su34Fullback',
            name: 'Fullback',
            sizeRow: 10,
            mode: 'CTF',
            isVisible: false,
            mapArray: [],
            dateOfLastModification: new Date(),
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
