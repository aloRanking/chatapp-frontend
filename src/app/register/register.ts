import { Component } from '@angular/core';
import { AuthService } from '../auth-service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;
  email: string = '';
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$";

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get passwordsDoNotMatch(): boolean {
    return this.password !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  get passwordStrength(): number {
    if (!this.password) return 0;
    
    let strength = 0;
    if (this.password.length >= 8) strength++;
    if (/[a-z]/.test(this.password)) strength++;
    if (/[A-Z]/.test(this.password)) strength++;
    if (/[0-9]/.test(this.password)) strength++;
    if (/[@$!%*?&]/.test(this.password)) strength++;
    
    return Math.min(strength, 4);
  }

  getStrengthColor(level: number): string {
    const colors = ['#ff4444', '#ff8c42', '#ffd700', '#4caf50'];
    if (this.passwordStrength >= level) {
      return colors[level - 1];
    }
    return '#ddd';
  }

  getStrengthText(): string {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[this.passwordStrength];
  }

  async onSubmit() {
    if (this.passwordsDoNotMatch) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.authService.signUp(this.username, this.email, this.password);
      
      console.log('Registration successful:', result);
      this.successMessage = 'Registration successful! Redirecting to login...';
      
      this.successMessage = 'Registration successful! Please check your email for verification code.';
    
    // Redirect to confirmation page after 1.5 seconds
    setTimeout(() => {
      this.router.navigate(['/confirm'], { 
        queryParams: { username: this.username }
      });
    }, 1500);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific error messages
      if (error.message.includes('username exists')) {
        this.errorMessage = 'Username already exists';
      } else if (error.message.includes('password')) {
        this.errorMessage = 'Password does not meet requirements';
      } else {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

}
