import { Message } from './message.schema';

describe('Message', () => {
    it('should create a Message instance', () => {
        const message = new Message();
        expect(message).toBeDefined();
    });

    it('should have a title property of type string', () => {
        const message = new Message();
        message.title = 'Mon Message';
        expect(typeof message.title).toBe('string');
        expect(message.title).toBe('Mon Message');
    });

    it('should have a body property of type string', () => {
        const message = new Message();
        message.body = 'Je suis envoyé à partir de la documentation!';
        expect(typeof message.body).toBe('string');
        expect(message.body).toBe('Je suis envoyé à partir de la documentation!');
    });
});
