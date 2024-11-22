import { TestBed } from '@angular/core/testing';
import { MOCK_JOURNAL_LOG } from '@app/constants/tests.constants';
import { JournalLog } from '@common/interfaces/message';
import { of, Subscription } from 'rxjs';
import { JournalListService } from './journal-list.service';
import { MessagingSocketService } from '../communication-services/messaging-socket/messaging-socket.service';

describe('JournalListService', () => {
    let service: JournalListService;
    let messagingSocketServiceSpy: jasmine.SpyObj<MessagingSocketService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MessagingSocketService', ['listenToJournal']);

        TestBed.configureTestingModule({
            providers: [JournalListService, { provide: MessagingSocketService, useValue: spy }],
        });

        service = TestBed.inject(JournalListService);
        messagingSocketServiceSpy = TestBed.inject(MessagingSocketService) as jasmine.SpyObj<MessagingSocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('startJournal should initialize journalLogs to an empty array', () => {
        service.startJournal();
        expect(service.logs).toEqual([]);
    });

    it('initializeJournal should subscribe to journal logs and push them to journalLogs', () => {
        const journalLog: JournalLog = MOCK_JOURNAL_LOG;
        messagingSocketServiceSpy.listenToJournal.and.returnValue(of(journalLog));

        service.initializeJournal();

        expect(service.logs).toEqual([journalLog]);
    });

    it('initializeJournal should call cleanup to unsubscribe if journalSubscription exists', () => {
        const journalLog: JournalLog = MOCK_JOURNAL_LOG;
        messagingSocketServiceSpy.listenToJournal.and.returnValue(of(journalLog));

        service.initializeJournal();
        service.cleanup = jasmine.createSpy('cleanup');

        service.initializeJournal();
        expect(service.cleanup).toHaveBeenCalled();
    });

    it('cleanup should unsubscribe from journalSubscription if it exists', () => {
        const journalLog: JournalLog = MOCK_JOURNAL_LOG;
        messagingSocketServiceSpy.listenToJournal.and.returnValue(of(journalLog));
        service.initializeJournal();
        service['journalSubscription'] = new Subscription();

        spyOn(service['journalSubscription'], 'unsubscribe');

        service.cleanup();
        expect(service['journalSubscription'].unsubscribe).toHaveBeenCalled();
    });
});
