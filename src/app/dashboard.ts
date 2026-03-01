import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../app/auth-service';
import { ChatService } from '../app/chat-service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>🔐 AWS Amplify Test Dashboard</h2>

      <span>
<button (click)="gotoChat()">Goto Chat</button>

      </span>
      
      <!-- Proof 1: Cognito Auth -->
      <div style="border: 2px solid #646cff; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>✅ 1. Cognito Authentication</h3>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">
Current User: {{ currentUser | json }}
Auth Status: <span [style.color]="currentUser ? 'green' : 'red'">{{ currentUser ? 'AUTHENTICATED' : 'NOT AUTHENTICATED' }}</span>
        </pre>
        <button (click)="testAuth()" style="padding: 8px 16px;">🔄 Refresh Auth Status</button>
      </div>

      <!-- Proof 2: JWT Token -->
      <div style="border: 2px solid #42b883; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>🔑 2. JWT Token</h3>
        <button (click)="showToken = !showToken" style="padding: 8px 16px; margin-right: 10px;">
          {{ showToken ? 'Hide' : 'Show' }} Token
        </button>
        <button (click)="decodeToken()" style="padding: 8px 16px;">🔍 Decode Token</button>
        <pre *ngIf="showToken" style="background: #f4f4f4; padding: 10px; border-radius: 4px; margin-top: 10px; overflow-x: auto;">
{{ token || 'Click "Refresh Auth Status" first' }}
        </pre>
        <pre *ngIf="decodedToken" style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-top: 10px;">
{{ decodedToken | json }}
        </pre>
      </div>

      <!-- Proof 3: AppSync Resolvers -->
      <div style="border: 2px solid #ff6b6b; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>⚡ 3. AppSync Resolvers</h3>
        
        <!-- NEW: Test List Rooms -->
        <div style="margin-bottom: 30px; background: #f0f0f0; padding: 15px; border-radius: 8px;">
          <h4 style="margin-top: 0;">📋 Test List Rooms:</h4>
          <button (click)="testListRooms()" style="padding: 8px 16px; background: #9c27b0; color: white; border: none; border-radius: 4px;">
            Get All Rooms
          </button>
          <button (click)="testGetRoom(roomIdInput.value)" style="padding: 8px 16px; margin-left: 10px; background: #ff9800; color: white; border: none; border-radius: 4px;">
            Get Single Room
          </button>
          <div style="margin-top: 10px;">
            <input #roomIdInput placeholder="Enter Room ID for single room query" style="width: 300px; padding: 8px; margin-right: 10px;">
          </div>
        </div>
        
        <!-- Test Room Creation -->
        <div style="margin-bottom: 20px;">
          <h4>Test Room Creation:</h4>
          <input #roomName placeholder="Room name" style="padding: 8px; margin-right: 10px;">
          <button (click)="testCreateRoom(roomName.value); roomName.value=''" style="padding: 8px 16px;">Create Room</button>
        </div>

        <!-- Test Send Message -->
        <div style="margin-bottom: 20px;">
          <h4>Test Send Message:</h4>
          <input #roomId placeholder="Room ID" style="padding: 8px; margin-right: 10px; width: 200px;">
          <input #msgContent placeholder="Message" style="padding: 8px; margin-right: 10px;">
          <button (click)="testSendMessage(roomId.value, msgContent.value); msgContent.value=''" style="padding: 8px 16px;">Send Message</button>
        </div>

        <!-- Test Get Messages -->
        <div style="margin-bottom: 20px;">
          <h4>Test Get Messages:</h4>
          <input #getRoomId placeholder="Room ID" style="padding: 8px; margin-right: 10px; width: 200px;">
          <button (click)="testGetMessages(getRoomId.value)" style="padding: 8px 16px;">Get Messages</button>
        </div>

        <!-- Results Display -->
        <div *ngIf="graphQLResult" style="margin-top: 20px;">
          <h4>📊 Result:</h4>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; overflow-x: auto;">
{{ graphQLResult | json }}
          </pre>
        </div>
      </div>

      <!-- Sign Out -->
      <div style="margin-top: 30px;">
        <button (click)="signOut()" style="padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 4px;">
          🚪 Sign Out
        </button>
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  currentUser: any = null;
  token: string = '';
  showToken = false;
  decodedToken: any = null;
  graphQLResult: any = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.testAuth();

  
  }

  gotoChat(){

    this.router.navigate(['/chat']);
  }

  async testAuth() {
    try {
       
      this.currentUser = await this.authService.currentUser();
      if (this.currentUser) {
        // Get JWT token (Amplify v6 method)
        const session = await fetchAuthSession();
        this.token = session.tokens?.idToken?.toString() || '';
      }
    } catch (error) {
      this.currentUser = null;
      this.token = '';
    }
  }

  decodeToken() {
    if (this.token) {
      try {
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        this.decodedToken = JSON.parse(atob(base64));
      } catch (e) {
        this.decodedToken = { error: 'Failed to decode token' };
      }
    }
  }

  async testCreateRoom(name: string) {
    try {
      this.graphQLResult = await this.chatService.createRoom(name);
    } catch (error: any) {
      this.graphQLResult = { error: error.message };
    }
  }

  async testSendMessage(roomId: string, content: string) {
    try {
      this.graphQLResult = await this.chatService.sendMessage(roomId, content);
    } catch (error: any) {
      this.graphQLResult = { error: error.message };
    }
  }

  async testGetMessages(roomId: string) {
    try {
      this.graphQLResult = await this.chatService.getMessages(roomId);
    } catch (error: any) {
      this.graphQLResult = { error: error.message };
    }
  }

  async testListRooms() {
    this.graphQLResult = { loading: true };
    try {
      
        // First try listRooms
        const result = await this.chatService.testGraphQLQuery(`
          query ListRooms {
            listRooms {
              roomId
              name
              createdAt
            }
          }
        `);
        this.graphQLResult = result;
      
    } catch (error: any) {
      this.graphQLResult = { error: error.message };
    }
  }

  async testGetRoom(roomId: string) {
    if (!roomId) {
      this.graphQLResult = { error: 'Please enter a Room ID' };
      return;
    }
    
    this.graphQLResult = { loading: true };
    try {
      const result = await this.chatService.testGraphQLQuery(`
        query GetRoom($roomId: ID!) {
          getRoom(roomId: $roomId) {
            roomId
            name
            createdAt
          }
        }
      `, { roomId });
      this.graphQLResult = result;
    } catch (error: any) {
      this.graphQLResult = { error: error.message };
    }
  }


  

  async signOut() {
    await this.authService.signOut();
    window.location.href = '/login';
  }
}