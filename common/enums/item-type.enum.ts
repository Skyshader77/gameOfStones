export enum ItemType {
    BismuthShield,
    GlassStone,
    QuartzSkates,
    SapphireFins,
    GeodeBomb,
    GraniteHammer,
    Random,
    Start,
    Flag,
}

//TO DO: This is temporary: Replace by real defensive and offensive item names
export const OFFENSIVE_ITEMS: ItemType[] = [ItemType.GeodeBomb, ItemType.GraniteHammer];
export const DEFENSIVE_ITEMS: ItemType[] = [ItemType.BismuthShield];
