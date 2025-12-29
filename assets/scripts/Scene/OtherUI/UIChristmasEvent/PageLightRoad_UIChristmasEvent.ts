import { _decorator, CCBoolean, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { DataLightRoad_christ } from '../../../DataBase/DataLightRoad_christ';
import { MProgressSlice } from '../../../Utils/UI/MProgressSlice';
import { CONFIG_LR_CHRIST, EVENT_LR_CHRIST, IInfoChestLightRoad, IInfoUIUpdateLR } from './LightRoad/TypeLightRoad';
import { clientEvent } from '../../../framework/clientEvent';
import { IPrize } from '../../../Utils/Types';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { BubbleSys, ICustomBubble } from '../Others/Bubble/BubbleSys';
import { PageItem } from '../../../Common/UltimatePageView/PageItem';
import { GameManager } from '../../GameManager';
import { Utils } from '../../../Utils/Utils';
import { AnimLRReceivePrize } from './LightRoad/AnimLRReceivePrize';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { EVENT_CLOCK_ON_TICK } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { ListLightChristTree } from './LightRoad/ListLightChristTree';

const { ccclass, property } = _decorator;

@ccclass('PageLightRoad_UIChristmasEvent')
export class PageLightRoad_UIChristmasEvent extends PageItem {
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(Label) lbProgress: Label;
    @property(MProgressSlice) spProgress: MProgressSlice;
    @property(Sprite) spChest: Sprite;
    @property(SpriteFrame) listSfChest: SpriteFrame[] = [];
    @property(BubbleSys) bubbleSys: BubbleSys;
    @property(AnimLRReceivePrize) animLRReceivePrize: AnimLRReceivePrize;
    @property(Label) lbTime: Label;
    @property(ListLightChristTree) listLightChristTree: ListLightChristTree;
    @property(Node) nIcBulbEndAnim: Node;
    @property(Node) nBlockUI: Node;
    @property(Node) nTime: Node;
    @property(Node) nTargetPosTime: Node;
    @property(CCBoolean) testUI: boolean = false;

    private _infoNow: IInfoChestLightRoad = null;
    private _dataShowNow: IInfoUIUpdateLR = null;

    private _cbShowUI: CallableFunction = null;
    private _cbHideUI: CallableFunction = null;
    private _cbShowBlockUI: CallableFunction = null;
    private _cbHideBlockUI: CallableFunction = null;

    //==========================================================
    //#region base
    protected onEnable(): void {
        this.infoUIBase.node.active = false;
        this.UpdateUITime();
        this.TryRegisterTime();
        this.nBlockUI.active = false;
    }

    protected start(): void {
        // this.nTime.worldPosition = new Vec3(this.nTargetPosTime.worldPosition.x, this.nTime.worldPosition.y, 0);
        this.bubbleSys.SetAnchorView(this.node.worldPosition)
    }

    protected onDisable(): void {
        this.bubbleSys.ForceClose();
        this.UnRegisterTime();
    }

    public RegisterCb(cbShowUI: CallableFunction, cbHideUI: CallableFunction, cbShowBlockUI: CallableFunction, cbHideBlockUI: CallableFunction): void {
        this._cbShowUI = cbShowUI;
        this._cbHideUI = cbHideUI;
        this._cbShowBlockUI = cbShowBlockUI;
        this._cbHideBlockUI = cbHideBlockUI;
    }

    public async CBPrepareShow(): Promise<void> {
        if (!this.listLightChristTree.WasInited) {
            const progressOld = DataLightRoad_christ.Instance.GetProgressOld();
            this.listLightChristTree.Init(progressOld);

            switch (true) {
                case this.testUI:
                    await this.UpdateUIProgress(0);
                    break;
                default:
                    this.UpdateUIProgress(progressOld);
                    this.listLightChristTree.TurnOnAll(progressOld, 'not');
                    break;
            }
        }
    }

    public async CBShowDone(): Promise<void> {
        switch (true) {
            case this.testUI:
                this.nBlockUI.active = true;
                await this.AnimAllUI(1);
                this.nBlockUI.active = false;
                break;
        }

        // trong trường hợp lần đầu mở event này => bắn popUp hiển thị info event
        if (!DataLightRoad_christ.Instance.IsPlayedTut()) {
            DataLightRoad_christ.Instance.SavePlayedTut();
            this.infoUIBase.Show();
        }
    }
    //#endregion base

    //==========================================================
    //#region public 
    public async PlayAnimReceiveNewLight() {
        this.nBlockUI.active = true;
        const progressNow = DataLightRoad_christ.Instance.GetProgressNow()

        if (DataLightRoad_christ.Instance.GetProgressOld() >= CONFIG_LR_CHRIST.MAX_PROGRESS) {
            // NOTE not do any thing here
        } else {
            // turn on next light và play anim increase progress
            await Promise.all([
                this.AnimAllUI(progressNow),
                this.listLightChristTree.AnimTurnOnNextLight()
            ]);
        }

        this.nBlockUI.active = false;
    }
    //#endregion public

    //==========================================================
    //#region private
    private async AnimAllUI(progressTarget: number) {
        // block UI
        this._cbShowBlockUI();

        const progressOld = DataLightRoad_christ.Instance.GetProgressOld();
        const dataNewShow = DataLightRoad_christ.Instance.GetInfoToShowUI(progressTarget);
        dataNewShow.infoPrize.wPosChest = this.spChest.node.worldPosition.clone();
        const isReachNewProgress =
            this._dataShowNow != null
            && (dataNewShow.infoPrize.id > this._dataShowNow.infoPrize.id
                || (dataNewShow.ratioProgress == 1 && dataNewShow.infoPrize.id == CONFIG_LR_CHRIST.MAX_PRIZE - 1 && !DataLightRoad_christ.Instance.IsReceivePrizeIndex(dataNewShow.infoPrize.id)));

        let isAnimming: boolean = false;

        // có 2 trường hợp xảy ra ở đây đó là tăng tiến trình thông thường và mở quà
        // kiểm tra trong trường hợp tăng tiến trình không unlock quà => tăng tiến trình thông thường
        switch (true) {
            // trường hợp chưa tồn tại progress được set trước đấy
            case this._dataShowNow == null:
                // show progress hiện tại mà ko cần anim
                this.UpdateUIProgress(progressTarget);
                this.listLightChristTree.TurnOnAll(progressTarget, 'all');
                break;
            // trường hợp đã tồn tại progress được set trước đấy và chưa reach nhận quà => hiển thị anim tăng tiến trình thông thường
            case !isReachNewProgress:
                isAnimming = true;
                this.AnimIncreaseProgress(dataNewShow, false, null, () => { isAnimming = false });
                break;
            // trường hợp đã tồn tại progress được set trước đấy và reach nhận quà => hiển thị anim tăng tiến trình và hiển thị giao diện nhận thưởng
            case isReachNewProgress:
                isAnimming = true;
                this.AnimIncreaseProgress(dataNewShow, true, (infoNew: IInfoUIUpdateLR) => {
                    // chạy anim nhận thưởng ở đây
                    //TODO có hai anim nhận thưởng đó là nhận quà ngay trong UI và gọi ra lobby
                    // hiện tại hãy thực hiện nhận quà ngay trong UI trước
                    const dataOldShow = DataLightRoad_christ.Instance.GetInfoToShowUI(progressOld);
                    const prizeReceive = DataLightRoad_christ.Instance.GetPrizeByIndex(dataOldShow.infoPrize.id);
                    prizeReceive.wPosChest = this.spChest.node.worldPosition.clone();

                    this.animLRReceivePrize.AnimReceivePrizeFromChest('lightRoad', prizeReceive, () => { isAnimming = false });
                    this.UpdateUIProgressByInfoZeroProgress(infoNew);
                }, null);
                break;
        }

        // hide block UI
        this._cbHideBlockUI();
        // đợi cho đến khi anim xong
        await Utils.WaitReceivingDone(() => { return !isAnimming; })
    }

    private AnimIncreaseProgress(newInfo: IInfoUIUpdateLR, isReachNewPrize: boolean, cbUpdatePrize: (infoNew: IInfoUIUpdateLR) => void, cbDone: CallableFunction) {
        // cập nhật lại dataProgressOld và nhận thưởng prize
        const progressOld = DataLightRoad_christ.Instance.GetProgressOld();
        const dataOldShow = DataLightRoad_christ.Instance.GetInfoToShowUI(progressOld);

        // có hai trường hợp ở đây là progress tăng tiến lên bình thường và progress tăng tiến lên max rồi tăng tiến đến vị trí chính xác
        const targetProgress = newInfo.ratioProgress;
        const dataProgressStringNow = this.lbProgress.string.split('/')
        const maxProgressBeforeUpdate = Number.parseInt(dataProgressStringNow[1]);
        const progressBeforeUpdate = Number.parseInt(dataProgressStringNow[0]);
        const raitoBeforeUpdate = progressBeforeUpdate / maxProgressBeforeUpdate;
        const self = this;
        this._dataShowNow = newInfo;

        if (isReachNewPrize) {
            DataLightRoad_christ.Instance.UpdateProgressOld(false);
            DataLightRoad_christ.Instance.ReceivePrize(dataOldShow.infoPrize.id, false); // ta cần -1 ở đây vì phần thưởng nhận được là phần thưởng cũ
            PrizeSys.Instance.AddPrize(dataOldShow.infoPrize.listPrize, "LightRoad", true, false);
            // Tween to 1, then reset to 0 and tween to targetProgress
            tween(this.spProgress.node)
                .parallel(
                    tween(this.spProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.spProgress.progress = raitoBeforeUpdate + ratio * (1 - raitoBeforeUpdate);
                        },
                    }),
                    tween(this.lbProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.lbProgress.string = `${Math.floor(progressBeforeUpdate + ratio * (maxProgressBeforeUpdate - progressBeforeUpdate))}/${maxProgressBeforeUpdate}`;
                        },
                    })
                )
                .call(() => {
                    this.spProgress.progress = 0;
                    this.lbProgress.string = `0/${newInfo.infoPrize.progressRequired}`;
                    cbUpdatePrize && cbUpdatePrize(newInfo);
                })
                .parallel(
                    tween(this.spProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.spProgress.progress = ratio * newInfo.ratioProgress;
                        },
                    }),
                    tween(this.lbProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.lbProgress.string = `${Math.floor(ratio * newInfo.progressNow)}/${newInfo.infoPrize.progressRequired}`;
                        },
                    })
                )
                .call(() => { cbDone && cbDone() })
                .start();
        } else {
            DataLightRoad_christ.Instance.UpdateProgressOld(true);
            // Tween directly to targetProgress
            tween(this.spProgress.node)
                .parallel(
                    tween(this.spProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.spProgress.progress = raitoBeforeUpdate + ratio * (newInfo.ratioProgress - raitoBeforeUpdate);
                        },
                    }),
                    tween(this.lbProgress.node).to(0.2, {}, {
                        easing: 'quadOut', onUpdate(target, ratio) {
                            self.lbProgress.string = `${Math.floor(progressBeforeUpdate + ratio * (newInfo.progressNow - progressBeforeUpdate))}/${newInfo.infoPrize.progressRequired}`;
                        },
                    })
                )
                .call(() => { cbDone && cbDone() })
                .start();
        }
    }

    private UpdateUIProgress(progressTarget: number) {
        const dataShow = DataLightRoad_christ.Instance.GetInfoToShowUI(progressTarget);
        this._dataShowNow = dataShow;
        this._infoNow = dataShow.infoPrize;
        this.spProgress.progress = dataShow.ratioProgress;
        this.lbProgress.string = `${dataShow.progressNow}/${dataShow.infoPrize.progressRequired}`;
        this.UpdateUIPrize(dataShow.infoPrize.visual);
    }

    private UpdateUIProgressByInfoZeroProgress(newInfo: IInfoUIUpdateLR) {
        this._infoNow = newInfo.infoPrize;
        this.spProgress.progress = 0;
        this.lbProgress.string = `${newInfo.progressNow}/${newInfo.infoPrize.progressRequired}`;
        this.UpdateUIPrize(newInfo.infoPrize.visual);
    }

    private UpdateUIPrize(indexVisual: number) {
        this.spChest.spriteFrame = this.listSfChest[indexVisual];
    }
    //#endregion private

    //==========================================================
    //#region anim
    //#endregion anim

    //=======================================
    //#region  time
    private TryRegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UpdateUITime() {
        const time = DataLightRoad_christ.Instance.GetTimeEndEvent();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }
    //#endregion time

    //==========================================================
    //#region btn
    public OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "PageLightRoad_UIChristmasEvent");
        this.infoUIBase.Show();
    }
    public OnBtnPlay() {
        LogEventManager.Instance.logButtonClick(`play`, "PageLightRoad_UIChristmasEvent");

        GameManager.Instance.PreparePlayChristmas();
    }
    public OnBtnChest() {
        // noti show bubblePrize for chest
        const listPrize: IPrize[] = this._infoNow.listPrize;
        const wPosChest = this.spChest.node.worldPosition.clone();

        const lengthPrize: number = listPrize.length;
        let iCustomBubble: ICustomBubble = {
            ar: [0, 0, (4 - lengthPrize) * 50, 0]
        };

        clientEvent.dispatchEvent(EVENT_LR_CHRIST.NOTI_PRIZE,
            Array.from(listPrize)
            , TYPE_BUBBLE.BOTTOM_LEFT
            , wPosChest
            , true
            , this.node
            , iCustomBubble
        )
    }
    //#endregion btn
}


