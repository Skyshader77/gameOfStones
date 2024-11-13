import { Component, inject } from '@angular/core';
import { FightComponent } from '@app/components/fight/fight/fight.component';
import { MapComponent } from '@app/components/map/map.component';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';

@Component({
    selector: 'app-fight-test',
    standalone: true,
    imports: [FightComponent, MapComponent],
    templateUrl: './fight-test.component.html',
})
export class FightTestComponent {
    private renderState = inject(RenderingStateService);

    startTransition() {
        this.renderState.isInFightTransition = true;
    }

    isInFightRender() {
        return this.renderState.fightStarted;
    }
}
