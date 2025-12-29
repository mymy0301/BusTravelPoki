import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WithFriendDataInfo')
export class WithFriendDataInfo{
    senderID:string = "";
    senderAvatarURL:string = "";
    senderName:string = "";
    senderScore:number = 0;
    
    receiverID:string = "";
    receiverAvatarURL:string = "";
    receiverName:string = "";
    receiverScore:number = 0;

    level:number = 0;
}


