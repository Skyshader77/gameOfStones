import { Params } from '@angular/router';
import { Observable } from 'rxjs';

export interface MockActivatedRoute {
    snapshot: {
        paramMap: {
            get: jasmine.Spy;
        };
    };
    queryParams: Observable<Params>;
}
