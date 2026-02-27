import { Amplify } from 'aws-amplify';
import { environment } from '../environments/environment';

export function configureAmplify() {

  Amplify.configure({
    Auth: {
     Cognito:{
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
}