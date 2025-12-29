import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { IUIShareBase, UIShareBase } from './UIShareBase';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { FBInstantManager } from '../facebooks/FbInstanceManager';
import { DataInfoPlayer } from '../../Scene/DataInfoPlayer';
import { Utils } from '../Utils';
import { ResourceUtils } from '../ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UIShareWithFriends')
export class UIShareWithFriends extends UIShareBase implements IUIShareBase {
    @property({ type: Sprite }) private playerAvatar: Sprite;
    @property({ type: Label }) private playerName: Label;
    @property({ type: Label }) private playerScore: Label;
    @property({ type: Label }) private playerScore_shadow: Label;
    @property({ type: Node }) private playerWin: Node;
    @property({ type: Sprite }) private friendAvatar: Sprite;
    @property({ type: Label }) private friendName: Label;
    @property({ type: Label }) private friendScore: Label;
    @property({ type: Label }) private friendScore_shadow: Label;
    @property({ type: Node }) private friendWin: Node;
    @property({ type: SpriteFrame }) private sfAvatarDefault: SpriteFrame;

    protected onLoad(): void {
        this.Init(this);
    }

    async SetUp(data: any) {
        const self = this;

        this.friendWin.active = false;
        this.playerWin.active = false;
        this.friendAvatar.spriteFrame = this.sfAvatarDefault;
        this.playerName.string = `${FBInstantManager.Instance.getName()}`;
        let listPromiseAvatarWithFriends = [];

        // load avatar
        try {
            let promiseLoadAvatar = new Promise<void>(resolve => {
                ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                        self.playerAvatar.spriteFrame = spriteFrame;
                    }
                    resolve();
                });
            })
            listPromiseAvatarWithFriends.push(promiseLoadAvatar);
        } catch (e) {

        }

        if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderID == FBInstantManager.Instance.getID()) {
            //SENDER == PLAYER
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore >= 9999) {
                this.playerScore.string = `???`;
                this.playerScore_shadow.string = `???`;
            } else {
                this.playerScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;
                this.playerScore_shadow.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;
            }

            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName.length == 0) {
                this.friendName.string = `Your friend`;
            } else {
                this.friendName.string = `${DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName}`;
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore >= 9999) {
                this.friendScore.string = `???`;
                this.friendScore_shadow.string = `???`;

                this.playerWin.active = true;
            } else {
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;
                this.friendScore_shadow.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;

                if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore >= DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore) {
                    this.playerWin.active = true;
                } else {
                    this.friendWin.active = true;
                }
            }

            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL.length == 0) {

            } else {
                let promiseFriendAvatar = ResourceUtils.TryLoadImage(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });

                listPromiseAvatarWithFriends.push(promiseFriendAvatar);
            }
        } else if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverID == FBInstantManager.Instance.getID()) {
            //RECEIVER == PLAYER
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore >= 9999) {
                this.playerScore.string = `???`;
                this.playerScore_shadow.string = `???`;
            } else {
                this.playerScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;
                this.playerScore_shadow.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderName.length == 0) {
                this.friendName.string = `Your friend`;
            } else {
                this.friendName.string = `${DataInfoPlayer.Instance.currWithFriendDataInfo.senderName}`;
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore >= 9999) {
                this.friendScore.string = `???`;
                this.friendScore_shadow.string = `???`;
                this.playerWin.active = true;
            } else {
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;
                this.friendScore_shadow.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;

                if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore >= DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore) {
                    this.playerWin.active = true;
                } else {
                    this.friendWin.active = true;
                }
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL.length == 0) {

            } else {
                let promiseFriendAvatar = ResourceUtils.TryLoadImage(DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });

                listPromiseAvatarWithFriends.push(promiseFriendAvatar);
            }
        }
        await Promise.all(listPromiseAvatarWithFriends);
    }
}


