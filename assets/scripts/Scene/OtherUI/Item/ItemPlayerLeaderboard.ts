import { _decorator, CCBoolean, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { ItemScrollViewBase2 } from '../../../Common/ItemScrollViewBase2';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { MConst } from '../../../Const/MConst';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { ItemUltimateSV } from '../../../Common/UltimateScrollView/ItemUltimateSV';
const { ccclass, property } = _decorator;

@ccclass('ItemPlayerLeaderboard')
export class ItemPlayerLeaderboard extends ItemUltimateSV {
    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spBgIndex: Sprite;
    @property(Sprite) spBg: Sprite;
    @property(Label) lbIndex: Label;
    @property(Label) lbName: Label;
    @property(Label) lbScoreLevel: Label;
    @property(Label) lbScoreLevelShadow: Label;
    @property(Sprite) bgScore: Sprite;

    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgIndexRank: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBg: SpriteFrame[] = [];
    @property({ group: { id: "SF_Player", name: "SF_Player", displayOrder: 1 }, type: [SpriteFrame] }) private sfBgScore: SpriteFrame[] = [];

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
    private _dataItem: IDataPlayer_LEADERBOARD = null;

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

    public async SetUp(data: IDataPlayer_LEADERBOARD, contextIdLeaderboard: string, needShowItemMore: boolean = true) {
        let indexPlayer: number = -1;
        indexPlayer = data.rank;

        this._dataItem = data;

        this.lbIndex.string = `${indexPlayer}`;
        this._dataItem = data;
        this._pathAvatar = data.avatar;
        this.lbName.string = data.name;
        this.lbScoreLevelShadow.string = this.lbScoreLevel.string = data.score != Number.EPSILON && data.score != 0 ? data.score.toString() : "???";
        this._isPlayer = data.playerId == MConfigFacebook.Instance.playerID;

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

        // set sprite frame for rank
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

        if (needShowItemMore) {
            this.ShowItem();
        }
    }

    public SetUpWithoutChangeUI(pathAvatar: string, namePlayer: string, isPlayer: boolean, dataItem: IDataPlayer_LEADERBOARD = null) {
        this._pathAvatar = pathAvatar;
        this._isPlayer = isPlayer;
        this._dataItem = dataItem;

        this.lbName.string = namePlayer;

        this.UpdateUIRightIsPlayer(this._isPlayer);
        this.ShowItem();
    }

    //#region common func
    public ShowItem() {
        let self = this;
        this.spAvatar.spriteFrame = null;
        try {
            ResourceUtils.TryLoadImageAvatar(this._pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._pathAvatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    public SetScore(score: number) {
        this.lbScoreLevel.string = score.toString();
        this.lbScoreLevelShadow.string = score.toString();
    }

    public SetRank(rank: number) {
        this.lbIndex.string = `${rank}`;

        // set sprite frame for rank
        switch (rank) {
            case 1:
                this.spBgIndex.spriteFrame = this.sfBgIndexRank[0];
                this.lbIndex.node.active = false;
                break;
            case 2:
                this.spBgIndex.spriteFrame = this.sfBgIndexRank[1];
                this.lbIndex.node.active = false;
                break;
            case 3:
                this.spBgIndex.spriteFrame = this.sfBgIndexRank[2];
                this.lbIndex.node.active = false;
                break;
            default:
                this.lbIndex.node.active = true;
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
                    self.lbScoreLevelShadow.string = newScore;
                    const newRankPlayerReach = parseInt((nowRank + distanceRank * ratio).toFixed(0));
                    self.SetRank(newRankPlayerReach);
                },
            })
            .call(() => {
                this.lbScoreLevel.string = newScore.toString();
                this.lbScoreLevelShadow.string = newScore.toString();
            })
            .start();
    }
    //#endregion common func

    public addFriend() {
        // PlayFabManager.instance.addFriend_byID(this._dataItem.idFB);
    }

    public CheckIsPlayer() { return this._isPlayer; }
}


