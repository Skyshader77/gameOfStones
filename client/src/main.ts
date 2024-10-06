import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { InitPageComponent } from '@app/pages/init-page/init-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { environment } from './environments/environment';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';

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
    { path: 'lobby/:id', component: LobbyPageComponent },
    //      Will be used in future sprints 
    // { path: 'join', component: JoinPageComponent },
    // { path: 'play', component: PlayPageComponent },
    // { path: 'end', component: EndPageComponent },
    // temp chat pag
    { path: 'chat', component: ChatPageComponent },
    { path: '**', redirectTo: '/init' },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
