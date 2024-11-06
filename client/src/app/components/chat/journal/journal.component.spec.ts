import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalComponent } from './journal.component';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { ElementRef } from '@angular/core';
import { MOCK_JOURNAL_LOG } from '@app/constants/tests.constants';
import { JournalLog } from '@common/interfaces/message';

describe('JournalComponent', () => {
    let component: JournalComponent;
    let fixture: ComponentFixture<JournalComponent>;
    let journalListService: jasmine.SpyObj<JournalListService>;

    beforeEach(async () => {
        journalListService = jasmine.createSpyObj('JournalListService', ['initializeJournal', 'cleanup'], {
            logs: [],
        });

        await TestBed.configureTestingModule({
            imports: [JournalComponent],
            providers: [{ provide: JournalListService, useValue: journalListService }],
        }).compileComponents();

        fixture = TestBed.createComponent(JournalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll to the bottom when new journal logs arrive', () => {
        interface TestComponent {
            journalContainer: ElementRef;
            scrollToBottom: () => void;
            ngAfterViewChecked: () => void;
        }

        const testComponent = {
            journalContainer: {
                nativeElement: {
                    scrollTop: 0,
                    scrollHeight: 1000,
                },
            } as ElementRef,
            scrollToBottom: jasmine.createSpy('scrollToBottom'),
            ngAfterViewChecked: () => {
                testComponent.scrollToBottom();
            },
        } as TestComponent;

        journalListService.logs.push(MOCK_JOURNAL_LOG);
        fixture.detectChanges();
        testComponent.ngAfterViewChecked();

        expect(testComponent.scrollToBottom).toHaveBeenCalled();
    });

    it('should display the log when onlyMyLogs is false', () => {
        component.onlyMyLogs = false;
        const log = { players: ['testPlayer', 'anotherPlayer'] } as JournalLog;
        const result = component.shouldDisplayLog(log);
        expect(result).toBe(true);
    });

    it('should not display the log when onlyMyLogs is true and log does not include current user', () => {
        component.onlyMyLogs = true;
        const log = { players: ['anotherPlayer', 'anotherPlayer2'] } as JournalLog;
        const result = component.shouldDisplayLog(log);
        expect(result).toBe(false);
    });
});
