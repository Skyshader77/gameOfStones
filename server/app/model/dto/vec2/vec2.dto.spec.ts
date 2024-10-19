import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Vec2Dto } from './vec2.dto';

describe('CreateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: Vec2Dto = {
            x: 1,
            y: -1,
        };

        const dtoInstance = plainToInstance(Vec2Dto, validDto);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(0);
    });

    it('should fail validation when missing required fields', async () => {
        const invalidDto: Partial<Vec2Dto> = {
            x: 0,
        };
        const dtoInstance = plainToInstance(Vec2Dto, invalidDto);
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'y',
                }),
            ]),
        );
    });

    it('should fail validation when field is not a number', async () => {
        const dtoInstance = plainToInstance(Vec2Dto, { x: 'im an intruder parameter', y: 'me too MOUHAHAHAHA' });
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'x',
                }),
                expect.objectContaining({
                    property: 'y',
                }),
            ]),
        );
    });
});
