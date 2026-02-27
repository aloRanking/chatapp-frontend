import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>Set New Password</h2>
      <p style="color: #666;">You need to change your password before continuing.</p>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 5px;">Username:</label>
        <input [value]="username" disabled style="width: 100%; padding: 8px; background: #f5f5f5;">
      </div>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 5px;">New Password:</label>
        <input 
          type="password" 
          [(ngModel)]="newPassword" 
          placeholder="Enter new password"
          style="width: 100%; padding: 8px;">
        <small style="color: #666; display: block; margin-top: 5px;">
          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
        </small>
      </div>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 5px;">Confirm Password:</label>
        <input 
          type="password" 
          [(ngModel)]="confirmPassword" 
          placeholder="Confirm new password"
          style="width: 100%; padding: 8px;">
      </div>
      
      <div *ngIf="passwordError" style="color: red; margin: 10px 0;">
        {{ passwordError }}
      </div>
      
      <button 
        (click)="onSubmit()" 
        [disabled]="!isFormValid()"
        style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Change Password
      </button>

      


    </div>
  `
})
export class NewPasswordComponent {
  @Input() username: string = '';
  @Input() session: any;
  @Output() passwordChanged = new EventEmitter<{newPassword: string, session: any}>();
  @Output() cancelled = new EventEmitter<void>();

  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';

  isFormValid(): boolean {
    return this.newPassword.length >= 8 && 
           this.newPassword === this.confirmPassword;
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    
    
    // Basic password strength check
    const hasUpperCase = /[A-Z]/.test(this.newPassword);
    const hasLowerCase = /[a-z]/.test(this.newPassword);
    const hasNumbers = /\d/.test(this.newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers /*&& hasSpecial*/)) {
      this.passwordError = 'Password must contain uppercase, lowercase, number, and special character';
      return;
    }
    
    this.passwordChanged.emit({
      newPassword: this.newPassword,
      session: this.session
    });
  }
}