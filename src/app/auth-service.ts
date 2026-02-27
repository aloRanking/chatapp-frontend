import { Injectable } from '@angular/core';
import { signIn, signUp, signOut, getCurrentUser, confirmSignIn } from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  signUp(username: string, password: string) {
    return signUp({
      username,
      password
    });
  }

  async signIn(username: string, password: string) {
    try {
      const result = await signIn({
        username,
        password
      });
      
      // Check if we need to handle new password challenge
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Return the challenge info to the component
        return {
          requiresNewPassword: true,
          username,
          session: result
        };
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmNewPassword(username: string, newPassword: string, session: any) {
    try {
      const result = await confirmSignIn({
        challengeResponse: newPassword
      });
      return result;
    } catch (error) {
      throw error;
    }
  }


  signOut() {
    return signOut();
  }

  currentUser() {
    return getCurrentUser();
  }
}