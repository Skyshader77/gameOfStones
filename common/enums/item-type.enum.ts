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

export const OFFENSIVE_ITEMS: ItemType[] = [ItemType.GeodeBomb, ItemType.GraniteHammer];
export const DEFENSIVE_ITEMS: ItemType[] = [ItemType.BismuthShield];
