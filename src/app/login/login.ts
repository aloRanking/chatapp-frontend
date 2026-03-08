import { Component } from '@angular/core';

import { AuthService } from '../auth-service';
import { NewPasswordComponent } from "../new-password";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, NewPasswordComponent, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showDemoCredentials: boolean = true; // Set to false to hide
  
  error: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  session: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    if (!this.username || !this.password) return;
    
    this.isLoading = true;
    this.error = '';
    
    try {
      const result = await this.authService.signIn(this.username, this.password);
      
      if (result && (result as any).requiresNewPassword) {
        this.showNewPassword = true;
        this.session = (result as any).session;
      } else {
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/chat']);
        }, 1000);
      }
    } catch (error: any) {
      if((error as any).message === 'There is already a signed in user.') {
        this.router.navigate(['/chat']);
      }else
      
      this.error = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  async onPasswordChanged(event: {newPassword: string, session: any}) {
    this.isLoading = true;
    this.error = '';
    
    try {
      await this.authService.confirmNewPassword(
        this.username, 
        event.newPassword, 
        event.session
      );
      
      // Auto-login with new password
      await this.authService.signIn(this.username, event.newPassword);
      this.successMessage = 'Password updated! Redirecting...';
      
      setTimeout(() => {
        this.router.navigate(['/chat']);
      }, 1000);
    } catch (error: any) {
      this.error = this.getErrorMessage(error);
      this.showNewPassword = false;
    } finally {
      this.isLoading = false;
    }
  }

  onPasswordCancelled() {
    this.showNewPassword = false;
    this.password = '';
    this.session = null;
  }

  fillDemoCredentials() {
    this.username = 'alobaba';
    this.password = 'Alo123456';
  }

  private getErrorMessage(error: any): string {
    if (error.message?.includes('Incorrect username or password')) {
      return 'Invalid username or password';
    }
    if (error.message?.includes('User is not confirmed')) {
      return 'Please verify your email first';
    }
    if (error.message?.includes('UserNotFoundException')) {
      return 'User does not exist';
    }
    if (error.message?.includes('NotAuthorizedException')) {
      return 'Incorrect username or password';
    }
    if (error.message?.includes('PasswordResetRequiredException')) {
      return 'Password reset required';
    }
    return error.message || 'Login failed. Please try again.';
  }

}
