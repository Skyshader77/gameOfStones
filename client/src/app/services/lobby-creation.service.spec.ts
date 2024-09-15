import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LobbyCreationService } from './lobby-creation.service';
import { MapAPIService } from './map-api.service';

describe('LobbyCreationService', () => {
    let service: LobbyCreationService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId']);
        TestBed.configureTestingModule({
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(LobbyCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
