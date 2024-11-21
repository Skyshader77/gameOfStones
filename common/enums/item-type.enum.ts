export enum ItemType {
    Boost1,
    Boost2,
    Boost3,
    Boost4,
    Boost5,
    Boost6,
    Random,
    Start,
    Flag,
}

//TO DO: This is temporary: Replace by real defensive and offensive item names
export const OFFENSIVE_ITEMS: ItemType[] = [ItemType.Boost4, ItemType.Boost6];
export const DEFENSIVE_ITEMS: ItemType[] = [ItemType.Boost5];
