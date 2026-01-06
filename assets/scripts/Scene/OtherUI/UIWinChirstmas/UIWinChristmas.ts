import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { GameManager } from '../../GameManager';
import { MConfigs } from '../../../Configs/MConfigs';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { UIWin_anim_2 } from '../UIWin/UIWin_anim_2';
import { ListPrizeUIWin } from '../UIWin/ListPrizeUIWin';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { UISupHatRace } from '../SupHatRace/UISupHatRace';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { IDataUIEventChristmas } from '../UIChristmasEvent/TypeChristmasEvent';
import { CONFIG_HAT_RACE } from '../UIChristmasEvent/HatRace/TypeHatRace';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('UIWinChristmas')
export class UIWinChristmas extends UIBaseSys {
    @property(UIWin_anim_2) uiWin_anim2: UIWin_anim_2;
    @property(Node) nBtnContinue: Node;
    @property(Label) lbLevel: Label;
    @property(Label) lbLevelShadow: Label;
    @property(ListPrizeUIWin) listPrizeUIWin: ListPrizeUIWin;
    @property([Node]) listNBodyWin: Node[] = [];
    @property(UISupHatRace) uiSupHatRace: UISupHatRace;
    @property(SpriteFrame) sfLightBubl: SpriteFrame;
    @property(SpriteFrame) sfHatRace: SpriteFrame;

    private _isAnim: boolean = true;

    private _isShadowUI: boolean = false;

    //#region func base UI
    public async PrepareDataShow(): Promise<void> {
        this.ShowShadow();
        (async () => {
            const timeWrongByCallCode = 0.1;
            this._isShadowUI = true;
            await Utils.delay((timeWrongByCallCode + this.nShadowSelf.timeShowShadow) * 1000);
            this._isShadowUI = false;
        })();

        // =============== Data ====================
        this.uiWin_anim2.InitCb(this.ShowEffItem.bind(this), this.ShowItemPrizes.bind(this), null)
        this.uiWin_anim2.PrepareAnim();

        const levelPlayer = GameManager.Instance.JsonPlayChristmas.LEVEL;

        this.lbLevel.string = this.lbLevelShadow.string = `LEVEL ${levelPlayer}`;

        // =============== supUI =============== 
        this.uiSupHatRace.HideUI();

        // =============== list item ===============
        try {
            // luôn init 2 Prize item show đó là light Bulb và Hat race
            this.listPrizeUIWin.InitItemEmpty(1, this.sfLightBubl, Vec3.ONE.clone().multiplyScalar(1));
            const numHatRaceIfWin = CONFIG_HAT_RACE.MULTIPLIER[DataHatRace_christ.Instance.GetIndexOldMutilply()]; // tại sao phải lấy old vì ta đã trigger cập nhật dữ liệu trước khi gọi vào trong này
            this.listPrizeUIWin.InitItemEmpty(numHatRaceIfWin, this.sfHatRace, Vec3.ONE.clone().multiplyScalar(1.5));
        } catch (e) {
            console.error(e);
        }
    }

    public async UICustomShow(): Promise<void> {
        this._isAnim = true;

        await Utils.WaitReceivingDone(() => !this._isShadowUI);
        await Utils.delay(0.2 * 1000);
        this.uiWin_anim2.PlayAnim(() => {
            // =============== supUI =============== 
            this.uiSupHatRace.ShowUI(DataHatRace_christ.Instance.GetIndexOldMutilply());
            DataHatRace_christ.Instance.UpdateIndexMultiply();
        }, () => {
            this._isAnim = false;
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        });
    }

    private async ShowEffItem(timeAnim: number) {
        this.listPrizeUIWin.PlayAnimItems(timeAnim);
    }

    private async ShowItemPrizes(timeScaleEachItem: number, timeDelayEachItem: number) {
        for (let i = 0; i < this.listPrizeUIWin._listNItem.length; i++) {
            const nItem = this.listPrizeUIWin._listNItem[i];
            tween(nItem)
                .to(timeScaleEachItem, { scale: Vec3.ONE.clone() })
                .start()
            await Utils.delay(timeDelayEachItem * 1000);
        }
    }
    //#endregion func base UI

    //#endregion self
    //============================================

    //#region func btn
    private async BtnContinue() {
        // trong trường hợp chưa chạy xong anim thì sẽ ko cho thực hiện lệnh vì spine vẫn đang chạy chưa kịp add ref
        if (this._isAnim) { return; }
        MConfigs.timeClickNextLevel = Date.now();
        LogEventManager.Instance.logButtonClick(`continue`, "UIWinChrist");

        PokiSDKManager.Instance.Show_InterstitialAdAsync("uiwin", () => {
            // show UI Event Christmas
            // gửi kèm 2 node prize => để có thể giữ nguyên chạy anim cho UI mới
            const dataCustom: IDataUIEventChristmas = {
                nPrizes: this.listPrizeUIWin._listNItem
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_CHRISTMAS_EVENT, 1, true, [dataCustom]);
            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_WIN_CHIRSTMAS, 1);
        });
        
    }
    //#endregion fun btn
}