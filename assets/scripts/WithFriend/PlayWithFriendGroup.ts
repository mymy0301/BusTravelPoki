import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { WithFriendDataInfo } from './WithFriendDataInfo';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('PlayWithFriendGroup')
export class PlayWithFriendGroup extends Component {
    @property(Sprite)
    playerAvatar:Sprite = null;

    @property(Label)
    playerName:Label = null;

    @property(Sprite)
    friendAvatar:Sprite = null;

    @property(Label)
    friendName:Label = null;

    @property(Label)
    friendScore:Label = null;

    @property(SpriteFrame)
    sfAvatarDefault:SpriteFrame = null;

    initWithFriendGroup(withFriendDataInfo:WithFriendDataInfo){
        // console.log("initWithFriendGroup",withFriendDataInfo);
        const self = this;
        this.playerName.string = `${FBInstantManager.Instance.getName()}`;
        ResourceUtils.TryLoadImageAvatar(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.playerAvatar != null && self.playerAvatar.isValid) {
                self.playerAvatar.spriteFrame = spriteFrame;
            }
        });
       
        this.friendAvatar.spriteFrame = this.sfAvatarDefault;
        if(withFriendDataInfo.senderID == FBInstantManager.Instance.getID()){
            //SENDER == PLAYER
            if(withFriendDataInfo.receiverName.length == 0){
                this.friendName.string = `Your friend`;
            }else{
                this.friendName.string = `${withFriendDataInfo.receiverName}`;
            }
            if(withFriendDataInfo.receiverScore >= 9999){
                this.friendScore.string = `???`;
            }else{
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(withFriendDataInfo.receiverScore))}`;
            }

            if(withFriendDataInfo.receiverAvatarURL.length == 0) {
                    
            }else{
                ResourceUtils.TryLoadImageAvatar(withFriendDataInfo.receiverAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == withFriendDataInfo.receiverAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });
            }
        }else if(withFriendDataInfo.receiverID == FBInstantManager.Instance.getID()){
            //RECEIVER == PLAYER
            if(withFriendDataInfo.senderName.length == 0){
                this.friendName.string = `Your friend`;
            }else{
                this.friendName.string = `${withFriendDataInfo.senderName}`;
            }
            if(withFriendDataInfo.senderScore >= 9999){
                this.friendScore.string = `???`;
            }else{
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(withFriendDataInfo.senderScore))}`;
            }
            if(withFriendDataInfo.senderAvatarURL.length == 0) {
                    
            }else{
                ResourceUtils.TryLoadImageAvatar(withFriendDataInfo.senderAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == withFriendDataInfo.senderAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });
            }
        }
    }
}


