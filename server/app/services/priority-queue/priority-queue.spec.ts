import { PriorityQueue } from './priorityQueue';

describe('PriorityQueue', () => {
    let pq: PriorityQueue<string>;

    beforeEach(() => {
        pq = new PriorityQueue<string>();
    });

    test('should create an empty queue', () => {
        expect(pq.isEmpty()).toBe(true);
    });

    test('should enqueue and dequeue a single item', () => {
        pq.enqueue('item', 1);
        expect(pq.isEmpty()).toBe(false);
        expect(pq.dequeue()).toBe('item');
        expect(pq.isEmpty()).toBe(true);
    });

    test('should dequeue items in priority order', () => {
        pq.enqueue('low', 2 + 1);
        pq.enqueue('high', 1);
        pq.enqueue('medium', 2);

        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('medium');
        expect(pq.dequeue()).toBe('low');
    });

    test('should handle duplicate priorities', () => {
        pq.enqueue('first', 1);
        pq.enqueue('second', 1);
        pq.enqueue('third', 1);

        expect(pq.dequeue()).toBe('first');
        expect(pq.dequeue()).toBe('second');
        expect(pq.dequeue()).toBe('third');
    });

    test('should return undefined when dequeueing from an empty queue', () => {
        expect(pq.dequeue()).toBeUndefined();
    });
});
