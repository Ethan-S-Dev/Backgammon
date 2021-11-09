import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmMessage } from 'src/app/contracts/ConfirmMessage';
import { SendMessage } from 'src/app/contracts/SendMessage';
import { Chatter } from 'src/app/models/Chatter';
import { Message } from 'src/app/models/Message';
import { User } from 'src/app/models/User';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private _chatWith?: Chatter;
  @Input()
  set chatWith(val: Chatter) {
    this._chatWith = val;
    this.chatService.getHistory(this._chatWith.id)
      .subscribe(mess => {
        mess.forEach(message => {
          if (!message.isReceived && message.recipientId === this.currentUserId)
            this.chatService.confirmMessage({ messageId: message.id, receivedAt: this.getNowUTC() });
        });
        this.messages = mess;
      })
  }
  @Input() currentUserId?: string;
  messages: Message[];
  messageForm: FormGroup;

  constructor(private chatService: ChatService, private formBuilder: FormBuilder) {
    this.messageForm = this.formBuilder.group({
      messageBody: ''
    });
    this.messages = [];
  }

  ngOnInit(): void {
    if (this._chatWith)
      this.chatService.getHistory(this._chatWith.id)
        .subscribe(mess => {
          mess.forEach(message => {
            if (!message.isReceived && message.recipientId === this.currentUserId)
              this.chatService.confirmMessage({ messageId: message.id, receivedAt: this.getNowUTC() });
          });
          this.messages = mess;
        })

    this.chatService.incomingMessage
      .subscribe(message => {
        if (!message)
          return;
        this.receiveMessage(message);
      });

    this.chatService.incomingConfirmation
      .subscribe(confirm => {
        if (!confirm)
          return;
        this.confirmMessage(confirm);
      })
  }

  private getNowUTC(): Date {
    return new Date(Date.now());;
  }

  sendMessage() {
    if (!this._chatWith)
      return;
    if (!this._chatWith.isConnected)
      return;
    if (this.messageForm.controls['messageBody'].invalid)
      return;
    let body = this.messageForm.controls['messageBody'].value;
    let message: SendMessage = { messageBody: body, recipientId: this._chatWith.id, SentAt: this.getNowUTC() };
    this.chatService.sendMessage(message);
  }

  private receiveMessage(message: Message) {
    if (message.senderId === this._chatWith?.id) {
      this.chatService.confirmMessage({ messageId: message.id, receivedAt: this.getNowUTC() });
      this.messages = [...this.messages, message];
    }

    if (message.senderId === this.currentUserId) {
      this.messages = [...this.messages, message];
    }
  }

  private confirmMessage(confirm: ConfirmMessage) {
    let message = this.messages.find(m => m.id === confirm.messageId);
    if (!message)
      return;

    message.isReceived = true;
    message.receivedAd = confirm.receivedAt;
    this.messages = this.messages;
  }
}
