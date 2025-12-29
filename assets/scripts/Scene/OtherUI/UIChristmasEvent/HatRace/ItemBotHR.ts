import { _decorator, CCBoolean, Color, Component, Label, Node, Sprite, SpriteFrame, TERRAIN_DATA_VERSION5, Tween, tween, Vec3 } from 'cc';
import { ItemUltimateSV } from 'db://assets/scripts/Common/UltimateScrollView/ItemUltimateSV';
import { CONFIG_HAT_RACE, EVENT_HAT_RACE, InfoBot_HatRace } from './TypeHatRace';
import { ShowItemAnim } from 'db://assets/scripts/Common/UltimateScrollView/Type_B_ScrollViewSys';
import { MConfigFacebook } from 'db://assets/scripts/Configs/MConfigFacebook';
import { DataHatRace_christ } from 'db://assets/scripts/DataBase/DataHatRace_christ';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { TYPE_PRIZE } from 'db://assets/scripts/Utils/Types';
import { ResourceUtils } from 'db://assets/scripts/Utils/ResourceUtils';
import { LogEventManager } from 'db://assets/scripts/LogEvent/LogEventManager';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { TYPE_BUBBLE } from '../../Others/Bubble/TypeBubble';
const { ccclass, property } = _decorator;

@ccclass('ItemBotHR')
export class ItemBotHR extends ItemUltimateSV {

    tweenGroup: Tween<{}>;
    tweenGroupOpacity: Tween<{}>;

    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spBgIndex: Sprite;
    @property(Sprite) spBg: Sprite;
    @property(Label) lbIndex: Label;
    @property(Label) lbName: Label;
    @property(Label) lbScoreLevel: Label;
    @property(Sprite) bgScore: Sprite;
    @property(Node) nChest: Node;
    @property(Sprite) spPrize: Sprite;
    @property(Label) lbNumPrizeRight: Label;
    @property(Label) lbNumPrizeMid: Label;

    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexRank: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBg: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgScore: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfChests: SpriteFrame[] = [];

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

    @property(CCBoolean) autoUpdateBgScore: boolean = false;

    private _pathAvatar: string = null;
    private _isPlayer: boolean = false;
    private _dataItem: InfoBot_HatRace = null; public get DataItem(): InfoBot_HatRace { return this._dataItem; }

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

    public async SetUp(data: InfoBot_HatRace, useAnim: boolean = true) {

        if (useAnim) {
            ShowItemAnim(this.tweenGroup, this.tweenGroupOpacity, this.node);
        }

        this._dataItem = data;
        let indexPlayer = this._dataItem.rank + 1;

        this.lbIndex.string = `${indexPlayer}`;
        this._dataItem = data;
        this._pathAvatar = data.avatar;
        this.lbName.string = data.name;
        this.lbScoreLevel.string = data.progress.toString();
        this._isPlayer = data.id == MConfigFacebook.Instance.playerID;

        // set sprite frame for player and not player
        if (this._isPlayer) {
            this.spBg.spriteFrame = this.sfBg[0];

            //set outline color
            this.lbName.outlineColor = this._NAME_outlinePlayer;
            this.lbIndex.outlineColor = this._INDEX_outlinePlayer;
            this.lbIndex.shadowColor = this._INDEX_shadowPlayer;
            // this.lbScoreLevel.outlineColor = this._LEVEL_outlinePlayer;
            // this.lbScoreLevel.shadowColor = this._LEVEL_shadowPlayer;

            if (this.autoUpdateBgScore && this.sfBgScore[0] != null) {
                this.bgScore.spriteFrame = this.sfBgScore[0];
            }

        } else {
            this.spBg.spriteFrame = this.sfBg[1];

            // set outline color
            this.lbName.outlineColor = this._NAME_outlineNotPlayer;
            this.lbIndex.outlineColor = this._INDEX_outlineNotPlayer;
            this.lbIndex.shadowColor = this._INDEX_shadowNotPlayer;
            // this.lbScoreLevel.outlineColor = this._LEVEL_outlineNotPlayer;
            // this.lbScoreLevel.shadowColor = this._LEVEL_shadowNotPlayer;

            if (this.autoUpdateBgScore && this.sfBgScore[1] != null) {
                this.bgScore.spriteFrame = this.sfBgScore[1];
            }
        }

        this.SetRank(indexPlayer);

        // set up prize
        switch (true) {
            case indexPlayer == 1: case indexPlayer == 2: case indexPlayer == 3:
                this.spPrize.node.active = this.lbNumPrizeMid.node.active = this.lbNumPrizeRight.node.active = false;
                this.nChest.active = true;
                this.nChest.getComponent(Sprite).spriteFrame = this.sfChests[indexPlayer - 1];
                break;
            case indexPlayer <= CONFIG_HAT_RACE.TOP_BOT_RANK:
                this.nChest.active = false;
                this.spPrize.node.active = true;
                const prizeSuitRank = DataHatRace_christ.Instance.GetPrizeRank(indexPlayer - 1);
                const prizeDisplay = prizeSuitRank[0]
                const sfPrize = await MConfigResourceUtils.getImageItem(prizeDisplay.typePrize, prizeDisplay.typeReceivePrize);
                this.spPrize.spriteFrame = sfPrize;
                if (prizeDisplay.typePrize == TYPE_PRIZE.MONEY) {
                    this.lbNumPrizeMid.string = prizeDisplay.GetStringValue();
                    this.lbNumPrizeMid.node.active = true;
                    this.lbNumPrizeRight.node.active = false;
                } else {
                    this.lbNumPrizeMid.string = prizeDisplay.GetStringValue_2();
                    this.lbNumPrizeMid.node.active = false;
                    this.lbNumPrizeRight.node.active = true;
                }
                break;
            default:
                this.nChest.active = this.spPrize.node.active = this.lbNumPrizeMid.node.active = this.lbNumPrizeRight.node.active = false;
                break;
        }

        this.LoadImage();
    }

    public SetUpWithoutChangeUI(pathAvatar: string, namePlayer: string, isPlayer: boolean, dataItem: InfoBot_HatRace = null) {
        this._pathAvatar = pathAvatar;
        this._isPlayer = isPlayer;
        this._dataItem = dataItem;

        this.lbName.string = namePlayer;

        this.UpdateUIRightIsPlayer(this._isPlayer);
        this.LoadImage();
    }

    //#region common func
    public LoadImage() {
        let self = this;
        this.spAvatar.spriteFrame = null;
        try {
            ResourceUtils.TryLoadImage(this._pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._pathAvatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    public SetScore(score: number) {
        this.lbScoreLevel.string = score.toString();
    }

    public SetRank(rank: number) {
        this.lbIndex.string = `${rank}`;

        // set sprite frame for rank
        switch (rank) {
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

    public UpdateUIRightIsPlayer(isPlayer: boolean) {
        this._isPlayer = isPlayer;
        if (this._isPlayer) {
            this.spBg.spriteFrame = this.sfBg[0];

            //set outline color
            this.lbName.outlineColor = this._NAME_outlinePlayer;
            this.lbIndex.outlineColor = this._INDEX_outlinePlayer;
            this.lbIndex.shadowColor = this._INDEX_shadowPlayer;
            // this.lbScoreLevel.outlineColor = this._LEVEL_outlinePlayer;
            // this.lbScoreLevel.shadowColor = this._LEVEL_shadowPlayer;
        } else {
            this.spBg.spriteFrame = this.sfBg[1];

            // set outline color
            this.lbName.outlineColor = this._NAME_outlineNotPlayer;
            this.lbIndex.outlineColor = this._INDEX_outlineNotPlayer;
            this.lbIndex.shadowColor = this._INDEX_shadowNotPlayer;
            // this.lbScoreLevel.outlineColor = this._LEVEL_outlineNotPlayer;
            // this.lbScoreLevel.shadowColor = this._LEVEL_shadowNotPlayer;
        }
    }

    public PlayAnimIncreaseScore(timeIncrease: number, newScore: number, newRank: number) {
        const self = this;
        const nowScore: number = parseInt(this.lbScoreLevel.string);
        const distanceScore: number = newScore - nowScore;

        const nowRank: number = parseInt(this.lbIndex.string);
        const distanceRank: number = newRank - nowRank;

        tween(this.lbScoreLevel.node)
            .to(timeIncrease, {}, {
                onUpdate(target, ratio) {
                    const newScore = (nowScore + distanceScore * ratio).toFixed(0);
                    self.lbScoreLevel.string = newScore;
                    const newRankPlayerReach = parseInt((nowRank + distanceRank * ratio).toFixed(0));
                    self.SetRank(newRankPlayerReach);
                },
            })
            .call(() => {
                this.lbScoreLevel.string = newScore.toString();
            })
            .start();
    }
    public CheckIsPlayer() { return this._isPlayer; }
    //#endregion common func
    //===============================

    //===============================
    //#region func btn
    private OnBtnChest() {
        if (this._dataItem == null || this._dataItem.rank < 0 || this._dataItem.rank >= 3) { return; }
        LogEventManager.Instance.logButtonClick(`prize`, "ItemBotHatRace");

        clientEvent.dispatchEvent(EVENT_HAT_RACE.NOTIFICATION_ITEMS
            , Array.from(DataHatRace_christ.Instance.GetPrizeRank(this._dataItem.rank))
            , TYPE_BUBBLE.BOTTOM_MID
            , this.nChest.worldPosition.clone()
            , true
            , this.node.parent.parent
        )
    }
    //#endregion func btn
    //===============================
}


