import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEAM_NAMES, TEAM_NUMBER } from '@app/constants/team.constants';

@Component({
    selector: 'app-init-page',
    standalone: true,
    templateUrl: './init-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule],
})
export class InitPageComponent {
    teamNumber = TEAM_NUMBER;
    teamNames = TEAM_NAMES;
}
