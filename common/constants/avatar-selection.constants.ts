import { Avatar } from "@common/enums/avatar.enum";

export const INITIAL_AVATAR_SELECTION: Map<Avatar, boolean> = new Map([
    [Avatar.FemaleHealer, false],
    [Avatar.MaleHealer, false],
    [Avatar.FemaleMage, false],
    [Avatar.MaleMage, false],
    [Avatar.FemaleNinja, false],
    [Avatar.MaleNinja, false],
    [Avatar.FemaleRanger, false],
    [Avatar.MaleRanger, false],
    [Avatar.FemaleTownFolk, false],
    [Avatar.MaleTownFolk, false],
    [Avatar.FemaleWarrior, false],
    [Avatar.MaleWarrior, false],
]);
