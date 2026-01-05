import { _decorator, Button, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { FriendDataInfo, IShareNormalData, TYPE_UI_SHARE } from '../../../Utils/Types';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConst } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { GameManager } from '../../GameManager';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
const { ccclass, property } = _decorator;

@ccclass('ItemRankFriend')
export class ItemRankFriend extends Component {
    @property(Node)
    nodeGroup: Node = null;

    @property(UIOpacity)
    nodeGroupOpacity: UIOpacity = null;

    tweenGroup: Tween<{}> = null;
    tweenGroupOpacity: Tween<{}> = null;

    @property(Node)
    friendGroup: Node = null;

    @property(Node)
    inviteGroup: Node = null;

    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spBgIndex: Sprite;
    @property(Sprite) spBg: Sprite;
    @property(Label) lbIndex: Label;
    @property(Label) lbName: Label;
    @property(Label) lbScoreLevel: Label;

    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexRank: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBg: SpriteFrame[] = [];

    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorTextIndex_0: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorOutlineTextIndex_0: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorTextIndex_1: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorOutlineTextIndex_1: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorTextIndex_2: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorOutlineTextIndex_2: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorTextIndex_3: Color = new Color();
    @property({ group: { id: "color", name: "color", displayOrder: 2 } }) private ColorOutlineTextIndex_3: Color = new Color();

    @property(Vec3) posIndexRankPlayerTop123: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) posIndexRankPlayer: Vec3 = new Vec3(0, 0, 0);

    private _NAME_outlineNotPlayer: Color = new Color().fromHEX("#203F88");
    private _INDEX_outlineNotPlayer: Color = new Color().fromHEX("#22337F");
    private _INDEX_shadowNotPlayer: Color = new Color().fromHEX("#162B53");
    private _LEVEL_outlineNotPlayer: Color = new Color().fromHEX("#344384");
    private _LEVEL_shadowNotPlayer: Color = new Color().fromHEX("#15294B");

    private _NAME_outlinePlayer: Color = new Color().fromHEX("#A86D13");
    private _INDEX_outlinePlayer: Color = new Color().fromHEX("#A55A0E");
    private _INDEX_shadowPlayer: Color = new Color().fromHEX("#643402");
    private _LEVEL_outlinePlayer: Color = new Color().fromHEX("#A55A0E");
    private _LEVEL_shadowPlayer: Color = new Color().fromHEX("#643402");


    private _dataItem: IDataPlayer_LEADERBOARD = null;

    @property(Button) btnPlay: Button;
    @property(Button) btnInvite: Button;

    protected onEnable(): void {
        this.btnPlay.node.on(MConst.CLICK, this.touchPlay, this);
        this.btnInvite.node.on(MConst.CLICK, this.touchInvite, this);
    }

    protected onDisable(): void {
        this.btnPlay.node.off(MConst.CLICK, this.touchPlay, this);
        this.btnInvite.node.off(MConst.CLICK, this.touchInvite, this);
    }

    indexPos: number;

    setIndexPos(_indexPos: number) {
        this.indexPos = _indexPos;
    }

    initItem(dataItem: IDataPlayer_LEADERBOARD, _timeDelay: number = 0) {
        this.timeDelayShow = _timeDelay;
        this._dataItem = dataItem;
        this.showItem();
        this.loadAvatar();
    }

    timeDelayShow: number = 0;

    showItem() {
        if (this.tweenGroup != null) {
            this.tweenGroup.stop();
            this.tweenGroup = null;
        }
        if (this.tweenGroupOpacity != null) {
            this.tweenGroupOpacity.stop();
            this.tweenGroupOpacity = null;
        }
        this.nodeGroupOpacity.opacity = 0;
        this.nodeGroup.active = true;
        this.nodeGroup.setScale(new Vec3(0.8, 0.8, 1));
        this.tweenGroup = tween(this.nodeGroup).delay(this.timeDelayShow).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut', onComplete: () => { } }).start();
        this.tweenGroupOpacity = tween(this.nodeGroupOpacity).delay(this.timeDelayShow).to(0.3, { opacity: 255 }, { easing: 'linear', onComplete: () => { } }).start();

        if(this._dataItem == null){
            this.friendGroup.active = false;
            this.inviteGroup.active = true;
        }else{
            this.friendGroup.active = true;
            this.inviteGroup.active = false;

            let indexPlayer = this._dataItem.rank;
            this.lbIndex.string = `${indexPlayer}`;
            this.lbName.string = this._dataItem.name;
            this.lbScoreLevel.string = "Lv." + (this._dataItem.score != Number.EPSILON ? this._dataItem.score.toString() : "???");

            if (this._dataItem.playerId == FBInstantManager.Instance.getID()) {
                this.spBg.spriteFrame = this.sfBg[0];

                //set outline color
                this.lbName.outlineColor = this._NAME_outlinePlayer;
                this.lbIndex.outlineColor = this._INDEX_outlinePlayer;
                this.lbIndex.shadowColor = this._INDEX_shadowPlayer;
                this.lbScoreLevel.outlineColor = this._LEVEL_outlinePlayer;
                this.lbScoreLevel.shadowColor = this._LEVEL_shadowPlayer;

            } else {
                this.spBg.spriteFrame = this.sfBg[1];

                // set outline color
                this.lbName.outlineColor = this._NAME_outlineNotPlayer;
                this.lbIndex.outlineColor = this._INDEX_outlineNotPlayer;
                this.lbIndex.shadowColor = this._INDEX_shadowNotPlayer;
                this.lbScoreLevel.outlineColor = this._LEVEL_outlineNotPlayer;
                this.lbScoreLevel.shadowColor = this._LEVEL_shadowNotPlayer;
            }
            switch (indexPlayer) {
                case 1:
                    this.spBgIndex.spriteFrame = this.sfBgIndexRank[0];
                    this.lbIndex.color = this.ColorTextIndex_0;
                    this.lbIndex.outlineColor = this.ColorOutlineTextIndex_0;
                    this.lbIndex.node.position = this.posIndexRankPlayerTop123.clone();
                    break;
                case 2:
                    this.spBgIndex.spriteFrame = this.sfBgIndexRank[1];
                    this.lbIndex.color = this.ColorTextIndex_1;
                    this.lbIndex.outlineColor = this.ColorOutlineTextIndex_1;
                    this.lbIndex.node.position = this.posIndexRankPlayerTop123.clone();
                    break;
                case 3:
                    this.spBgIndex.spriteFrame = this.sfBgIndexRank[2];
                    this.lbIndex.color = this.ColorTextIndex_2;
                    this.lbIndex.outlineColor = this.ColorOutlineTextIndex_2;
                    this.lbIndex.node.position = this.posIndexRankPlayerTop123.clone();
                    break;
                default:
                    this.spBgIndex.spriteFrame = null;
                    this.lbIndex.node.active = true;
                    this.lbIndex.color = this.ColorTextIndex_3;
                    this.lbIndex.outlineColor = this.ColorOutlineTextIndex_3;
                    this.lbIndex.node.position = this.posIndexRankPlayer.clone();
                    break;
            }
        }
        
    }

    loadAvatar() {
        let self = this;
        this.spAvatar.spriteFrame = null;
        try {
            ResourceUtils.TryLoadImageAvatar(this._dataItem.avatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._dataItem.avatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    touchPlay() {
        LogEventManager.Instance.logButtonClick("play", "ItemRankFriend");

        clientEvent.dispatchEvent(MConst.EVENT.ITEMFRIEND_TOUCHPLAY, this._dataItem);
    }

    async touchInvite() {
        LogEventManager.Instance.logButtonClick(`invite`, "UIFriends_ItemRankFriend");
        
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        let jsonShare: IShareNormalData = {
            level: GameManager.Instance.levelPlayerNow
        }
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.INVITE, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    FBInstantManager.Instance.inviteFriend_222(base64Image, (err, success) => {
                        clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    })
                } else {
                    
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }
}


