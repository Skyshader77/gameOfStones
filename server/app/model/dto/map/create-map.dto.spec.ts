import { GameMode } from '@app/interfaces/gamemode';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMapDto } from './create-map.dto';

describe('CreateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: CreateMapDto = {
            name: 'Foxhound',
            size: 10,
            mode: GameMode.CTF,
            mapArray: [[TileTerrain.CLOSEDDOOR]],
            description: 'A map for the Foxhound',
            placedItems: [],
            imageData: 'asnfaf',
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
                    property: 'size',
                }),
                expect.objectContaining({
                    property: 'mode',
                }),
                expect.objectContaining({
                    property: 'mapArray',
                }),
                expect.objectContaining({
                    property: 'description',
                }),
                expect.objectContaining({
                    property: 'placedItems',
                }),
                expect.objectContaining({
                    property: 'imageData',
                }),
            ]),
        );
    });

    it('should fail validation when mapArray is empty', async () => {
        const invalidDto: CreateMapDto = {
            name: 'Fullback',
            size: 10,
            mode: GameMode.CTF,
            mapArray: [],
            description: 'A map for the Fullback',
            placedItems: [],
            imageData: 'test',
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
