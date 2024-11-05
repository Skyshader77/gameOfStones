export interface PlayerAbandonOutput{
    playerName:string;
    hasAbandoned:boolean;
}

export interface GameEndOutput {
    hasGameEnded: boolean;
    winningPlayerName: string;
}
