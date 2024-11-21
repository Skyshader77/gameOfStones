import { ItemType } from '../enums/item-type.enum';

type ItemNameMap = Record<ItemType, string>;

export const ITEM_NAMES: ItemNameMap = {
    [ItemType.Boost1]: 'Potion bleue',
    [ItemType.Boost2]: 'Potion verte',
    [ItemType.Boost3]: 'Potion rouge',
    [ItemType.Boost4]: 'Épée titanesque',
    [ItemType.Boost5]: 'Armure ancienne',
    [ItemType.Boost6]: 'Hache barbarique',
    [ItemType.Random]: 'Item aléatoire',
    [ItemType.Start]: 'Point de départ',
    [ItemType.Flag]: 'Drapeau',
};
