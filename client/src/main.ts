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

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', redirectTo: '/init', pathMatch: 'full' },
    { path: 'init', component: InitPageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'edit/:id', component: EditPageComponent },
    { path: 'edit', component: EditPageComponent },
    { path: 'room/:id', component: RoomPageComponent },
    { path: 'join', component: JoinPageComponent },
    { path: 'play', component: PlayPageComponent },
    { path: 'end', component: EndPageComponent },
    { path: '**', redirectTo: '/init' },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
