import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service';
import { NewPasswordComponent } from "../new-password";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, NewPasswordComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
 username: string = '';
  password: string = '';
  error: string = '';
  
  showNewPassword: boolean = false;
  session: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    try {
      const result = await this.authService.signIn(this.username, this.password);
      
      if (result && (result as any).requiresNewPassword) {
        // Show new password component
        this.showNewPassword = true;
        this.session = (result as any).session;
      } else {
        // Normal login, go to dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      if((error as any).message === 'There is already a signed in user.') {
        this.router.navigate(['/dashboard']);
      }else
      this.error = error.message || 'Login failed';
    }
  }

  async onPasswordChanged(event: {newPassword: string, session: any}) {
    try {
      await this.authService.confirmNewPassword(
        this.username, 
        event.newPassword, 
        event.session
      );
      
      // Try logging in again with new password
      await this.authService.signIn(this.username, event.newPassword);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.error = error.message || 'Failed to set new password';
      this.showNewPassword = false;
    }
  }

  onPasswordCancelled() {
    this.showNewPassword = false;
    this.password = '';
  }

}
