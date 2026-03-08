import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { Observable } from 'rxjs';
import { Room } from './models/room';

interface CreateRoomResponse {
  roomId: string;
  name: string;
  createdAt: string;
}

interface Message {
  content: string;
  senderUsername: string;
  createdAt: string;
}

interface MessageSubscription {
  messageId: string;
  roomId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

interface GraphQLResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private client = generateClient();
  async createRoom(name: string) {
    const res : any = await this.client.graphql({
      query: `
        mutation CreateRoom($name: String!) {
          createRoom(name: $name) {
            roomId
            name
            createdAt
          }
        }
      `,
      variables: { name }
    });
    return res.data.createRoom;

  }


  async getRooms() {
  const res : any = await this.client.graphql({
      query: `
        query GetRooms {
          listRooms {
              roomId
              name
              createdAt
            
          }
        }
      `
    });

    const rooms: Room[] = res.data.listRooms;
    console.log('Fetched rooms:', rooms);
    return rooms;
  } 

  sendMessage(roomId: string, content: string) {
    return this.client.graphql({
      query: `
        mutation SendMessage($roomId: ID!, $content: String!) {
          sendMessage(roomId: $roomId, content: $content) {
          messageId
          roomId
          senderUsername
          content
          createdAt
          }
        }
      `,
      variables: { roomId, content }
    });
  }

  async getMessages(roomId: string) {
    const res : any = await this.client.graphql({
      query: `
        query GetMessages($roomId: ID!) {
          getMessages(roomId: $roomId) {
            roomId
            content
            senderUsername
            createdAt
          }
        }
      `,
      variables: { roomId }
    });

    const messages = res.data.getMessages;
    console.log('Fetched messages:', messages);
    return messages;
  }

  subscribeToMessages(roomId: string): Observable<any> {
    console.log('Subscription started for room:', roomId);
  return this.client.graphql({
    query: `
      subscription OnMessageSent($roomId: ID!) {
        onMessageSent(roomId: $roomId) {
          messageId
          roomId
          senderUsername
          content
          createdAt
        }
      }
    `,
    variables: { roomId }
  }) as any;
}

//   subscribeToMessages(roomId: string): Observable<MessageSubscription> {
//   return new Observable<MessageSubscription>((observer) => {
//     console.log('Opening subscription for room:', roomId);

//       const sub = this.client.graphql({
//         query: `
//           subscription OnMessageSent($roomId: ID!) {
//             onMessageSent(roomId: $roomId) {
//               messageId
//               roomId
//               senderUsername
//               content
//               createdAt
//             }
//           }
//         `,
//       variables: { roomId }
//     }) as any;

//     const subscription = sub.subscribe({
//       next: ({ data }: any) => {
//         console.log('Subscription event received', data);
//         observer.next(data.onMessageSent);
//       },
//       error: (err: any) => {
//         console.error('Subscription error', err);
//         observer.error(err);
//       }
//     });

//     return () => {
//       console.log('Unsubscribing from room:', roomId);
//       subscription.unsubscribe();
//     };
//   });
// }

// Helper method for testing arbitrary GraphQL queries
async testGraphQLQuery(query: string, variables?: any) {
  return this.client.graphql({
    query,
    variables
  });
}


}