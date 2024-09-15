import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMode } from '@app/interfaces/map';
import { MapSelectionService } from '@app/services/map-selection.service';
import { MapInfoComponent } from './map-info.component';

describe('MapInfoComponent', () => {
    let component: MapInfoComponent;
    let fixture: ComponentFixture<MapInfoComponent>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap'], {
            maps: [
                {
                    _id: '0',
                    name: 'Mock Map 1',
                    mapDescription: '',
                    sizeRow: 0,
                    mode: GameMode.NORMAL,
                    mapArray: [],
                    isVisible: true,
                    dateOfLastModification: new Date(),
                },
                {
                    _id: '1',
                    name: 'Mock Map 2',
                    mapDescription: '',
                    sizeRow: 0,
                    mode: GameMode.NORMAL,
                    mapArray: [],
                    isVisible: true,
                    dateOfLastModification: new Date(),
                },
            ],
            selectedMap: {
                _id: '0',
                name: 'Mock Map 1',
                mapDescription: '',
                sizeRow: 0,
                mode: GameMode.NORMAL,
                mapArray: [],
                isVisible: true,
                dateOfLastModification: new Date(),
            },
        });

        await TestBed.configureTestingModule({
            imports: [MapInfoComponent],
            providers: [{ provide: MapSelectionService, useValue: mapSelectionSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
