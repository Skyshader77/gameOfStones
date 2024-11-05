import { JournalEntry } from '@common/enums/journal-entry.enum';
import { JournalLog, Message } from '@common/interfaces/message';

const MOCK_MESSAGE_JOURNAL: Message = {
    content: 'Othmane is King',
    time: new Date('1998-10-16'),
};

export const MOCK_JOURNAL_LOG: JournalLog = {
    message: MOCK_MESSAGE_JOURNAL,
    entry: JournalEntry.TurnStart,
    players: ['Player1', 'Player2'],
};
