import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { ParamCustomUIWin } from './Type_UIWin';
import { CurrencySys } from '../../CurrencySys';
import { GameManager } from '../../GameManager';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { IPrize, IShareNormalData, IUIPopUpRemoveAds, TYPE_EVENT_GAME, TYPE_LEVEL_NORMAL, TYPE_PRIZE, TYPE_RECEIVE, TYPE_UI_SHARE } from '../../../Utils/Types';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { ListPrizeUIWin } from './ListPrizeUIWin';
import { UIWin_anim_2 } from './UIWin_anim_2';
import { Utils } from '../../../Utils/Utils';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { OtherUIWin } from './OtherUIWin';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('UIWin')
export class UIWin extends UIBaseSys {
    @property(UIWin_anim_2) uiWin_anim2: UIWin_anim_2;
    @property(Node) nBtnClaimx2: Node;
    @property(Node) nBtnContinue: Node;
    @property(Node) nBtnShare: Node;
    @property(Sprite) icX2: Sprite;
    // @property(SpriteFrame) sfTicket: SpriteFrame
    // @property(SpriteFrame) sfAds: SpriteFrame
    @property(Label) lbLevel: Label;
    @property(Label) lbLevelShadow: Label;
    @property(Label) lbCoinCotinue: Label;
    @property(Label) lbCoinCotinue_shadow: Label;
    @property(Label) lbCoinX2: Label;
    @property(Label) lbCoinX2_shadow: Label;
    @property(ListPrizeUIWin) listPrizeUIWin: ListPrizeUIWin;
    @property([Node]) listNBodyWin: Node[] = [];
    @property(OtherUIWin) otherUIWin: OtherUIWin;

    private _isWatchAdsDone: boolean = true;
    private _timeIncreaseText: number = 0.15;

    private _isAnim: boolean = true;

    private readonly POS_BODY_WIN_NO_SUB: Vec3 = Vec3.ZERO.clone().add3f(0, 30, 0);
    private readonly POS_BODY_WIN_SUB: Vec3 = new Vec3(0, 180, 0);

    private _isShadowUI: boolean = false;

    private _timeStartShow: number = -1;
    private _timeClickNext: number = -1;

    //#region func base UI
    public async PrepareDataShow(): Promise<void> {
        this._timeStartShow = Date.now();

        this.ShowShadow();
        (async () => {
            const timeWrongByCallCode = 0.1;
            this._isShadowUI = true;
            await Utils.delay((timeWrongByCallCode + this.nShadowSelf.timeShowShadow) * 1000);
            this._isShadowUI = false;
        })();

        // =============== Data ====================
        this.uiWin_anim2.InitCb(this.ShowEffItem.bind(this), this.ShowItemPrizes.bind(this), this.TryShowInter.bind(this))
        this.SetUpData();
        this.uiWin_anim2.PrepareAnim();

        // normal nhưng hard| supper hard sẽ không có x2 coin
        const data = this._dataCustom as ParamCustomUIWin;
        const levelPlayer = GameManager.Instance.JsonPlayGame.LEVEL;

        // chỉ hiển thị trong trường hợp không phải level tut và ko phải khó vs super hard
        // switch (data.typeUI) {
        //     case 'Hard': case 'SupperHard':
        //         this.nBtnClaimx2.active = false;
        //         break;
        // }
        if (levelPlayer <= MConfigs.LEVEL_CAN_SHOW_X2_REWARD) {
            this.nBtnClaimx2.active = false;
        }

        // check if has skip'its để sử dụng thì cập nhật lại dữ liệu
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     this.UpdateUIBtnClaimX2();
        // }

        // show create shortCut nếu như user vượt qua level 2
        if (levelPlayer == 2) {
            FBInstantManager.Instance.CreateShortcut();
        }

        this.lbLevel.string = this.lbLevelShadow.string = `LEVEL ${levelPlayer}`;

        // check pos body win
        const canShowSubUI = this.otherUIWin.TryInitUIShowing();
        this.listNBodyWin.forEach(nBodyWin => {
            nBodyWin.position = canShowSubUI ? this.POS_BODY_WIN_SUB : this.POS_BODY_WIN_NO_SUB;
        })

        // list item
        try {
            let listPrizeItemShow: IPrize[] = [];
            if (data.coin != null && data.coin > 0) listPrizeItemShow.push(new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, data.coin));
            if (data.building != null && data.building > 0) listPrizeItemShow.push(new IPrize(TYPE_PRIZE.BUILDING, TYPE_RECEIVE.NUMBER, data.building));

            // check in the event level progress
            let numCarLevelProgress: number = 0;
            if (!DataLevelProgressionSys.Instance.IsEndEvent()) {
                numCarLevelProgress = await DataLevelProgressionSys.Instance.GetCarSameKeyColorWithLevel(GameManager.Instance.JsonPlayGame.LEVEL);
            }

            // set data UIWin
            this.listPrizeUIWin.SetUp(listPrizeItemShow, numCarLevelProgress);
        } catch (e) {
            console.error(e);
        }

        // label
        if (data.coin != null) {
            const numCoinx2 = data.coin * 2;
            this.lbCoinCotinue.string = this.lbCoinCotinue_shadow.string = data.coin.toString();
            this.lbCoinX2.string = this.lbCoinX2_shadow.string = `${numCoinx2}`;
        }



    }

    private async TryShowInter() {
        const self = this;
        // const valid2 = (!MConfigs.isMobile && GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER_PC) || (MConfigs.isMobile);

        // switch (true) {
        //     case GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL && GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER && valid2:
        //         self._isWatchAdsDone = false;
        //         // FBInstantManager.Instance.Show_InterstitialAdAsync("uiwin", (error: Error | null, success: string) => {
        //         //     if (GameManager.Instance.levelPlayerNow == MConfigs.LEVEL_CAN_SHOW_INTER) {
        //         //         // // khi win ở level 3 => sẽ tự động hiển thị gói ko mua quảng cáo
        //         //         // if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(MConfigs.IAP_NO_ADS)) {
        //         //         //     // hiển thị gói no ads
        //         //         //     const dataCustom: IUIPopUpRemoveAds = {
        //         //         //         isEmitContinue: false
        //         //         //     }
        //         //         //     clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_REMOVE_ADS, 1, true, dataCustom);
        //         //         // }
        //         //     }
        //         //     self._isWatchAdsDone = true;
        //         // });

        //         PokiSDKManager.Instance.Show_InterstitialAdAsync("uiwin", (error: Error | null, success: string) => {
        //             if (GameManager.Instance.levelPlayerNow == MConfigs.LEVEL_CAN_SHOW_INTER) {
        //                 // // khi win ở level 3 => sẽ tự động hiển thị gói ko mua quảng cáo
        //                 // if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(MConfigs.IAP_NO_ADS)) {
        //                 //     // hiển thị gói no ads
        //                 //     const dataCustom: IUIPopUpRemoveAds = {
        //                 //         isEmitContinue: false
        //                 //     }
        //                 //     clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_REMOVE_ADS, 1, true, dataCustom);
        //                 // }
        //             }
        //             self._isWatchAdsDone = true;
        //         });    
        //         break;
        //     case (GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND || GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT) && valid2:
        //         self._isWatchAdsDone = false;
        //         // FBInstantManager.Instance.Show_InterstitialAdAsync("uiwin", (error: Error | null, success: string) => {
        //         //     self._isWatchAdsDone = true;
        //         // });

        //         PokiSDKManager.Instance.Show_InterstitialAdAsync("uiwin", (error: Error | null, success: string) => {
        //             self._isWatchAdsDone = true;
        //         });
        //         break;
        // }
        self._isWatchAdsDone = true;
        await Utils.WaitReceivingDone(() => self._isWatchAdsDone);
    }

    private UpdateUIBtnClaimX2() {
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     this.icX2.spriteFrame = this.sfTicket;
        // } else {
        //     this.icX2.spriteFrame = this.sfAds;
        // }
    }

    public async UICustomShow(): Promise<void> {
        this._isAnim = true;

        await Utils.WaitReceivingDone(() => !this._isShadowUI);
        await Utils.delay(0.2 * 1000);
        await this.uiWin_anim2.PlayAnim();

        (async () => {
            const timeWaitToShowShubDashRush = 1.2;
            await Utils.delay(timeWaitToShowShubDashRush * 1000);
            try {
                if (this.otherUIWin != null) {
                    // try show  other UI
                    this.otherUIWin.TryShowUIShowing();
                }
            } catch (e) {

            }
        })();

        this._isAnim = false;
    }

    private async ShowEffItem(timeAnim: number) {
        this.listPrizeUIWin.PlayAnimItems(timeAnim);
    }

    private async ShowItemPrizes(timeScaleEachItem: number, timeDelayEachItem: number) {
        for (let i = 0; i < this.listPrizeUIWin._listNItem.length; i++) {
            const nItem = this.listPrizeUIWin._listNItem[i];
            tween(nItem)
                .to(timeScaleEachItem, { scale: Vec3.ONE })
                .start()
            await Utils.delay(timeDelayEachItem * 1000);
        }
    }
    //#endregion func base UI

    //============================================
    //#region self
    private IncreaseCoinContinue(timeIncreaseText: number) {
        const rootValue = (this._dataCustom as ParamCustomUIWin).coin;
        const newValue = rootValue * 2;

        const diffCoin: number = newValue - rootValue;
        const self = this;

        return new Promise<void>(resolve => {
            tween(this.lbCoinCotinue.node)
                .to(timeIncreaseText, {}, {
                    onUpdate(target, ratio) {
                        const text = `x${(rootValue + diffCoin * ratio).toFixed(0)}`;
                        self.lbCoinCotinue.string = text;
                        self.lbCoinCotinue_shadow.string = text;
                    },
                })
                .call(() => { resolve() })
                .start();
        });
    }

    private ContinueNextLevel() {
        // not to worry because we will auto move to next scene in here
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        if (GameManager.Instance.levelPlayerNow >= MConfigs.LEVEL_CAN_SHOW_INTER) {
            PokiSDKManager.Instance.Show_InterstitialAdAsync("uiwin", (error: Error | null, success: string) => {
                // send totalCoin and buidling
                let totalCoin = this.coin + this.plusCoin;
                let buidling = this.buidling;

                // move to next level 
                clientEvent.dispatchEvent(MConst.EVENT.NEXT_LEVEL, totalCoin, buidling);
            });
        }else{
            // send totalCoin and buidling
            let totalCoin = this.coin + this.plusCoin;
            let buidling = this.buidling;

            // move to next level 
            clientEvent.dispatchEvent(MConst.EVENT.NEXT_LEVEL, totalCoin, buidling);
        }
        
        
    }

    //#endregion self
    //============================================

    //#region func btn
    private async BtnContinue() {
        // trong trường hợp chưa chạy xong anim thì sẽ ko cho thực hiện lệnh vì spine vẫn đang chạy chưa kịp add ref
        if (this._isAnim) { return; }
        this._timeClickNext = Date.now();
        const timeUntilLoadNextLevel = this._timeClickNext - this._timeStartShow;
        // console.warn("time next level: ", timeUntilLoadNextLevel);
        MConfigs.timeClickNextLevel = Date.now();

        LogEventManager.Instance.logTimeFromEndGameToClickNextLevel(GameManager.Instance.levelPlayerNow, timeUntilLoadNextLevel);
        LogEventManager.Instance.logButtonClick(`continue`, "UIWinNormal");

        this.ContinueNextLevel();
    }

    private async BtnReceiveCoinX2() {
        if (this._isAnim) { return; }
        LogEventManager.Instance.logButtonClick(`ads_x2_reward`, "UIWinNormal");

        const self = this;

        async function UseSuccess() {
            self.IncreaseCoinReward('Double');
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            await Promise.all([
                self.IncreaseCoinContinue(self._timeIncreaseText),
                // anim thêm tiền vào reward
                self.listPrizeUIWin.Anim_IncreaseCoinReward_ExceptX2(self._timeIncreaseText),
                // ẩn button claim x2 và đẩy button continue vào giữa
                self.uiWin_anim2.Anim_ScaleBtn(self.nBtnClaimx2, self.nBtnContinue, Vec3.ZERO)
            ])
            // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
            self.UpdateUIBtnClaimX2();

            // next level
            self.ContinueNextLevel();
        }

        // check has skip'Its thì pass luôn ko cần gọi FBInstanceManager
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     CurrencySys.Instance.AddTicket(-1, 'UIWin_X2_COIN', true, true);
        //     UseSuccess();
        //     return;
        // }

        // watch ads
        // FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, 'btn_X2Coin', async (err, succ) => {
        //     if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
        //         UseSuccess();
        //     }
        // });

        PokiSDKManager.Instance.Show_RewardedVideoAsync(this.node.name, 'btn_X2Coin', async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                UseSuccess();
            }
        });
    }

    private async BtnShare() {
        LogEventManager.Instance.logButtonClick("share", "UIWinNormal");

        let levelDone: number = 0;
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL) {
            levelDone = 1;
        } else {
            const data = this._dataCustom as ParamCustomUIWin;
            levelDone = data.level;
        }
        // remember add 1 because the json we save is index
        let jsonShare: IShareNormalData = {
            level: levelDone
        }
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.NORMAL, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    // console.log(base64Image);
                    FBInstantManager.Instance.ShareBestScore(base64Image, (error, success) => { });
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }

        // when you share in fb please add the code below in function share
        // this.nBtnShare.active = false;
    }
    //#endregion fun btn

    //#region dataControl
    private numCar: number = 0;
    private numPass: number = 0;
    private time: number = 0;
    private coin: number = 0;
    private buidling: number = 0;
    private plusCoin: number = 0;

    private SetUpData() {
        const data = this._dataCustom as ParamCustomUIWin;
        this.numCar = data.car;
        this.numPass = data.passenger;
        this.time = data.time;
        this.coin = data.coin;

        this.buidling = MConfigs.DEFAULT_BLOCK_RECEIVE_EACH_PASS_LEVEL;

        // check skill in here and add plus coin
        this.plusCoin = 0;
    }

    private IncreaseCoinReward(type: 'Double' | 'Add', data: number = 0) {
        switch (type) {
            case 'Double':
                this.coin *= 2;
                GameInfoSys.Instance.AddCoinExtraUIWin(this.coin, this.coin / 2);
                break;
            case 'Add':
                this.coin += data;
                GameInfoSys.Instance.AddCoinExtraUIWin(data, data);
                break;
        }
    }
    //#endregion dataControl
}