import { _decorator, CCBoolean, Component, instantiate, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../Common/ChangeSceneSys';
import { GameUISys } from './GameScene/GameUISys';
import { ItemEffectTouchGameSys } from './ItemEffectTouchGameSys';
import { UILobbySys } from './LobbyScene/UILobbySys';
const { ccclass, property } = _decorator;

@ccclass('EffectTouchGameSys')
export class EffectTouchGameSys extends Component {
    @property(CCBoolean) isGame = false;
    @property(CCBoolean) isLobby = false;
    @property(Node) nTemp: Node;
    @property(Prefab) pfEffectTouch: Prefab;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.SHOW_EFFECT_AT_POINT, this.ShowEffectAtPoint, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.SHOW_EFFECT_AT_POINT, this.ShowEffectAtPoint, this);
    }

    private async ShowEffectAtPoint(pos: Vec2) {
        let nEf = null;
        const wPos = new Vec3(pos.x, pos.y, 0);

        try {
            switch (true) {
                case this.isGame:
                    // check scene then call that is there any ui show or not
                    if (GameUISys.Instance.CheckHasAnyUIShow()) { return; }

                    nEf = this.InitEffectTouch();
                    nEf.setParent(this.node);

                    await nEf.getComponent(ItemEffectTouchGameSys).PlayTouch(wPos);
                    if (this == null || this.node == null || !this.node.isValid) { return; }
                    this.ReUseEffectTouch(nEf);
                    break;
                case this.isLobby:
                    // check scene then call that is there any ui show or not
                    if (UILobbySys.Instance.CheckHasAnyUIShow()) {
                        return;
                    }

                    nEf = this.InitEffectTouch();
                    nEf.setParent(this.node);

                    await nEf.getComponent(ItemEffectTouchGameSys).PlayTouch(wPos);
                    if (this == null || this.node == null || !this.node.isValid) { return; }
                    this.ReUseEffectTouch(nEf);
                    break;
            }
        } catch (e) {
            // console.log("error in try catch ", e);
        }
    }

    //#region self func
    private InitEffectTouch(): Node {
        if (this.nTemp.children.length > 0) {
            return this.nTemp.children[0];
        } else {
            let nEf = instantiate(this.pfEffectTouch);
            return nEf;
        }
    }

    private ReUseEffectTouch(nReUse: Node) {
        if (this != null && this.nTemp != null && this.nTemp.isValid) {
            nReUse.active = false;
            nReUse.setParent(this.nTemp);
        }
    }
    //#endregion self func
}


