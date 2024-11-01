import { Player } from "@app/interfaces/player";

export class Fight {
    fighters: Player[];
    numbEvasionsLeft: number[];
    currentFighter: string;
    hasPendingAction: boolean;
}

