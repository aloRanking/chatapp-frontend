import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth-service';


@Component({
  selector: 'app-confirm-signup',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './confirm-signup.html',
  styleUrl: './confirm-signup.css',
})
export class ConfirmSignup implements OnInit {

  username: string = '';
  usernameInput: string = '';
  code: string = '';
  
  error: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  resendDisabled: boolean = false;
  countdown: number = 60;
  countdownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if username was passed in URL
    this.route.queryParams.subscribe(params => {
      if (params['username']) {
        this.username = params['username'];
      }
    });
  }

  async onConfirm() {
    const usernameToUse = this.username || this.usernameInput;
    
    if (!usernameToUse) {
      this.error = 'Username is required';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.confirmSignUp(usernameToUse, this.code);
      this.successMessage = 'Account verified successfully! Redirecting to login...';
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      if (error.message?.includes('CodeMismatch')) {
        this.error = 'Invalid verification code';
      } else if (error.message?.includes('ExpiredCode')) {
        this.error = 'Code has expired. Please request a new one.';
      } else {
        this.error = error.message || 'Verification failed';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async resendCode() {
    const usernameToUse = this.username || this.usernameInput;
    
    if (!usernameToUse) {
      this.error = 'Username is required';
      return;
    }

    try {
      await this.authService.resendConfirmationCode(usernameToUse);
      
      // Start countdown
      this.resendDisabled = true;
      this.countdown = 60;
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          this.resendDisabled = false;
          clearInterval(this.countdownInterval);
        }
      }, 1000);

      this.successMessage = 'Verification code resent!';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.error = error.message || 'Failed to resend code';
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

}
