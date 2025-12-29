import { _decorator, Component, instantiate, Layout, Node, Pool, Prefab, Tween, tween, UIOpacity, Vec3, TweenEasing, easing } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { ItemCoolDownTimeCar } from './ItemCoolDownTimeCar';
import { JsonCar } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Wed Jul 09 2025 17:05:07 GMT+0700 (Indochina Time)
 * UICooldownTimeCar
 * db://assets/scripts/Scene/GameScene/OtherUI/UICooldownTimeCar/UICooldownTimeCar.ts
 *
 */

@ccclass('UICooldownTimeCar')
export class UICooldownTimeCar extends Component {
    @property(Layout) layout: Layout;
    @property(Prefab) pfNNotiCarCoolDown: Prefab;
    @property(Node) nTemp: Node;
    @property(Node) nAnim: Node;
    @property(Node) nShadow: Node;


    private _poolNoti: Pool<Node> = null;
    private _listNodeNoti: Node[] = [];
    //==========================================
    //#region base
    protected start(): void {
        this.TryInitPool();
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_CAR.CAR_START_COOLDOWN, this.AddNoti, this);
        clientEvent.on(MConst.EVENT_CAR.CAR_END_COOLDOWN, this.RemoveCarEndCoolDown, this);
        clientEvent.on(MConst.EVENT_CAR.CAR_PAUSE_COOLDOWN, this.PauseAllNoti, this);
        clientEvent.on(MConst.EVENT_CAR.CAR_RESUME_COOLDOWN, this.ResumeAllNoti, this);
        this.nShadow.active = false;
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_CAR.CAR_START_COOLDOWN, this.AddNoti, this);
        clientEvent.off(MConst.EVENT_CAR.CAR_END_COOLDOWN, this.RemoveCarEndCoolDown, this);
        clientEvent.off(MConst.EVENT_CAR.CAR_PAUSE_COOLDOWN, this.PauseAllNoti, this);
        clientEvent.off(MConst.EVENT_CAR.CAR_RESUME_COOLDOWN, this.ResumeAllNoti, this);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private UpdateLayout() {
        this.layout.updateLayout();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region listener
    private AddNoti(idCar: number, infoCar: JsonCar) {
        // console.log("add noti", infoCar);
        const valid1 = infoCar.timeCarCoolDown != null && infoCar.timeCarCoolDown > 0;
        const valid2 = this._listNodeNoti.findIndex(element => element.getComponent(ItemCoolDownTimeCar).IDCar == idCar) < 0;
        if (valid1 && valid2) {
            const newNoti: Node = this._poolNoti.alloc();
            newNoti.scale = Vec3.ONE;
            newNoti.position = Vec3.ZERO;
            const itemCom = newNoti.getComponent(ItemCoolDownTimeCar);
            itemCom.SetUpCb(this.UpdateLayout.bind(this));
            itemCom.SetUpData(idCar, infoCar);
            itemCom.RegisterCB(this.AnimWhenEnd.bind(this));
            newNoti.setParent(this.layout.node);
            newNoti.active = true;
            itemCom.ChangeStateAnimShow();
            this._listNodeNoti.push(newNoti);
        }
    }

    private async RemoveCarEndCoolDown(idCar: number) {
        const indexNNoti = this._listNodeNoti.findIndex(item => item.getComponent(ItemCoolDownTimeCar).IDCar == idCar);
        if (indexNNoti < 0) { return; }
        const nNoti = this._listNodeNoti[indexNNoti];
        const itemCom = nNoti.getComponent(ItemCoolDownTimeCar);
        itemCom.UnRegisterTime();
        await itemCom.ChangeStateAnimHide();
        nNoti.active = false;
        this._listNodeNoti.splice(indexNNoti, 1);
        this._poolNoti.free(nNoti);
        nNoti.setParent(this.nTemp);
    }

    private ResumeAllNoti() {
        this._listNodeNoti.forEach(item => {
            item.getComponent(ItemCoolDownTimeCar).RegisterTime();
        })
    }

    private PauseAllNoti() {
        this._listNodeNoti.forEach(item => {
            item.getComponent(ItemCoolDownTimeCar).UnRegisterTime();
        })
    }
    //#endregion listener
    //==========================================

    //==========================================
    //#region pool
    private TryInitPool() {
        this._poolNoti = new Pool(() => instantiate(this.pfNNotiCarCoolDown), 0);
    }

    public ReUseAllNoti() {
        if (this._poolNoti == null) { return; }
        this._listNodeNoti.forEach(item => {
            item.getComponent(ItemCoolDownTimeCar).UnRegisterTime();
            item.getComponent(ItemCoolDownTimeCar).ChangeStateAnimPrepare();
            item.active = false;
        })
        this._poolNoti.freeArray(this._listNodeNoti);
        this._listNodeNoti = [];
    }
    //#endregion pool
    //==========================================

    //==========================================
    //#region anim when end
    private _cbSkip: CallableFunction = null;
    private _tweenAnimEnd: Tween<any> = null;
    private async AnimWhenEnd(nNoti: Node, cbDone: CallableFunction) {
        //anim in here
        const wPosMidScene = Utils.getMiddleWPosWindow();
        nNoti.setParent(this.nAnim);
        const opaShadow = this.nShadow.getComponent(UIOpacity);
        const wPosNow = this.node.worldPosition;
        this.nShadow.active = true;

        this._tweenAnimEnd = tween(nNoti)
            .parallel(
                tween().delay(0.2).call(() => { this._cbSkip = cbDone }),
                tween().to(0.5, { scale: Vec3.ONE.clone().multiplyScalar(2) }, {
                    onUpdate(target, ratio) {
                        opaShadow.opacity = ratio * 255;
                        const easedRatioX = easing.linear(ratio);
                        const easedRatioY = easing.cubicOut(ratio);
                        const rightWPosX = wPosNow.x + (wPosMidScene.x - wPosNow.x) * easedRatioX;
                        const rightWPosY = wPosNow.y + (wPosMidScene.y - wPosNow.y) * easedRatioY;
                        nNoti.worldPosition = new Vec3(rightWPosX, rightWPosY, 0);
                    },
                })
            )
            .call(() => {
                this._cbSkip = null;
                this._tweenAnimEnd = null;
                this.HideShadow();
                cbDone && cbDone();
            })
            .start();
    }

    private OnBtnSkip() {
        if (this._cbSkip == null) { return; }

        if (this._tweenAnimEnd != null) { this._tweenAnimEnd.stop(); this._tweenAnimEnd = null; }
        this._cbSkip();
    }

    private HideShadow() {
        tween(this.nShadow.getComponent(UIOpacity))
            .to(0.3, { opacity: 0 })
            .call(() => { this.nShadow.active = false; })
            .start();
    }
    //#endregion anim when end
    //==========================================
}