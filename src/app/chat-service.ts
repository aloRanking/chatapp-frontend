import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';



@Injectable({ providedIn: 'root' })
export class ChatService {

  private client = generateClient();
  createRoom(name: string) {
    return this.client.graphql({
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
  }

  sendMessage(roomId: string, content: string) {
    return this.client.graphql({
      query: `
        mutation SendMessage($roomId: ID!, $content: String!) {
          sendMessage(roomId: $roomId, content: $content) {
            content
            senderUsername
            createdAt
          }
        }
      `,
      variables: { roomId, content }
    });
  }

  getMessages(roomId: string) {
    return this.client.graphql({
      query: `
        query GetMessages($roomId: ID!) {
          getMessages(roomId: $roomId) {
            content
            senderUsername
            createdAt
          }
        }
      `,
      variables: { roomId }
    });
  }
}