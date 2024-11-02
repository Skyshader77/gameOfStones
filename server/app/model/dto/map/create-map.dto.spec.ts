import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMapDto } from './create-map.dto';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

describe('CreateMapDto', () => {
    it('should succeed validation for valid DTO', async () => {
        const validDto: CreateMapDto = {
            name: 'Foxhound',
            size: 10,
            mode: GameMode.CTF,
            mapArray: [[TileTerrain.ClosedDoor]],
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

    it('should fail validation if mapArray is a list of tile terrain', async () => {
        const dtoInstance = plainToInstance(CreateMapDto, {
            name: 'Fullback',
            size: 10,
            mode: GameMode.CTF,
            mapArray: [TileTerrain.Grass],
            description: 'A map for the Fullback',
            placedItems: [],
            imageData: 'test',
        });
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'mapArray',
                    constraints: {
                        is2dEnum: 'mapArray must be a 2D array of TileTerrain',
                    },
                }),
            ]),
        );
    });

    it('should fail validation if mapArray is a matrix of another enum', async () => {
        enum MockEnum {
            WE,
            LOVE,
            YOU,
            VERY,
            MUCH,
            OTHMANE,
            AZZAM,
        }

        const dtoInstance = plainToInstance(CreateMapDto, {
            name: 'Fullback',
            size: 10,
            mode: GameMode.CTF,
            mapArray: [[MockEnum.OTHMANE], [MockEnum.AZZAM]],
            description: 'A map for the Fullback',
            placedItems: [],
            imageData: 'test',
        });
        const errors = await validate(dtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: 'mapArray',
                    constraints: {
                        is2dEnum: 'mapArray must be a 2D array of TileTerrain',
                    },
                }),
            ]),
        );
    });
});
