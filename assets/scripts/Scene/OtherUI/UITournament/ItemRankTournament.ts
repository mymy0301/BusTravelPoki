import { _decorator, CCBoolean, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { MConst } from '../../../Const/MConst';
import { ItemScrollViewBase2 } from '../../../Common/ItemScrollViewBase2';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { clientEvent } from '../../../framework/clientEvent';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
import { Utils } from '../../../Utils/Utils';
import { ItemUltimateSV } from '../../../Common/UltimateScrollView/ItemUltimateSV';
import { EVENT_RANK_TOURNAMNET } from './TypeTournament';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { ICustomBubble } from '../Others/Bubble/BubbleSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('ItemRankTournament')
export class ItemRankTournament extends ItemUltimateSV {
    @property(Node)
    nodeGroup: Node = null;

    @property(UIOpacity)
    nodeGroupOpacity: UIOpacity = null;

    tweenGroup: Tween<{}> = null;
    tweenGroupOpacity: Tween<{}> = null;

    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spBgIndex: Sprite;
    @property(Sprite) spBgTop3Index: Sprite;
    @property(Sprite) spBg: Sprite;
    @property(Sprite) spBgScoreLevel: Sprite;
    @property(Label) lbIndex: Label;
    @property(Label) lbName: Label;
    @property(Label) lbScoreLevel: Label;
    @property(Sprite) spPrize: Sprite;
    @property(ItemPrizeLobby) itemPrizeLobby: ItemPrizeLobby;

    @property(CCBoolean) isCallFromContent: boolean = true;

    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexRank: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBg: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgScoreLevel: SpriteFrame[] = [];
    // @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexPlayer: SpriteFrame;
    // @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexNotPlayer: SpriteFrame;
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfPrize: SpriteFrame[] = [];

    private _pathAvatar: string = null;
    private _isPlayer: boolean = false;
    private _dataItem: IDataPlayer_LEADERBOARD = null;
    private _prize: IPrize[] = [];

    private _NAME_outlinePlayer: Color = new Color().fromHEX("#A85513");
    private _NAME_shadowPlayer: Color = new Color().fromHEX("#A85513");
    private _NAME_outlineNotPlayer: Color = new Color().fromHEX("#012C61");
    private _NAME_shadowNotPlayer: Color = new Color().fromHEX("#012C61");

    private _LEVEL_outlinePlayer: Color = new Color().fromHEX("#A55A0E");
    private _LEVEL_shadowPlayer: Color = new Color().fromHEX("#643402");
    private _LEVEL_outlineNotPlayer: Color = new Color().fromHEX("#012C61");
    private _LEVEL_shadowNotPlayer: Color = new Color().fromHEX("#012C61");

    private _INDEX_outlines: Color[] = [
        new Color().fromHEX("#7e2700"),
        new Color().fromHEX("#09232e"),
        new Color().fromHEX("#420000"),
        new Color().fromHEX("#142668")//#7a2800
    ]
    private _INDEX_shadows: Color[] = [
        new Color().fromHEX("#7e2700"),
        new Color().fromHEX("#09232e"),
        new Color().fromHEX("#420000"),
        new Color().fromHEX("#142668")//#7a2800
    ]



    @property(SpriteFrame) sfAvatarDefault: SpriteFrame = null;

    protected onEnable(): void {
        this.spPrize.node.on("click", this.onClickPrize, this);
    }

    protected onDisable(): void {
        super.onDisable();
        this.spPrize.node.off("click", this.onClickPrize, this);
    }

    indexPos: number;

    setIndexPos(_indexPos: number) {
        this.indexPos = _indexPos;
    }

    timeDelayShow: number = 0;
    initItem(dataItem: IDataPlayer_LEADERBOARD, listIPrize: IPrize[][], _timeDelay: number = 0) {
        this.timeDelayShow = _timeDelay;
        this._dataItem = dataItem;
        this.initShowItem(listIPrize);
    }

    initShowItem(listIPrize: IPrize[][]) {
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

        this.SetUp(this._dataItem, listIPrize, true);
    }
    public async SetUp(data: IDataPlayer_LEADERBOARD, listIPrize: IPrize[][], needCallAutoLoadImage: boolean = true) {
        let indexPlayer: number = -1;
        indexPlayer = data.rank;

        this.lbIndex.string = `${indexPlayer}`;
        this._dataItem = data;
        this._pathAvatar = data.avatar;
        this.lbName.string = data.name;
        // console.log("data.score", data.score);
        this.lbScoreLevel.string = data.score <= -10000 ? `???` : Utils.convertTimeToFormat(-data.score);
        this._isPlayer = (data.playerId == MConfigFacebook.Instance.playerID);

        this._prize = null;

        // set prize
        // switch (data.rank) {
        //     case 1: case 2: case 3:
        //         this.spPrize.spriteFrame = this.sfPrize[data.rank - 1];
        //         this.spPrize.node.active = true;
        //         this.itemPrizeLobby.node.active = false;
        //         this._prize = listIPrize[data.rank - 1];
        //         break;
        //     case 4: case 5: case 6: case 7: case 8: case 9: case 10:
        //         // this.spPrize.spriteFrame = this.sfPrize[3];
        //         this.spPrize.node.active = false;
        //         this.itemPrizeLobby.node.active = true;
        //         this.itemPrizeLobby.SetUp(new IPrize(TYPE_PRIZE.LIFE, TYPE_RECEIVE.TIME_MINUTE, 10), this.itemPrizeLobby.node.position.clone(), 1);
        //         break;
        //     default:
        //         this.spPrize.node.active = false;
        //         this.itemPrizeLobby.node.active = false;
        //         break;
        // }
        // console.log("data.rank", data.rank);
        // console.log("listIPrize", listIPrize);
        if (data.rank <= 3) {
            if (listIPrize) {
                this.spPrize.spriteFrame = this.sfPrize[data.rank - 1];
                this.spPrize.node.active = true;
                this.itemPrizeLobby.node.active = false;
                this._prize = listIPrize[data.rank - 1];
            } else {
                this.spPrize.node.active = false;
                this.itemPrizeLobby.node.active = false;
            }
        } else if (listIPrize != null && data.rank <= listIPrize.length) {
            if (listIPrize) {
                this.spPrize.node.active = false;
                this._prize = listIPrize[data.rank - 1];
                this.itemPrizeLobby.node.active = true;
                this.itemPrizeLobby.SetUp(this._prize[0], this.itemPrizeLobby.node.position.clone(), 1);
            } else {
                this.spPrize.node.active = false;
                this.itemPrizeLobby.node.active = false;
            }
        } else {
            this.spPrize.node.active = false;
            this.itemPrizeLobby.node.active = false;
        }

        // set sprite frame for player and not player
        if (this._isPlayer) {
            // this.spBgIndex.spriteFrame = this.sfBgIndexPlayer;
            this.spBgScoreLevel.spriteFrame = this.sfBgScoreLevel[0];
            this.spBg.spriteFrame = this.sfBg[0];

            // set outline color
            this.lbName.outlineColor = this._NAME_outlinePlayer;
            this.lbName.shadowColor = this._NAME_shadowPlayer;

            this.lbScoreLevel.outlineColor = this._LEVEL_outlinePlayer;
            this.lbScoreLevel.shadowColor = this._LEVEL_shadowPlayer;
        } else {
            // this.spBgIndex.spriteFrame = this.sfBgIndexNotPlayer;
            this.spBgScoreLevel.spriteFrame = this.sfBgScoreLevel[1];
            this.spBg.spriteFrame = this.sfBg[1];

            //set outline color
            this.lbName.outlineColor = this._NAME_outlineNotPlayer;
            this.lbName.shadowColor = this._NAME_shadowNotPlayer;

            this.lbScoreLevel.outlineColor = this._LEVEL_outlineNotPlayer;
            this.lbScoreLevel.shadowColor = this._LEVEL_shadowNotPlayer;
        }

        // set sprite frame for rank
        switch (indexPlayer) {
            case 1:
                this.spBgTop3Index.spriteFrame = this.sfBgIndexRank[0];
                this.spBgTop3Index.node.active = true;
                this.spBgIndex.node.active = false;
                this.lbIndex.node.active = true;
                this.lbIndex.outlineColor = this._INDEX_outlines[0];
                this.lbIndex.shadowColor = this._INDEX_shadows[0];
                break;
            case 2:
                this.spBgTop3Index.spriteFrame = this.sfBgIndexRank[1];
                this.spBgTop3Index.node.active = true;
                this.spBgIndex.node.active = false;
                this.lbIndex.node.active = true;
                this.lbIndex.outlineColor = this._INDEX_outlines[1];
                this.lbIndex.shadowColor = this._INDEX_shadows[1];
                break;
            case 3:
                this.spBgTop3Index.spriteFrame = this.sfBgIndexRank[2];
                this.spBgTop3Index.node.active = true;
                this.spBgIndex.node.active = false;
                this.lbIndex.node.active = true;
                this.lbIndex.outlineColor = this._INDEX_outlines[2];
                this.lbIndex.shadowColor = this._INDEX_shadows[2];
                break;
            default:
                this.spBgTop3Index.node.active = false;
                this.spBgIndex.node.active = this._isPlayer;
                this.lbIndex.node.active = true;
                this.lbIndex.outlineColor = this._INDEX_outlines[3];
                this.lbIndex.shadowColor = this._INDEX_shadows[3];
                break;
        }

        if (needCallAutoLoadImage) {
            this.ShowItem();
        }
    }

    public ShowItem() {
        let self = this;
        this.spAvatar.spriteFrame = this.sfAvatarDefault;
        try {
            ResourceUtils.TryLoadImageAvatar(this._pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._pathAvatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    private onClickPrize() {
        LogEventManager.Instance.logButtonClick(`prize`, "ItemRankTournament");

        this.CallNotification();
    }

    private CallNotification() {
        // console.log("CallNotification", this._prize);
        if (this._prize != null && this._prize.length > 0) {
            const dataPrize: IPrize[] = this._prize;
            const wPosShowNoti = this.spPrize.node.worldPosition.clone();
            if (this.isCallFromContent) {
                clientEvent.dispatchEvent(EVENT_RANK_TOURNAMNET.SHOW_NOTIFICATION,
                    dataPrize
                    , TYPE_BUBBLE.BOTTOM_RIGHT
                    , wPosShowNoti
                    , true
                    , this.node.parent.parent
                )
            } else {
                clientEvent.dispatchEvent(EVENT_RANK_TOURNAMNET.SHOW_NOTIFICATION,
                    dataPrize
                    , TYPE_BUBBLE.BOTTOM_RIGHT
                    , wPosShowNoti
                    , true
                    , this.node.parent
                )
            }
        }
    }

    public CheckIsPlayer() { return this._isPlayer; }

}


