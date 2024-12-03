import { Avatar } from '@common/enums/avatar.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ITEM_TO_STRING_MAP, TERRAIN_TO_STRING_MAP } from './conversion.constants';

export const AVATAR_FOLDER = 'assets/avatar/';
export const SPRITE_FOLDER = 'assets/sprites/';
export const ITEM_FOLDER = 'assets/items/';
export const FLAME_FOLDER = 'assets/flames/';
export const TILE_FOLDER = 'assets/tiles/';
export const SPRITE_FILE_EXTENSION = '.png';

type AvatarAssetMap = { [key in Avatar]: string };
type ItemAssetMap = { [key in ItemType]: string };
type TileAssetMap = { [key in TileTerrain]: string };

export const AVATAR_PROFILE: AvatarAssetMap = {
    [Avatar.FemaleHealer]: AVATAR_FOLDER + 'clericF.jpeg',
    [Avatar.MaleHealer]: AVATAR_FOLDER + 'clericM.jpeg',
    [Avatar.FemaleMage]: AVATAR_FOLDER + 'mageF.jpeg',
    [Avatar.MaleMage]: AVATAR_FOLDER + 'mageM.jpeg',
    [Avatar.FemaleNinja]: AVATAR_FOLDER + 'ninjaF.jpeg',
    [Avatar.MaleNinja]: AVATAR_FOLDER + 'ninjaM.jpeg',
    [Avatar.FemaleRanger]: AVATAR_FOLDER + 'rangerF.jpeg',
    [Avatar.MaleRanger]: AVATAR_FOLDER + 'rangerM.jpeg',
    [Avatar.FemaleTownFolk]: AVATAR_FOLDER + 'merchantF.jpeg',
    [Avatar.MaleTownFolk]: AVATAR_FOLDER + 'merchantM.jpeg',
    [Avatar.FemaleWarrior]: AVATAR_FOLDER + 'warriorF.jpeg',
    [Avatar.MaleWarrior]: AVATAR_FOLDER + 'warriorM.jpeg',
};

export const AVATAR_SPRITE_SHEET: AvatarAssetMap = {
    [Avatar.FemaleHealer]: SPRITE_FOLDER + 'healer_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleHealer]: SPRITE_FOLDER + 'healer_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleMage]: SPRITE_FOLDER + 'mage_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleMage]: SPRITE_FOLDER + 'mage_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleNinja]: SPRITE_FOLDER + 'ninja_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleNinja]: SPRITE_FOLDER + 'ninja_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleRanger]: SPRITE_FOLDER + 'ranger_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleRanger]: SPRITE_FOLDER + 'ranger_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleTownFolk]: SPRITE_FOLDER + 'townfolk1_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleTownFolk]: SPRITE_FOLDER + 'townfolk1_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleWarrior]: SPRITE_FOLDER + 'warrior_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleWarrior]: SPRITE_FOLDER + 'warrior_m' + SPRITE_FILE_EXTENSION,
};

export const AVATAR_FIGHT_SPRITE: AvatarAssetMap = {
    [Avatar.FemaleHealer]: SPRITE_FOLDER + 'clericf_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleHealer]: SPRITE_FOLDER + 'clericm_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleMage]: SPRITE_FOLDER + 'magef_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleMage]: SPRITE_FOLDER + 'magem_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleNinja]: SPRITE_FOLDER + 'ninjaf_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleNinja]: SPRITE_FOLDER + 'ninja_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleRanger]: SPRITE_FOLDER + 'rangerf_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleRanger]: SPRITE_FOLDER + 'rangerm_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleTownFolk]: SPRITE_FOLDER + 'townfolkf_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleTownFolk]: SPRITE_FOLDER + 'townfolkm_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleWarrior]: SPRITE_FOLDER + 'warriorf_fight' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleWarrior]: SPRITE_FOLDER + 'warrior_fight' + SPRITE_FILE_EXTENSION,
};

export const ITEM_PATHS: ItemAssetMap = {
    [ItemType.BismuthShield]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.BismuthShield] + SPRITE_FILE_EXTENSION,
    [ItemType.GlassStone]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GlassStone] + SPRITE_FILE_EXTENSION,
    [ItemType.QuartzSkates]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.QuartzSkates] + SPRITE_FILE_EXTENSION,
    [ItemType.SapphireFins]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.SapphireFins] + SPRITE_FILE_EXTENSION,
    [ItemType.GeodeBomb]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GeodeBomb] + SPRITE_FILE_EXTENSION,
    [ItemType.GraniteHammer]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GraniteHammer] + SPRITE_FILE_EXTENSION,
    [ItemType.Random]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Random] + SPRITE_FILE_EXTENSION,
    [ItemType.Start]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Start] + SPRITE_FILE_EXTENSION,
    [ItemType.Flag]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Flag] + SPRITE_FILE_EXTENSION,
};

export const TILE_PATHS: TileAssetMap = {
    [TileTerrain.ClosedDoor]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.ClosedDoor] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Grass]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Grass] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Ice]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Ice] + SPRITE_FILE_EXTENSION,
    [TileTerrain.OpenDoor]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.OpenDoor] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Wall]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Wall] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Water]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Water] + SPRITE_FILE_EXTENSION,
};

export const FLAME_PATHS: AvatarAssetMap = {
    [Avatar.FemaleHealer]: FLAME_FOLDER + 'healer_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleHealer]: FLAME_FOLDER + 'healer_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleMage]: FLAME_FOLDER + 'mage_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleMage]: FLAME_FOLDER + 'mage_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleNinja]: FLAME_FOLDER + 'ninja_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleNinja]: FLAME_FOLDER + 'ninja_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleRanger]: FLAME_FOLDER + 'ranger_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleRanger]: FLAME_FOLDER + 'ranger_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleTownFolk]: FLAME_FOLDER + 'townfolk_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleTownFolk]: FLAME_FOLDER + 'townfolk_m' + SPRITE_FILE_EXTENSION,
    [Avatar.FemaleWarrior]: FLAME_FOLDER + 'warrior_f' + SPRITE_FILE_EXTENSION,
    [Avatar.MaleWarrior]: FLAME_FOLDER + 'warrior_m' + SPRITE_FILE_EXTENSION,
};
