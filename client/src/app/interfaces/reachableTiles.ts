

// Define the result type for reachable tiles
export interface ReachableTile {
    x: number;
    y: number;
    remainingSpeed: number;
    path: string[]; // Add path property to store the directions
}
