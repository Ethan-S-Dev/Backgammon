import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Request } from 'src/app/models/Request';
import { FirstMove } from 'src/app/contracts/FirstMove';
import { Chatter } from 'src/app/models/Chatter';
import { Game } from 'src/app/models/Game';
import { Player } from 'src/app/models/Player';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { GameService } from 'src/app/services/game/game.service';
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

  constructor(private userService:UserService,private router:Router,private chatService:ChatService,private authService:AuthService,private gameService:GameService) {
    
   }

  ngOnInit(): void {
    this.userService.getUsername()
    .subscribe(name=>this.currentUser = name,error=>console.log(error),()=>console.log("completed"));
    this.userService.getId()
    .subscribe(id=>this.currentId = id);
    this.chatService.hubChatters.subscribe((chatters:Chatter[])=>{
      this.chatters = chatters;
    });

    this.gameService.onGameRequest
    .subscribe(async (request:Request|undefined)=>{
      if(request)
      {
        if(confirm(`Do you want to play with ${request.player.name}?`)){
          await this.gameService.sendGameRequestApproved({requestId:request.requestId,isAccepted:true});
        }else{
          await this.gameService.sendGameRequestApproved({requestId:request.requestId,isAccepted:false});
        }
      }
    });

    this.gameService.onGameRequestDenied
    .subscribe((receiver:Player|undefined)=>{
      if(receiver)
        alert(`${receiver.name} denied your invitation.`);
    });


    this.gameService.onGameStart
    .subscribe((firstMove:FirstMove|undefined)=>{
      if(!firstMove)
        return;
      this.isPlaying = true;
      // init game 
      this.game = {isStarting:false,playerColor:'white'};
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

  async inviteToGame(chatterId:string){
    await this.gameService.sendGameRequest(chatterId);
  }

  openChat(currentChat:Chatter){
    this.currentChat = currentChat;
  }

}
