import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { Direction } from '@common/interfaces/move';

export const MOCK_TURN_INFORMATION: TurnInformation = {
    attributes: {
        hp: 100,
        attack: 15,
        defense: 10,
        speed: 5,
    },
    reachableTiles: [
        {
            position: { x: 2, y: 3 },
            remainingMovement: 3,
            path: [
                { direction: Direction.DOWN, remainingMovement: 4 },
                { direction: Direction.DOWN, remainingMovement: 3 },
            ],
            cost: 2,
        },
        {
            position: { x: 4, y: 1 },
            remainingMovement: 1,
            path: [
                { direction: Direction.DOWN, remainingMovement: 2 },
                { direction: Direction.DOWN, remainingMovement: 1 },
            ],
            cost: 4,
        },
    ],
    actions: [
        { action: OverWorldActionType.Door, position: { x: 0, y: 0 } },
        { action: OverWorldActionType.Door, position: { x: 0, y: 0 } },
    ], // Replace with actual OverWorldAction types
    itemActions: [
        {
            overWorldAction: {
                action: OverWorldActionType.Bomb,
                position: { x: 0, y: 0 }, // Replace with actual OverWorldAction type
            },
            affectedTiles: [],
        },
    ],
};
