import { _decorator, CCBoolean, Component, EventTouch, Input, input, instantiate, Node, Prefab } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { SoundSys } from '../../Common/SoundSys';
import { GameSoundEffect, STATE_GAME } from '../../Utils/Types';
import { GameSys } from './GameSys';
const { ccclass, property } = _decorator;

@ccclass('ClickEffect')
export class ClickEffect extends Component {
    @property(CCBoolean) isGame: boolean = false;
    @property(CCBoolean) isLobby: boolean = false;
    private _isPauseGame: boolean = false;

    protected onEnable(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchInputStart, this, true);
    }

    protected onDisable(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchInputStart, this, true);
    }

    private onPauseGame() {
        this._isPauseGame = true;
    }

    private onResumeGame() {
        this._isPauseGame = false;
    }

    private onTouchInputStart(touch: EventTouch) {
        if (this.isGame) {
            const stateGameNow = GameSys.Instance.GetStateGame();
            // console.log("stateGameNow", stateGameNow);
            
            if (stateGameNow == STATE_GAME.PLAYING || stateGameNow == STATE_GAME.PREPARE) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_EFFECT_AT_POINT, touch.getUILocation());
        } else {
            if (this.isLobby) {
                // console.log("!111111111111111");
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_EFFECT_AT_POINT, touch.getUILocation());
            }
        }
    }
}
