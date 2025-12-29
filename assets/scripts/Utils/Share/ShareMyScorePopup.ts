import { _decorator, Camera, Color, Component, instantiate, Label, Node, RichText, Sprite, SpriteFrame, Vec3 } from 'cc';
import { IShareTournamentData, TYPE_QUEST_DAILY, TYPE_UI_SHARE } from '../Types';
import { GetBase64Image_Callback, MConfigFacebook } from '../../Configs/MConfigFacebook';
import { Utils } from '../Utils';
import { ResourceUtils } from '../ResourceUtils';
import { FBInstantManager } from '../facebooks/FbInstanceManager';
import { DataInfoPlayer } from '../../Scene/DataInfoPlayer';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { captureNode, getBase64 } from '../../Common/capture-screen';
import { UIShareBase } from './UIShareBase';
const { ccclass, property } = _decorator;

@ccclass('ShareMyScorePopup')
export class ShareMyScorePopup extends Component {
    @property(Camera) private nodeCamera: Camera;

    private nUIShareNormal: Node = null;
    private nUIShareTournament: Node = null;
    private nUIShareInviteFriend: Node = null;
    private nUIShareWithFriend: Node = null;

    private OrthoHeight1: number = 400;
    private OrthoHeight2: number = 225;

    protected start(): void {
        this.node.children.forEach(child => {
            child.active = false;
        });
    }

    private async CheckAndLoadShareUI(typeUI: TYPE_UI_SHARE) {
        let prefabShare = null;
        switch (typeUI) {
            case TYPE_UI_SHARE.NORMAL:
                if (!this.nUIShareNormal) {
                    prefabShare = await ResourceUtils.loadPrefab(MConst.SHARE.PATH_PREFAB_SHARE_NORMAL);
                    this.nUIShareNormal = instantiate(prefabShare);
                    this.nUIShareNormal.setParent(this.node);
                }
                break;
            case TYPE_UI_SHARE.TOURNAMENT:
                if (!this.nUIShareTournament) {
                    prefabShare = await ResourceUtils.loadPrefab(MConst.SHARE.PATH_PREFAB_SHARE_TOURNAMENT);
                    this.nUIShareTournament = instantiate(prefabShare);
                    this.nUIShareTournament.setParent(this.node);
                }
                break;
            case TYPE_UI_SHARE.INVITE:
                if (!this.nUIShareInviteFriend) {
                    prefabShare = await ResourceUtils.loadPrefab(MConst.SHARE.PATH_PREFAB_SHARE_FRIEND);
                    this.nUIShareInviteFriend = instantiate(prefabShare);
                    this.nUIShareInviteFriend.setParent(this.node);
                }
                break;
            case TYPE_UI_SHARE.WITH_FRIEND:
                if (!this.nUIShareWithFriend) {
                    prefabShare = await ResourceUtils.loadPrefab(MConst.SHARE.PATH_PREFAB_SHARE_WITH_FRIEND);
                    this.nUIShareWithFriend = instantiate(prefabShare);
                    this.nUIShareWithFriend.setParent(this.node);
                }
                break;
            default: break;
        }
    }

    async showShareMyScorePopup(data: any, typeUI: TYPE_UI_SHARE, cb: GetBase64Image_Callback) {
        // check load prefab or not => if not init prefab and add to node
        await this.CheckAndLoadShareUI(typeUI);

        this.HideAllShare();
        switch (typeUI) {
            case TYPE_UI_SHARE.NORMAL:
                this.nUIShareNormal.active = true;
                await this.nUIShareNormal.getComponent(UIShareBase).iUIShare.SetUp(data);
                break;
            case TYPE_UI_SHARE.TOURNAMENT:                                      // IShareTournamentData
                this.nUIShareTournament.active = true;
                await this.nUIShareTournament.getComponent(UIShareBase).iUIShare.SetUp(data);
                break;
            case TYPE_UI_SHARE.INVITE:
                this.nUIShareInviteFriend.active = true;
                await this.nUIShareInviteFriend.getComponent(UIShareBase).iUIShare.SetUp(data);
                break;
            case TYPE_UI_SHARE.WITH_FRIEND:
                this.nUIShareWithFriend.active = true;
                await this.nUIShareWithFriend.getComponent(UIShareBase).iUIShare.SetUp(data);
                break;
            default: break;
        }

        this.nodeCamera.node.active = true;
        this.node.setPosition(new Vec3(-20000, 0, 0));
        switch (typeUI) {
            case TYPE_UI_SHARE.NORMAL:
                this.captureNode_Invite(cb);
                break;
            case TYPE_UI_SHARE.INVITE:
                // ||**DQ**||
                clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.INVITE_FRIEND, 1);
                this.captureNode_Invite2(cb);
                break;
            case TYPE_UI_SHARE.TOURNAMENT:
            case TYPE_UI_SHARE.WITH_FRIEND:
                this.captureNode_Invite2(cb);
                break;
        }
    }

    captureNode_Invite(cb: GetBase64Image_Callback) {
        let self = this;
        captureNode(this.node, this.nodeCamera).then(() => {
            let base64 = getBase64(this.nodeCamera, 800, 800);
            // console.log(base64);
            self.nodeCamera.node.active = false;
            self.HideAllShare();
            cb(base64);
        }).catch(() => {
            cb("");
        });
    }

    captureNode_Invite2(cb: GetBase64Image_Callback) {
        let self = this;
        captureNode(this.node, this.nodeCamera).then(() => {
            let base64 = getBase64(this.nodeCamera, 800, 450);
            // console.log(base64);
            self.nodeCamera.node.active = false;
            self.HideAllShare();
            cb(base64);
        }).catch(() => {
            cb("");
        });
    }

    private HideAllShare() {
        if (this.nUIShareNormal != null) this.nUIShareNormal.active = false;
        if (this.nUIShareTournament != null) this.nUIShareTournament.active = false;
        if (this.nUIShareInviteFriend != null) this.nUIShareInviteFriend.active = false;
        if (this.nUIShareWithFriend != null) this.nUIShareWithFriend.active = false;
    }

    //#region FUNC NORMAL
    private _indexQuote: number = 0;
    private readonly _listQuote = [
        "Think you’ve got what it takes?",
        "Ready to beat this challenge?",
        "How far can you go?",
        "Think you can top that?",
        "Ready to prove your skills?"
    ]
    private getQuoteShareNormal(): string {
        this._indexQuote += 1;
        if (this._indexQuote == this._listQuote.length) {
            this._indexQuote = 0;
        }
        return this._listQuote[this._indexQuote];
    }
    //#endregion
}

