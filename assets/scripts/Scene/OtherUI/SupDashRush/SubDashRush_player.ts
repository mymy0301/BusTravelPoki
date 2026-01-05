import { _decorator, Color, Component, GradientRange, Label, Node, RealCurve, Sprite, SpriteFrame, Tween, tween, TweenAction, UIOpacity, Vec3 } from 'cc';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { InfoBot_DashRush } from '../../../Utils/Types';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
import { CONFIG_DR } from '../UIDashRush/TypeDashRush';
const { ccclass, property } = _decorator;

@ccclass('SubDashRush_player')
export class SubDashRush_player extends Component {
    @property(Sprite) spBgPlayer: Sprite;
    @property(Label) lbRankPlayer: Label;
    @property(Label) lbNamePlayer: Label;
    @property(Label) lbScorePlayer: Label;
    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spRank: Sprite;

    @property(RealCurve) crMove_x_on: RealCurve = new RealCurve();
    @property(RealCurve) crMove_y_on: RealCurve = new RealCurve();
    @property(RealCurve) crScale: RealCurve = new RealCurve();

    private _cbGetListImgRank: CallableFunction;
    private _cbGetListImgBg: CallableFunction;
    private _cbGetPosSuitRank: CallableFunction;

    private _infoBot: InfoBot_DashRush = null;
    private _infoBotOld: InfoBot_DashRush = null;
    private _rankOld: number = -1;
    private _rankNow: number = -1;

    private _isPlayer: boolean = false;

    private readonly COLOR_LB_BOT: Color = new Color().fromHEX("#2E416F");
    private readonly COLOR_LB_PLAYER: Color = new Color().fromHEX("#FFFFFF");

    private readonly COLOR_LB_RANK_1: Color = new Color().fromHEX("#fff873");
    private readonly COLOR_LB_OUTLINE_RANK_1: Color = new Color().fromHEX("#650200");
    private readonly COLOR_LB_RANK_OTHER: Color = new Color().fromHEX("#FFF7B9");
    private readonly COLOR_LB_OUTLINE_RANK_OTHER: Color = new Color().fromHEX("#041E34");

    //=======================
    //#region self
    private _pathAvatar: string = ""
    private LoadImgAvatar() {
        const self = this;
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
    //#endregion self
    //=======================

    //=======================
    //#region public method
    public InitCb(cbGetListImgRank: CallableFunction, cbGetListImgBg: CallableFunction, cbGetPosSuitRank: CallableFunction) {
        this._cbGetListImgRank = cbGetListImgRank;
        this._cbGetListImgBg = cbGetListImgBg;
        this._cbGetPosSuitRank = cbGetPosSuitRank
    }

    public SetUp(iInfoPlayer: InfoBot_DashRush, oldInfoPlayer: InfoBot_DashRush, rankNow: number, rankOld: number, isPlayer: boolean) {
        // save data
        this._isPlayer = false;
        this._infoBot = iInfoPlayer;
        this._infoBotOld = oldInfoPlayer;
        this._rankNow = rankNow;
        this._rankOld = rankOld;
        // update lb
        this.lbNamePlayer.string = iInfoPlayer.name;
        this.lbScorePlayer.string = `${oldInfoPlayer != null ? oldInfoPlayer.progress.toString() : iInfoPlayer.progress.toString()}/${CONFIG_DR.DR_MAX_PROGRESS}`;
        this._pathAvatar = iInfoPlayer.avatar;

        // update UI suit rank and player
        //==== rank
        this.UpdateUIRank(rankOld != -1 ? rankOld : rankNow);

        //==== player
        const listImgPlayer: SpriteFrame[] = this._cbGetListImgBg();
        this._isPlayer = isPlayer;
        this.spBgPlayer.spriteFrame = listImgPlayer[isPlayer ? 0 : 1];
        this.lbNamePlayer.enableOutline = isPlayer;
        this.lbScorePlayer.enableOutline = isPlayer;
        this.lbNamePlayer.color = isPlayer ? this.COLOR_LB_PLAYER : this.COLOR_LB_BOT;
        this.lbScorePlayer.color = isPlayer ? this.COLOR_LB_PLAYER : this.COLOR_LB_BOT;

        // load avatar
        this.LoadImgAvatar();
    }

    private UpdateUIRank(rank: number) {
        const listImgRank: SpriteFrame[] = this._cbGetListImgRank();
        this.lbRankPlayer.string = rank.toString();
        switch (rank) {
            case 1:
                this.spRank.spriteFrame = listImgRank[0];
                this.lbRankPlayer.color = this.COLOR_LB_RANK_1;
                this.lbRankPlayer.outlineColor = this.COLOR_LB_OUTLINE_RANK_1;
                break;
            default:
                this.spRank.spriteFrame = listImgRank[1];
                this.lbRankPlayer.color = this.COLOR_LB_RANK_OTHER;
                this.lbRankPlayer.outlineColor = this.COLOR_LB_OUTLINE_RANK_OTHER;
                break;
        }
    }
    //#endregion public method
    //=======================

    //=======================
    //#region anim
    public PrepareAnimShow() {
        const posNow = this.node.position.clone();
        this.node.position = new Vec3(posNow.x, this.POS_Y_START_ANIM);
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
    }

    private readonly POS_Y_START_ANIM = -20;
    public readonly TIME_ANIM_SHOW = 0.5;
    public AnimShow() {
        const posNow = this.node.position.clone();
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
        const posEnd = new Vec3(posNow.x, 0);
        tween(this.node)
            .to(this.TIME_ANIM_SHOW, { position: posEnd }, {
                onUpdate(target, ratio) {
                    opaCom.opacity = 255 * ratio;
                },
            })
            .start();
    }

    public readonly TIME_INCREASE_SCORE: number = 0.3;
    private AnimIncreaseScore() {
        if (this._infoBotOld == null || this._infoBot == null) { return; }

        const self = this;

        const oldScore = this._infoBotOld.progress;
        const newScore = this._infoBot.progress;
        const distanceScore = newScore - oldScore;

        if (distanceScore > 0) {
            return new Promise<void>(resolve => {
                tween(this.lbScorePlayer.node)
                    .to(this.TIME_INCREASE_SCORE, {}, {
                        onUpdate(target, ratio) {
                            self.lbScorePlayer.string = `${Math.floor(oldScore + distanceScore * self.crMove_x_on.evaluate(ratio)).toFixed(0)}/${CONFIG_DR.DR_MAX_PROGRESS}`;
                        },
                    })
                    .call(() => {
                        self.lbScorePlayer.string = `${newScore.toString()}/${CONFIG_DR.DR_MAX_PROGRESS}`;
                        resolve();
                    })
                    .start();
            })
        }

        return null;
    }

    private AnimIncreaseRank(timeIncreaseRankTotal: number) {
        const self = this;
        const distanceRank = self._rankNow - self._rankOld;
        if (distanceRank == 0) {
            return null;
        }

        const tweenSeq = tween(self.lbRankPlayer.node);
        //increase rank
        for (let i = 1; i <= Math.abs(distanceRank); i++) {
            const timeIncreaseEachRank = self.crMove_x_on.evaluate(i / distanceRank) * timeIncreaseRankTotal;
            const rankAfterMove = self._rankOld + (distanceRank * i / Math.abs(distanceRank));
            tweenSeq
                .delay(timeIncreaseEachRank)
                .call(() => {
                    self.UpdateUIRank(rankAfterMove);
                })
        }
        return new Promise<void>(resolve => {
            tweenSeq
                .call(() => { resolve() })
                .start();
        })
    }

    private AnimMoveNPlayer(infoMove: InfoMove) {
        const self = this;
        const basePos = this.node.position.clone();
        const distance = infoMove.posNew.clone().subtract(basePos.clone());
        const scaleRoot = Vec3.ONE.clone();
        const scaleEnd = new Vec3(1.2, 1.2, 1.2);
        return new Promise<void>(resolve => {
            // move the right place
            tween(this.node)
                .to(infoMove.timeMove,
                    // { position: infoMove.posNew }
                    {}
                    , {
                        onUpdate(target, ratio) {
                            const newDistanceX = self.crMove_x_on.evaluate(ratio) * distance.x;
                            const newDistanceY = self.crMove_y_on.evaluate(ratio) * distance.y;
                            self.node.position = new Vec3(basePos.x + newDistanceX, basePos.y + newDistanceY, basePos.z);
                            if (self._isPlayer) {
                                let scaleRight: Vec3 = new Vec3();
                                Vec3.lerp(scaleRight, scaleRoot, scaleEnd, self.crScale.evaluate(ratio));
                                self.node.scale = scaleRight.clone();
                            }
                        }
                    })
                .call(() => { resolve() })
                .start();
        })
    }

    public readonly SPEED_MOVE_TO_RIGHT_PLACE: number = 300;
    public readonly TIME_MOVE_TO_RIGHT_PLACE: number = 1;
    public async AnimMoveToRightPlace() {
        if (this._infoBotOld == null || this._infoBot == null) { return; }
        const infoMove: InfoMove = this.GetInfoMoveToRightPlace();
        if (infoMove == null) { return; }

        const promiseIncreaseScore = this.AnimIncreaseScore();

        const promiseIncreaseRank = this.AnimIncreaseRank(infoMove.timeMove);

        const promiseMovePlayer = this.AnimMoveNPlayer(infoMove);

        return new Promise<void>(async resolve => {
            await Promise.all([
                promiseMovePlayer,
                promiseIncreaseScore,
                promiseIncreaseRank
            ]);
            resolve();
        })
    }
    public GetInfoMoveToRightPlace(): InfoMove {
        if (this._infoBotOld == null || this._infoBot == null) { return null; }
        const posOldRank: Vec3 = this.node.position.clone();
        const posNewRank: Vec3 = this._cbGetPosSuitRank(this._rankNow);
        const distanceRank = Math.abs(this._rankNow - this._rankOld);
        const distanceMove = Math.abs(posNewRank.x - posOldRank.x);
        // const timeMove = distanceMove / this.SPEED_MOVE_TO_RIGHT_PLACE;
        // const timeMove = this.TIME_MOVE_TO_RIGHT_PLACE;
        const timeMove = this.TIME_MOVE_TO_RIGHT_PLACE * 0.5 + this.TIME_MOVE_TO_RIGHT_PLACE * 0.5 / (CONFIG_DR.DR_MAX_PLAYER_JOIN - distanceRank);
        return { timeMove: timeMove, posNew: posNewRank };
    }
    //#endregion anim
    //=======================
}

interface InfoMove {
    timeMove: number,
    posNew: Vec3,
}


