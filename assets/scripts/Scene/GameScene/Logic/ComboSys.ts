import { _decorator, Tween, tween } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ComboSys')
export class ComboSys {
    private readonly TIME_LIMIT_TO_SHOW_3_CAR: number = 5;
    private readonly TIME_LIMIT_TO_SHOW_5_CAR: number = 4;

    private _combo: number = 0;
    private _canPlayFXNextCombo: boolean = false;
    private _timeResetCombo: number = 0;
    private _currentTween: Tween<any> = null;

    //=================================================
    //#region Lifecycle methods
    constructor() {
        // listen events
        clientEvent.on(MConst.EVENT.RESET_GAME, this.Reset, this);
        clientEvent.on(MConst.EVENT_TEXT_COMBO.INCREASE_COMBO, this.TryIncreaseCombo, this);
    }

    public OnDestroy(): void {
        this.UnRegisterTime();
        clientEvent.off(MConst.EVENT.RESET_GAME, this.Reset, this);
        clientEvent.off(MConst.EVENT_TEXT_COMBO.INCREASE_COMBO, this.TryIncreaseCombo, this);
    }
    //#endregion Lifecycle methods
    //=================================================

    //=================================================
    //#region self
    private RegisterTime(timeResetCombo: number) {
        // unRegister old tween if exists
        if (this._currentTween) { this.UnRegisterTime(); }

        // register new tween
        this._currentTween = tween(this)
            .delay(timeResetCombo)
            .call(() => {
                // reset combo
                this.ResetCombo();
            })
            .start();
    }
    private UnRegisterTime() {
        this._currentTween?.stop();
    }

    private ResetCombo() {
        // console.log("ResetCombo");
        this._combo = 0;
        this._canPlayFXNextCombo = false;
    }
    //#endregion self
    //=================================================

    //=================================================
    //#region Event handlers
    private Reset() {
        this._combo = 0;
        this._timeResetCombo = 0;
        this._canPlayFXNextCombo = false;
        this.UnRegisterTime();
        clientEvent.dispatchEvent(MConst.EVENT_TEXT_COMBO.STOP_FX_COMBO);
    }

    private TryIncreaseCombo() {
        this._combo += 1;
        this._timeResetCombo = this._combo < 3 ? this.TIME_LIMIT_TO_SHOW_3_CAR : this.TIME_LIMIT_TO_SHOW_5_CAR;

        // register time to reset combo
        this.RegisterTime(this._timeResetCombo);

        // cứ mỗi xe thành công sẽ đc tăng 1 combo và sau x giây sẽ reset combo 
        // nếu số combo đạt dc < 3 thì sẽ reset trong 5 giây
        // còn nếu số combo đạt đc >= 3 thì sẽ reset trong 8 giây
        // nếu số combo đạt đc %3 == 0 và /3 == 1 thì sẽ hiện combo 1 còn nếu /3 >= 2 thì sẽ hiện combo 2

        // check valid to play FX combo
        const comboRatio = this._combo / 3;
        const isComboValid = this._combo % 3 === 0;
        switch (true) {
            // case (this._canPlayFXNextCombo && comboRatio >= 1 && comboRatio < 2) || (isComboValid && comboRatio === 1):
            case isComboValid && comboRatio === 1:
                this._canPlayFXNextCombo = false;
                clientEvent.dispatchEvent(MConst.EVENT_TEXT_COMBO.PLAY_FX_COMBO, 1, (isSuccess: boolean) => { this._canPlayFXNextCombo = !isSuccess; });
                break;
            // case (this._canPlayFXNextCombo && comboRatio >= 2) || (isComboValid && comboRatio >= 2):
            case isComboValid && comboRatio >= 2:
                this._canPlayFXNextCombo = false;
                clientEvent.dispatchEvent(MConst.EVENT_TEXT_COMBO.PLAY_FX_COMBO, 2, (isSuccess: boolean) => { this._canPlayFXNextCombo = !isSuccess; });
                break;
            default:
                this._canPlayFXNextCombo = false;
                break;
        }
    }
    //#endregion Event handlers
    //=================================================


}


