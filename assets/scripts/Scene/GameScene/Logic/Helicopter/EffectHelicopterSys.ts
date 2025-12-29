import { _decorator, Component, instantiate, Node, Prefab, Size, Vec3 } from 'cc';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { HelicopterSys } from './HelicopterSys';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { MConst } from 'db://assets/scripts/Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('EffectHelicopterSys')
export class EffectHelicopterSys extends Component {
    public static Instance: EffectHelicopterSys = null;
    @property(Prefab) nPrefabHelicopter: Prefab;
    @property(Node) nPosStart: Node;
    private nHelicopter: Node = null;

    protected onLoad(): void {
        if (EffectHelicopterSys.Instance == null) {
            EffectHelicopterSys.Instance = this;
        }
    }

    protected onDisable(): void {
        EffectHelicopterSys.Instance = null;
    }

    public genHelicopter() {
        this.nHelicopter = instantiate(this.nPrefabHelicopter);
        this.nHelicopter.active = false;
        this.nHelicopter.setParent(this.node);
    }

    public StopHellicopter() {
        this.nHelicopter.getComponent(HelicopterSys).StopHelicopter();
    }

    public async MoveHelicopter(nCar: Node, infoPlaceCarVip: { wPos: Vec3, angle: number }, cbHelicopterStartMoveCar: CallableFunction, cbHelicopterPlaceCarDone: CallableFunction) {
        if (this.nHelicopter != null) {
            // register Callback
            this.nHelicopter.getComponent(HelicopterSys).registerCb(cbHelicopterStartMoveCar, cbHelicopterPlaceCarDone);

            const wPosStart: Vec3 = this.nPosStart.worldPosition.clone();
            // show block screen
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            await this.nHelicopter.getComponent(HelicopterSys).MoveCarToVipSlot(wPosStart, nCar, infoPlaceCarVip);
            // hide block screen
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);

            // i will not hide helicopter in here because i want passenger move up the car and the helicopter keep move out the map
            // this.nHelicopter.active = false;
        }
    }

    public MoveHelicopter_2(nCar: Node, infoPlaceCarVip: { wPos: Vec3, angle: number }, cbHelicopterStartMoveCar: CallableFunction, cbHelicopterPlaceCarDone: CallableFunction) {
        if (this.nHelicopter != null) {
            // register Callback
            this.nHelicopter.getComponent(HelicopterSys).registerCb(cbHelicopterStartMoveCar, cbHelicopterPlaceCarDone);

            const wPosStart: Vec3 = this.nPosStart.worldPosition.clone();
            // show block screen
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            this.nHelicopter.getComponent(HelicopterSys).MoveCarToVipSlot_2(wPosStart, nCar, infoPlaceCarVip, () => {
                // console.error("hide block heli");
                // hide block screen
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
            });
        }
    }
}


