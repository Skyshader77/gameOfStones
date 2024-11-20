import { Component, inject } from '@angular/core';
import { FightComponent } from '@app/components/fight/fight/fight.component';
import { MapComponent } from '@app/components/map/map.component';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';

@Component({
    selector: 'app-fight-test',
    standalone: true,
    imports: [FightComponent, MapComponent],
    templateUrl: './fight-test.component.html',
})
export class FightTestComponent {
    private renderState = inject(RenderingStateService);
    private fightRenderState = inject(FightRenderingService);

    startTransition() {
        this.renderState.isInFightTransition = true;
        this.fightRenderState.setPlayers();
    }

    isInFightRender() {
        return this.renderState.fightStarted;
    }
}
