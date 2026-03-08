import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard';
import { Chat } from './chat/chat';
import { ConfirmSignup } from './confirm-signup/confirm-signup';

export const routes: Routes = [
    { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'chat', component: Chat },
  { path: 'confirm', component: ConfirmSignup }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
