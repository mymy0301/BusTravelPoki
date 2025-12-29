import { _decorator, AnimationClip, AnimationComponent, CCFloat, Color, Component, instantiate, Label, Node, randomRange, randomRangeInt, RealCurve, Sprite, SpriteFrame, tween, UIOpacity, Vec2, Vec3 } from 'cc';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { Utils } from '../../../Utils/Utils';
import { Bezier } from '../../../framework/Bezier';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
import { AnimCoinSys } from '../../../AnimsPrefab/AnimCoinSys';
const { ccclass, property } = _decorator;

enum ANIM_CLIP_LABEL {
    IDLE = "3DCoin_Label_Idle",
    ANIM = "3DCoin_Label_AnimPopUp"
}

@ccclass('Coin3D')
export class Coin3D extends Component {
    @property(Node) nLbCoin: Node;
    @property(Node) nUITempCoin: Node;
    @property(Node) nTempCoin: Node;

    @property(CCFloat) timeWaitEachCoin: number = 0.5;
    @property(CCFloat) timeMoveEachCoin_base: number = 0.1;
    @property(CCFloat) timeIncreaseTimeByTime: number = 0.001;
    @property(CCFloat) numCoinHave: number = 7;
    @property(Vec3) scalePrepareApear: Vec3 = new Vec3(0.7, 0.7, 0.7);
    @property(Vec2) distanceRandomStart_coin: Vec2 = new Vec2(140, 50);
    @property(Vec2) distanceRandomMid_coin: Vec2 = new Vec2(30, 200);
    @property(RealCurve) curveTime: RealCurve = new RealCurve();

    private _listCoinUsing: Node[] = [];

    // #region ObjPool
    public GetNCoin(): Node {
        if (this.nUITempCoin.children.length > 0) {
            return this.nUITempCoin.children[0];
        } else {
            let nCoin = instantiate(this.nTempCoin);
            nCoin.parent = this.node;
            nCoin.setSiblingIndex(0);
            return nCoin;
        }
    }

    public ReUseCoin(nCoin: Node) {
        if (this.node == null || !this.node.isValid) return;
        if (this.nUITempCoin == null || !this.nUITempCoin.isValid) return;
        if (nCoin == null || !nCoin.isValid) return;
        nCoin.setParent(this.nUITempCoin);
    }
    // #endregion ObjPool

    public async AnimCoinApear(timeAnim: number, outlineLabel: string = null, numCoin: number, wPosStart: Vec3, wPosEnd: Vec3,
        cbReceiveFirstCoin: CallableFunction = null, cbReceiveEachCoin: CallableFunction = null, cbEnd: CallableFunction = null) {
        // ================================================================
        // prepare anim
        // ================================================================
        this.node.worldPosition = wPosStart;
        this.nLbCoin.getComponent(UIOpacity).opacity = 0;
        this.nLbCoin.getComponent(Label).string = `+${numCoin}`;
        this.nLbCoin.getComponent(AnimationComponent).play(ANIM_CLIP_LABEL.IDLE);
        if (outlineLabel != null) {
            this.nLbCoin.getComponent(Label).outlineColor = new Color().fromHEX(outlineLabel);
        }

        // init 
        const posEnd: Vec3 = Utils.ConvertWPosToPosOfANode(wPosStart.clone(), wPosEnd.clone());

        // phân bổ số tiền sao cho đều gần bằng nhau
        const numCoinDefaultSpawn = this.numCoinHave;
        const averageCoin = Math.floor(numCoin / numCoinDefaultSpawn);
        const remainder = numCoin - (averageCoin * numCoinDefaultSpawn);
        let distribution: number[] = new Array(numCoinDefaultSpawn).fill(averageCoin);
        for (let i = 0; i < remainder; i++) {
            distribution[i] += 1;
        }

        // gen pos Coin
        const listRandomPos: Vec3[][] = this.GenListRandomPos(numCoinDefaultSpawn, posEnd);

        for (let i = 0; i < numCoinDefaultSpawn; i++) {
            let nCoin = this.GetNCoin();
            nCoin.parent = this.node;
            nCoin.setSiblingIndex(0);
            nCoin.active = false;
            nCoin.getComponent(AnimCoinSys).SetOpaEffectToZero();
            nCoin.scale = this.scalePrepareApear.clone();
            nCoin.position = listRandomPos[i][0];
            nCoin.getComponent(AnimCoinSys).PlayAnimCoin();
            // add to list
            this._listCoinUsing.push(nCoin);
        }

        // ================================================================
        // anim
        // ================================================================
        this.nLbCoin.getComponent(AnimationComponent).play(ANIM_CLIP_LABEL.ANIM);

        let listPromise: Promise<any>[] = [];

        for (let i = 0; i < numCoinDefaultSpawn; i++) {
            const nCoin: Node = this._listCoinUsing[i];
            nCoin.active = true;
            const listPointMove: Vec3[] = listRandomPos[i];
            const listAngle: number[] = new Array(listPointMove.length).fill(0);
            // let listTime: number[] = new Array(listPointMove.length).fill(this.timeMoveEachCoin_base);
            // listTime = listTime.map((x, i) => this.timeMoveEachCoin_base - i * this.timeIncreaseTimeByTime);

            let listTime: number[] = new Array(listPointMove.length).fill(0).map((X, i) => this.curveTime.evaluate(i / (listPointMove.length - 1)) * this.timeIncreaseTimeByTime + this.timeMoveEachCoin_base);

            if (i == numCoinDefaultSpawn - 1) {
                listPromise.push(new Promise<void>(async resolve => {
                    await AniTweenSys.TweenToListVec3_6(nCoin, listPointMove, listAngle, listTime, () => { });

                    if (cbReceiveEachCoin != null) {
                        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);
                        cbReceiveEachCoin(distribution[i]);
                    }

                    resolve();
                }))

            } else {
                listPromise.push(new Promise<void>(async resolve => {
                    try {
                        await Utils.delay(this.timeWaitEachCoin * 1000 * i);

                        const timeShowItem = 0.2;

                        await new Promise<void>(resolve => {
                            tween(nCoin)
                                .call(() => { nCoin.getComponent(AnimCoinSys).ShowCoinWithOpacity(timeShowItem) })
                                .to(timeShowItem, { scale: Vec3.ONE })
                                .call(() => { resolve(); })
                                .start();
                        })
                        await AniTweenSys.TweenToListVec3_7(nCoin, listPointMove, listAngle, listTime, () => { });

                        // call cb receive coin first time
                        if (i == 0 && cbReceiveFirstCoin != null) {
                            cbReceiveFirstCoin();
                        }

                        if (cbReceiveEachCoin != null) {
                            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);
                            cbReceiveEachCoin(distribution[i]);
                        }

                        // reUse obj
                        this.ReUseCoin(nCoin);

                        resolve();
                    } catch (e) {
                        console.log("wrong when reuse coin");
                        resolve();
                    }
                }))
            }
        }

        await Promise.all(listPromise);
        // delay time cho anim 3D coin đảm bảo di chuyển xong hết
        await Utils.delay(1 * 1000);

        // ================================================================
        // done
        // ================================================================
        if (cbEnd != null) {
            cbEnd();
        }
    }

    private GenListRandomPos(numListPos: number, posEnd: Vec3): Vec3[][] {
        let result = [];

        for (let i = 0; i < numListPos; i++) {
            let listPos: Vec3[] = [];
            // random posStart
            const posStart: Vec3 = randomPosStartFromRec(this.distanceRandomStart_coin);
            // random posMid
            const posMid: Vec3 = GetPosMid(posStart, this.distanceRandomMid_coin, posEnd);

            listPos = Bezier.GetListPointsToTween3(10, posStart, posMid, posEnd.clone());
            result.push(listPos);
        }

        return result;
    }
}

function randomPosStartFromRec(rec: Vec2): Vec3 {
    let x: number = randomRange(-rec.x / 2, rec.x / 2);
    let y: number = randomRange(-rec.y / 2, rec.y / 2);
    return new Vec3(x, y);
}

function randomPosMidFromRec(startPos: Vec3, rec: Vec2, directionUD: "UP" | "DOWN", directionLR: "LEFT" | "RIGHT"): Vec3 {
    let x, y;
    x = randomRange(startPos.x + (directionLR == "LEFT" ? -(rec.x / 2) : 0), startPos.x + (directionLR == "LEFT" ? 0 : (rec.x / 2)));
    y = randomRange(startPos.y + (directionUD == "UP" ? -(rec.y / 2) : 0), startPos.y + (directionUD == "UP" ? 0 : (rec.y / 2)));
    return new Vec3(x, y);
}

function GetPosMid(startPos: Vec3, rec: Vec2, posEnd: Vec3): Vec3 {
    let y;
    if (posEnd.y > startPos.y) y = startPos.y - randomRange(0, rec.y);
    if (posEnd.y <= startPos.y) y = startPos.y + randomRange(0, rec.y);

    return new Vec3(startPos.x, y);
}


