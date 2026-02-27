import { Amplify } from 'aws-amplify';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// Configure Amplify IMMEDIATELY at the top
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.userPoolId,
      userPoolClientId: environment.userPoolClientId,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: false,
        username: true,
        phone: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: environment.graphqlEndpoint,
      region: environment.region,
      defaultAuthMode: 'userPool'
    }
  }
});

setTimeout(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}, 0);