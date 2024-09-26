import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Item } from './item';
import { TileTerrain } from './tileTerrain';

export class Tile {
    @ApiProperty({ enum: TileTerrain })
    @IsEnum(TileTerrain)
    terrain: TileTerrain;

    @ApiProperty({ enum: Item })
    @IsEnum(Item)
    item: Item;
}
