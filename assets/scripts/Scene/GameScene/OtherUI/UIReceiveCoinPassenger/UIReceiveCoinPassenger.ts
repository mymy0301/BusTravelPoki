import { _decorator, CCFloat, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { AnimCoinSys } from 'db://assets/scripts/AnimsPrefab/AnimCoinSys';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIReceiveCoinPassenger')
export class UIReceiveCoinPassenger extends Component {
    @property(Node) nTempSaveCoin: Node;
    @property(Vec3) scaleCoin: Vec3 = new Vec3(0.3, 0.3, 0.3);
    @property(CCFloat) delayEachCoin: number = 0.1;
    @property(Prefab) pfAnimCoin: Prefab;
    private readonly distanceStartCoin: number = 10;
    private readonly distanceEndCoinForStartCoin: number = 90;
    private readonly timeMoveUp_1: number = 0.1;
    private readonly timeMoveUp_2: number = 0.75;
    private readonly time_flip: number = 1;
    private readonly time_opa: number = 0.5;
    private readonly numFlip: number = 10;
    private _listCoinUsing: Node[] = [];

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.RECEIVE_COIN_WHEN_PASS_MOVE_TO_CAR, this.ShowCoinAtWPos, this);
        clientEvent.on(MConst.EVENT.RECEIVE_LIST_COIN_AT_LIST_WPOS, this.ShowListCoinAtListWPos, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.RECEIVE_COIN_WHEN_PASS_MOVE_TO_CAR, this.ShowCoinAtWPos, this);
        clientEvent.off(MConst.EVENT.RECEIVE_LIST_COIN_AT_LIST_WPOS, this.ShowListCoinAtListWPos, this);
    }

    public ShowCoinAtWPos(wPos: Vec3) {
        let nCoin = this.GetNCoin();
        // stop tween
        Tween.stopAllByTarget(nCoin);

        // prepare tween
        const wPosStart: Vec3 = wPos.clone().add3f(0, this.distanceStartCoin, 0);
        const opaCoin = nCoin.getComponent(UIOpacity);
        nCoin.setParent(this.node);
        nCoin.active = true;
        nCoin.getComponent(AnimCoinSys).PlayAnimCoin();
        opaCoin.opacity = 0;

        nCoin.eulerAngles = Vec3.ZERO;
        nCoin.scale = this.scaleCoin;
        nCoin.setWorldPosition(wPosStart);

        let listTween = [];
        const step: number = this.numFlip;
        for (let i = 0; i < step; i++) {
            let tweenAdd = null;
            tweenAdd = tween(nCoin)
                .to(this.timeMoveUp_2 / step, { worldPosition: wPosStart.clone().add3f(0, this.distanceEndCoinForStartCoin / step * (i + 1), 0) }, {})
            listTween.push(tweenAdd);
        }

        // tween rotate and move up
        tween(nCoin)
            //play sound coin receive
            .call(() => {
                // play sound coin
                // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.COIN_WHEN_PASS_MOVE_ON_CAR);
            })
            // move up to the wPosStart
            .to(this.timeMoveUp_1, { worldPosition: wPosStart }, {
                onUpdate(target, ratio) {
                    opaCoin.opacity = 255 * ratio;
                },
            })
            // rotate and move to wPosEnd
            .parallel(
                tween(nCoin).sequence(...listTween),
                tween(nCoin)
                    .delay(this.timeMoveUp_2 + this.timeMoveUp_1 - this.time_opa)
                    .to(this.time_opa, {}, {
                        onUpdate(target, ratio) {
                            opaCoin.opacity = (1 - ratio) * 255;
                        }
                    })
            )
            .call(() => {
                this.ReUseCoin(nCoin);
            })
            .start();
    }

    public async ShowListCoinAtListWPos(listWPos: Vec3[]) {
        for (let i = 0; i < listWPos.length; i++) {
            this.ShowCoinAtWPos(listWPos[i]);
            await Utils.delay(this.delayEachCoin * 1000);
        }
    }

    /**
     * this func will be call when reset in logicInGameSys
     */
    public ResetUICoin() {
        this._listCoinUsing.forEach(item => {
            this.ReUseCoin(item);
        })

        this._listCoinUsing = [];
    }

    //#region ObjPool
    public GetNCoin(): Node {
        let result: Node = null;

        if (this.nTempSaveCoin.children.length > 0) {
            result = this.nTempSaveCoin.children[0];
        } else {
            let nCoin = instantiate(this.pfAnimCoin);
            result = nCoin;
        }

        this._listCoinUsing.push(result);
        return result;
    }

    public ReUseCoin(nCoin: Node) {
        if (!this.isValid) { return; }
        this._listCoinUsing.splice(this._listCoinUsing.indexOf(nCoin), 1);

        Tween.stopAllByTarget(nCoin);
        nCoin.active = false;
        nCoin.setParent(this.nTempSaveCoin);
    }
    //#endregion ObjPool
}


