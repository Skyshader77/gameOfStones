export class PriorityQueue<T> {
    private heap: { element: T; priority: number; order: number }[] = [];
    private orderCounter = 0;

    constructor(
        private comparator: (a: { priority: number; order: number }, b: { priority: number; order: number }) => number = (a, b) =>
            a.priority - b.priority || a.order - b.order,
    ) {}

    enqueue(element: T, priority: number): void {
        this.heap.push({ element, priority, order: this.orderCounter++ });
        this.percolateUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const root = this.heap[0].element;
        const last = this.heap.pop();
        if (last !== undefined && this.heap.length > 0) {
            this.heap[0] = last;
            this.percolateDown(0);
        }
        return root;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private percolateUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private percolateDown(index: number): void {
        const heapSize = this.heap.length;
        while (index < heapSize) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < heapSize && this.comparator(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }

            if (rightChild < heapSize && this.comparator(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}
