import { _decorator, Component, Node } from 'cc';
import { AVATAR_TYPE } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ItemRankInfo')
export class ItemRankInfo{
    avatarType:AVATAR_TYPE = AVATAR_TYPE.TYPE_LOCAL;
    userName:string = "";
    userScore:number = 0;
    avatarURL:string = "1";
    isMyRank:boolean = false;
    indexRank:number = 1;
    idFB:string = "";
    countryCode:string = "us";
    
    constructor(){}

    public CustomSetUp(avatarType: AVATAR_TYPE , userName:string , userScore: number , avatarURL:string , isMyRank:boolean , indexRank: number , idFB: string , countryCode:string){
        this.avatarType = avatarType;
        this.userName = userName;
        this.userScore = userScore;
        this.avatarURL = avatarURL;
        this.isMyRank = isMyRank;
        this.indexRank = indexRank;
        this.idFB = idFB;
        this.countryCode = countryCode;
    }

}


