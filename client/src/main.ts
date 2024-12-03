import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { EndPageComponent } from '@app/pages/end-page/end-page.component';
import { InitPageComponent } from '@app/pages/init-page/init-page.component';
import { JoinPageComponent } from '@app/pages/join-page/join-page.component';
import { PlayPageComponent } from '@app/pages/play-page/play-page.component';
import { RoomPageComponent } from '@app/pages/room-page/room-page.component';
import { environment } from './environments/environment';
import { Pages } from '@app/interfaces/pages';

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', redirectTo: Pages.Init, pathMatch: 'full' },
    { path: Pages.Init, component: InitPageComponent },
    { path: Pages.Create, component: CreatePageComponent },
    { path: Pages.Admin, component: AdminPageComponent },
    { path: `${Pages.Edit}/:id`, component: EditPageComponent },
    { path: Pages.Edit, component: EditPageComponent },
    { path: `${Pages.Room}/:id`, component: RoomPageComponent },
    { path: Pages.Join, component: JoinPageComponent },
    { path: Pages.Play, component: PlayPageComponent },
    { path: Pages.End, component: EndPageComponent },
    { path: '**', redirectTo: `/${Pages.Init}` },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
