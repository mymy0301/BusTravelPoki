import { _decorator, Component, director, Node, UIOpacity } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { MConstBuildGame } from '../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('UILoseTestGameSys')
export class UILoseTestGameSys extends Component {

    @property(Node) nBtnUnlockMoreParking: Node;
    @property(Node) nBtnTransUI: Node;
    private _canUnlockMoreParking: boolean = false;

    protected onLoad(): void {
        // register to hold transUI
        this.nBtnTransUI.on(Node.EventType.TOUCH_START, this.TransparentUI, this);
        this.nBtnTransUI.on(Node.EventType.TOUCH_END, this.OffTransparentUI, this);
        this.nBtnTransUI.on(Node.EventType.TOUCH_CANCEL, this.OffTransparentUI, this);
    }

    protected onDestroy(): void {
        if (this.nBtnTransUI.isValid) {
            this.nBtnTransUI.off(Node.EventType.TOUCH_START, this.TransparentUI, this);
            this.nBtnTransUI.off(Node.EventType.TOUCH_END, this.OffTransparentUI, this);
            this.nBtnTransUI.off(Node.EventType.TOUCH_CANCEL, this.OffTransparentUI, this);
        }
    }

    public ShowUI(canUnlockMoreParking: boolean) {
        // show all UI
        this.node.children.forEach(child => child.active = true);
        // check can show btn unlock parking
        this._canUnlockMoreParking = canUnlockMoreParking;
        if (canUnlockMoreParking) {
            this.nBtnUnlockMoreParking.active = true;
        }
    }

    private TransparentUI() {
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    private OffTransparentUI() {
        this.node.getComponent(UIOpacity).opacity = 255;
    }

    private ComebackLobby() {
        director.loadScene(MConstBuildGame.NAME_SCENE.BUILD_GAME);
    }

    private onBtnUnlockMoreParking() {
        if (this._canUnlockMoreParking) {
            // hide all UI
            this.node.children.forEach(child => child.active = false);

            //unlock parking
            clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
            clientEvent.dispatchEvent(MConst.EVENT_PARKING.UNLOCK_1_NORMAL_PARKING);

            //hide block in game
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
            // clientEvent.dispatchEvent(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD);
        }
    }
}


