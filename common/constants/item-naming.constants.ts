import { ItemType } from '../enums/item-type.enum';

type ItemNameMap = Record<ItemType, string>;

export const ITEM_NAMES: ItemNameMap = {
    [ItemType.BismuthShield]: 'Bouclier de bismuth',
    [ItemType.GlassStone]: 'Pierre de verre',
    [ItemType.QuartzSkates]: 'Patin de quartz',
    [ItemType.SapphireFins]: 'Palmes de sapphire',
    [ItemType.GeodeBomb]: 'Bombe de geode',
    [ItemType.GraniteHammer]: 'Marteau de granite',
    [ItemType.Random]: 'Item aléatoire',
    [ItemType.Start]: 'Point de départ',
    [ItemType.Flag]: 'Drapeau',
};
