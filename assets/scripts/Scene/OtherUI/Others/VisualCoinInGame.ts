import { _decorator, Component, instantiate, Label, Node, tween, Vec3, VERSION } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { CurrencySys } from '../../CurrencySys';
const { ccclass, property } = _decorator;

@ccclass('VisualCoinInGame')
export class VisualCoinInGame extends Component {
    @property(Label) lbCoin: Label;
    @property(Node) nStarClone: Node;
    @property(Node) UIAnim: Node;

    public async playAnimReceiveCoin(numCoinReceive: number, wPosCoinSpawn: Vec3) {
        // create spawn coin and move to the UI and update UI
        const numStarGen: number = numCoinReceive < 20 ? numCoinReceive : 20;
        const wPosMoveToReceive: Vec3 = this.nStarClone.worldPosition.clone();
        const timeDelayEachStar: number = 0.1;
        const radiusRound: number = 30;
        for (let i = 0; i < numStarGen; i++) {
            let tempStar = instantiate(this.nStarClone);
            tempStar.setParent(this.UIAnim);
            tempStar.scale = new Vec3(0.8, 0.8, 0.8);
            const wPosStarMoveTo: { x: number, y: number } = this.randomPointOnCircle(radiusRound, wPosCoinSpawn.clone());
            tempStar.worldPosition = new Vec3(wPosStarMoveTo.x, wPosStarMoveTo.y, 0);
            if (i == numStarGen - 1) {
                await new Promise<void>(resolve => {
                    tween(tempStar)
                        .to(0.1, { scale: new Vec3(1.05, 1.05, 1.05) })
                        .to(0.2, { worldPosition: new Vec3(wPosStarMoveTo.x, wPosStarMoveTo.y, 0) })
                        .to(0.15, { scale: Vec3.ONE })
                        .delay(0.2)
                        .to(0.5, { worldPosition: wPosMoveToReceive.clone() })
                        .call(() => {
                            this.increaseCoin();
                            tempStar.destroy();
                            resolve();
                        })
                        .start();
                })
            } else {
                tween(tempStar)
                    .to(0.1, { scale: new Vec3(1.05, 1.05, 1.05) })
                    .to(0.2, { worldPosition: new Vec3(wPosStarMoveTo.x, wPosStarMoveTo.y, 0) })
                    .to(0.15, { scale: Vec3.ONE })
                    .delay(0.2)
                    .to(0.5, { worldPosition: wPosMoveToReceive.clone() })
                    .call(() => {
                        this.increaseCoin();
                        tempStar.destroy();
                    })
                    .start();
                await Utils.delay(timeDelayEachStar * 1000);
            }
        }

        // update the lb to right data
        if (CurrencySys.Instance != null)
            this.lbCoin.string = CurrencySys.Instance.GetMoney().toString();
    }

    //#region func logic
    private increaseCoin() {
        this.lbCoin.string = (Number.parseInt(this.lbCoin.string) + 1).toString();
    }

    private randomPointOnCircle(radius: number, locRoot: Vec3): { x: number, y: number } {
        const angle = Math.random() * 2 * Math.PI;
        const x = radius * Math.cos(angle) + locRoot.x;
        const y = radius * Math.sin(angle) + locRoot.y;
        return { x, y };
    }
    //#endregion func logic
}


