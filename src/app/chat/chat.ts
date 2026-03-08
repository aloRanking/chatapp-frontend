import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat-service';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';
import { Room } from '../models/room';
import { Message } from '../models/messge-model';


@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {

  @ViewChild('messagesArea') messagesArea!: ElementRef;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  currentUsername: string = '';
  currentUserId: string = '';
  
  rooms: Room[] = [];
  selectedRoom: any = null;
  messages: Message[] = [];
  
  newMessage: string = '';
  loadingRooms: boolean = false;
  loadingMessages: boolean = false;
  
  showCreateRoomModal: boolean = false;
  newRoomName: string = '';
  subscription: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserInfo();
    await this.loadRooms();
    



  }
   gotoDashboard(){

    this.router.navigate(['/dashboard']);
  }

  async loadUserInfo() {
    try {
      const user = await this.authService.currentUser();
      this.currentUsername = user.username;
      this.currentUserId = user.userId;
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async loadRooms() {
    this.loadingRooms = true;
    try {
      
      this.rooms = await this.chatService.getRooms();
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.loadingRooms = false;
    }
  }



  async selectRoom(room: Room) {
    if (this.subscription) {
    this.subscription.unsubscribe();
    this.subscription = null;}
    
    if(this.selectedRoom === room) return;
    this.selectedRoom = room;
    await this.loadMessages(room.roomId);

this.subscription = this.chatService
  .subscribeToMessages(room.roomId)
  .subscribe({
    next: (event: any) => {
      console.log('Raw subscription event:', event);

      let newMessage;

      if (event?.value?.data?.onMessageSent) {
        newMessage = event.value.data.onMessageSent;
      } else if (event?.data?.onMessageSent) {
        newMessage = event.data.onMessageSent;
      }

      if (!newMessage) return;

     
      if (newMessage.senderUsername === this.currentUsername) return;

      this.messages = [...this.messages, newMessage];
      setTimeout(() => this.scrollToBottom(), 50);
    },
    error: err => console.error('Subscription error', err)
  });

  //  this.chatService
  // .subscribeToMessages(room.roomId)
  // .subscribe((message) => {
  //   if (message.roomId === room.roomId) {
  //     this.messages = [...this.messages, message];
  //     setTimeout(() => this.scrollToBottom(), 50);
  //   }
  // });
  }

  async loadMessages(roomId: string) {
    this.loadingMessages = true;
    this.messages = [];
    
    try {
      const result: Message[] = await this.chatService.getMessages(roomId);
      this.messages = result;
      
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      this.loadingMessages = false;
    }
  }

  async createRoom() {
    if (!this.newRoomName.trim()) return;
    
    try {
      const result: any = await this.chatService.createRoom(this.newRoomName);
      const newRoom = result.data?.createRoom;
      
      if (newRoom) {
        this.rooms = [newRoom, ...this.rooms];
        this.newRoomName = '';
        this.showCreateRoomModal = false;
        this.selectRoom(newRoom);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  }

  onEnterKey(event: any) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.sendMessage();
  }
}


onSendClick() {
  this.sendMessage();
}

  async sendMessage() {
    if (!this.newMessage.trim() || !this.selectedRoom) return;
    
      const messageContent = this.newMessage;
      this.newMessage = '';
      
      
      const tempMessage = {
        roomId: this.selectedRoom.roomId,
        content: messageContent,
        senderUsername: this.currentUsername,
        createdAt: new Date().toISOString(),
        sending: true
      };
      
      this.messages = [...this.messages, tempMessage];
      setTimeout(() => this.scrollToBottom(), 50);
      
      try {
        const result: any = await this.chatService.sendMessage(
          this.selectedRoom.roomId, 
          messageContent
        );

        console.log('Mutation result:', result);
        
        
        // this.messages = this.messages.map(m => 
        //   m.id === tempMessage.id ? result.data?.sendMessage : m
        // );
        
        // Update room last message
        //this.selectedRoom.lastMessage = messageContent;
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove temp message on error
        //this.messages = this.messages.filter(m => m.id !== tempMessage.id);
        alert('Failed to send message');
      }
    }
  

  scrollToBottom() {
    try {
      this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {}
  }

  async logout() {
    await this.authService.signOut();
    window.location.href = '/login';
  }


  ngOnDestroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }


}

}
