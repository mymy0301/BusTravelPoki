import { _decorator, Component, Node, director, macro } from 'cc';
import { clientEvent } from './framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from './Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ClockGameSys')
export class ClockGameSys extends Component {
    public static Instance: ClockGameSys = null;

    private _mapCallback: Map<number, CallableFunction> = new Map();
    private autoIncreaseId = 0;

    protected onLoad(): void {
        if (ClockGameSys.Instance == null) {
            ClockGameSys.Instance = this;
            this.StartClock();
            director.addPersistRootNode(this.node);
            this.RegisterFocus();
        } else {
            this.node.destroy();
        }
    }

    /**
     * 
     * @param callableFunction 
     * @returns id call back
     */
    public registerCallBack(callableFunction: CallableFunction): number {
        this.autoIncreaseId += 1;
        this._mapCallback.set(this.autoIncreaseId, callableFunction);
        return this.autoIncreaseId;
    }

    public unregisterCallBack(idCallback: number): boolean {
        return this._mapCallback.delete(idCallback);
    }

    private StartClock() {
        this.schedule(this.IncreaseTime.bind(this), 1, macro.REPEAT_FOREVER, 0);
    }

    private IncreaseTime() {
        // call all register call back in here
        this._mapCallback.forEach((value, key) => {
            value();
        })
        clientEvent.dispatchEvent(EVENT_CLOCK_ON_TICK);
    }


    /*═══════════════════════════════════════════════════
    ║                  Focus in game                    ║
    ═══════════════════════════════════════════════════*/
    //#region Focus
    private _isFocusInGame: boolean = true;
    private RegisterFocus() {
        document.addEventListener('visibilitychange', this.ChangeVisiblity.bind(this));
    }

    private UnRegisterFocus() {
        document.addEventListener('visibilitychange', this.ChangeVisiblity.bind(this));
    }

    private ChangeVisiblity() {
        this._isFocusInGame = document.hidden;
        // console.log("visibilitychange: ", document.hidden);
    }
    //#endregion Focus
    //═══════════════════════════════════════════════════
}


