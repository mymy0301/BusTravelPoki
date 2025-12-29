import { _decorator, CCFloat, Component, Layout, Node, Prefab, tween, UIOpacity } from 'cc';
import { ObjectPool } from '../../../Utils/ObjPool';
import { MConfigs } from '../../../Configs/MConfigs';
import { ActionReceivePrizeClass } from './TypeUIReceivePrizeLobby';
import { SuperUIAnimCustom } from '../../OtherUI/SuperUIAnimCustom';
const { ccclass, property } = _decorator;

@ccclass('UIReceivePrizeLobbyBase')
export class UIReceivePrizeLobbyBase extends Component {
    @property(Prefab) prefabItemPrize: Prefab;
    @property(Node) nParentPoolItem: Node;
    @property(Node) parentLayout1: Node;
    @property(Node) parentLayout2: Node;
    @property(Node) parentLayout3: Node;
    @property(Node) nBlockUI: Node;
    @property(Node) nBgBlack: Node;
    @property(CCFloat) opacityShadowShow = 220;


    protected _superUIAnimCustom: SuperUIAnimCustom = null;
    protected _dataCustom: ActionReceivePrizeClass = null;
    protected _listPrizes: Node[] = [];
    private _cbDone: CallableFunction = null;

    public poolItemPrize: ObjectPool = null;

    protected onLoad(): void {
        this.poolItemPrize = new ObjectPool();
        this.poolItemPrize.InitObjectPool(this.nParentPoolItem, this.prefabItemPrize, new Node());
    }

    public SetUpBase(superUiAnimCustom: SuperUIAnimCustom) {
        this._superUIAnimCustom = superUiAnimCustom;
    }

    public SetDataToShow(dataCustom: ActionReceivePrizeClass) {
        this._dataCustom = dataCustom;
    }

    protected ShowShadowWithOpacity() {
        const self = this;
        this.nBgBlack.active = true;
        tween(this.nBgBlack.getComponent(UIOpacity))
            .to(MConfigs.timeRaiseShadow, { opacity: self.opacityShadowShow })
            .start();
    }

    protected HideShadowWithOpacity(timeCustom: number = MConfigs.timeRaiseShadow) {
        const timeRaiseShadow = timeCustom;
        tween(this.nBgBlack.getComponent(UIOpacity))
            .to(timeRaiseShadow, { opacity: 0 })
            .start();
    }

    private isRegisterBlack: boolean = false
    protected registerClickShadow(cb: CallableFunction) {
        if (!this.isRegisterBlack && !this.nBgBlack.hasEventListener(Node.EventType.TOUCH_END, cb, this)) {
            this.isRegisterBlack = true;
            this.nBgBlack.on(Node.EventType.TOUCH_END, cb, this);
        }
    }

    protected unRegisterClickShadow(cb: CallableFunction) {
        this.nBgBlack.off(Node.EventType.TOUCH_END, cb, this);
    }

    protected ChangeEnableLayoutItem(isEnable: boolean) {
        if (this.parentLayout1 != null) this.parentLayout1.getComponent(Layout).enabled = isEnable;
        if (this.parentLayout2 != null) this.parentLayout2.getComponent(Layout).enabled = isEnable;
        if (this.parentLayout3 != null) this.parentLayout3.getComponent(Layout).enabled = isEnable;
    }

    protected GetLayout(indexItem: number, maxItemEachLayer: number = 3) {
        let indexLayout = Math.floor(indexItem / maxItemEachLayer);
        switch (indexLayout) {
            case 0: return this.parentLayout1;
            case 1: return this.parentLayout2;
            case 2: return this.parentLayout3;
        }
    }

    //#region func need overload
    public async Play() { }
    //#endregino func need overload

}


