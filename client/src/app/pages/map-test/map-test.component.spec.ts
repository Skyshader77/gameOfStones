import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTestComponent } from './map-test.component';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { MOCK_MAPS } from '@app/constants/tests.constants';
import { of } from 'rxjs';

describe('MapTestComponent', () => {
    let component: MapTestComponent;
    let fixture: ComponentFixture<MapTestComponent>;

    let mapAPISpy: jasmine.SpyObj<MapAPIService>;

    beforeEach(async () => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMapById']);
        mapAPISpy.getMapById.and.returnValue(of(MOCK_MAPS[0]));
        await TestBed.configureTestingModule({
            imports: [MapTestComponent],
            providers: [{ provide: MapAPIService, mapAPISpy, useValue: mapAPISpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
