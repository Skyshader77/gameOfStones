import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalComponent } from './journal.component';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { ElementRef } from '@angular/core';
import { JournalEntry } from '@common/interfaces/message';
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

    it('should initialize the journal on ngOnInit', () => {
        component.ngOnInit();
        expect(journalListService.initializeJournal).toHaveBeenCalled();
    });

    it('should scroll to the bottom when new journal logs arrive', () => {
        component.journalContainer = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 1000,
            },
        } as ElementRef;

        const scrollSpy = spyOn(component as any, 'scrollToBottom').and.callThrough();

        const newLog: JournalLog = {
            message: { content: 'New Game Turn Started', time: new Date() },
            entry: JournalEntry.TURN_START,
            isPrivate: false,
        };
        journalListService.logs.push(newLog);
        fixture.detectChanges();
        component.ngAfterViewChecked();

        expect(scrollSpy).toHaveBeenCalled();
    });

    it('should call cleanup on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(journalListService.cleanup).toHaveBeenCalled();
    });
});
