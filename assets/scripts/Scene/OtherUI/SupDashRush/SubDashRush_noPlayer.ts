import { _decorator, Component, Node, tween, UIOpacity } from 'cc';
import { AnimFxStarLight } from '../../../AnimsPrefab/fx_star_light/AnimFxStarLight';
const { ccclass, property } = _decorator;

@ccclass('SubDashRush_noPlayer')
export class SubDashRush_noPlayer extends Component {
    // @property(AnimFxStarLight) animFxStarLight: AnimFxStarLight;
    private readonly timeHideUI: number = 0.5;

    private _cbShowUIDetail: CallableFunction;
    private _cbShowBlock: CallableFunction;
    private _cbHideBlock: CallableFunction;
    private _cbJoinDashRush: CallableFunction;

    protected onEnable(): void {
        // this.animFxStarLight.PlayAnimLightWithStarWithOpacity();
    }

    //======================
    //#region Init
    public InitCb(cbShowUiDetail: CallableFunction, cbShowBlock: CallableFunction, cbHideBlock: CallableFunction, cbJoinDashRush: CallableFunction) {
        this._cbJoinDashRush = cbJoinDashRush;
        this._cbShowUIDetail = cbShowUiDetail;
        this._cbShowBlock = cbShowBlock;
        this._cbHideBlock = cbHideBlock;
    }

    public ShowUI(useTween: boolean = true) {
        const opaCom = this.node.getComponent(UIOpacity);
        this.node.active = true;
        if (useTween) {
            tween(opaCom)
                .to(this.timeHideUI, { opacity: 255 })
                .start();
        } else {
            opaCom.opacity = 255;
        }
    }

    public HideUI(useTween: boolean = true) {
        const opaCom = this.node.getComponent(UIOpacity);
        if (useTween) {
            tween(opaCom)
                .to(this.timeHideUI, { opacity: 0 })
                .call(() => { this.node.active = false; })
                .start();
        } else {
            opaCom.opacity = 0;
            this.node.active = false;
        }
    }
    //#endregion Init
    //======================

    //======================
    //#region btn
    private Play() {
        this._cbShowBlock();
        this.HideUI();
        this._cbJoinDashRush();
        this._cbShowUIDetail();
    }
    //#endregion btn
    //======================

}


