import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chatter } from 'src/app/models/Chatter';
import { Game } from 'src/app/models/game';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  currentUser?:string;
  currentChat?:Chatter;
  currentId?:string;
  chatters:Chatter[] = [];
  isPlaying:boolean = false;
  game:Game|undefined;
  connected:(all:Chatter[])=>Chatter[] = (all)=>all.filter(c=>c.isConnected);
  disconnected:(all:Chatter[])=>Chatter[] = (all)=>all.filter(c=>!c.isConnected);

  constructor(private userService:UserService,private router:Router,private chatService:ChatService,private authService:AuthService) {
    
   }

  ngOnInit(): void {
    this.userService.getUsername()
    .subscribe(name=>this.currentUser = name,error=>console.log(error),()=>console.log("completed"));
    this.userService.getId()
    .subscribe(id=>this.currentId = id);
    this.chatService.hubChatters.subscribe((chatters:Chatter[])=>{
      this.chatters = chatters;
    });

  }

  routeToSettings(){
    this.router.navigate(['/settings']);
  }

  logout(){
    this.authService.logout()
    .subscribe((success)=>{
      console.log(success);
    });
  }

  openChat(currentChat:Chatter){
    this.currentChat = currentChat;
  }

}
