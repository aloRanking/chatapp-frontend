import { Injectable } from '@angular/core';
import { signIn, signUp, signOut, getCurrentUser, confirmSignIn, resendSignUpCode, confirmSignUp } from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  async signUp(username: string, email: string, password: string) {
  

    try {
    const result = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email: email
        }
      }
    });
    return result;
  } catch (error: any) {
    // Re-throw with user-friendly message
    if (error.name === 'UsernameExistsException') {
      throw new Error('username exists');
    }
    if (error.name === 'InvalidPasswordException') {
      throw new Error('password');
    }
    throw error;
  }
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

  async confirmSignUp(username: string, confirmationCode: string) {
  try {
    const result = await confirmSignUp({
      username,
      confirmationCode
    });
    return result;
  } catch (error) {
    console.error('Confirmation failed:', error);
    throw error;
  }
}

async resendConfirmationCode(username: string) {
  try {
    const result = await resendSignUpCode({
      username
    });
    return result;
  } catch (error) {
    console.error('Resend code failed:', error);
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