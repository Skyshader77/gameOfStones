import { IsEnum } from 'class-validator';
import { Item } from './item';
import { TileTerrain } from './tileTerrain';

export class Tile {
    @IsEnum(TileTerrain)
    terrain: TileTerrain;

    @IsEnum(Item)
    item: Item;
}
