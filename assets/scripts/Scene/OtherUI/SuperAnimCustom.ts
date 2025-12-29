import { _decorator, Component, Node, randomRangeInt, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { Utils } from '../../Utils/Utils';
import { AniTweenSys } from '../../Utils/AniTweenSys';
import { Bezier } from '../../framework/Bezier';
const { ccclass, property } = _decorator;

export async function Anim_di_chuyen_vong_cung(
    numberKey: number,
    spriteFrameItem: SpriteFrame,
    parentItem: Node,
    wPosSpawnKey: Vec3 = Utils.getMiddleWPosWindow(),
    wPosMoveEnd: Vec3 = Vec3.ZERO,
    distanceRandom: Vec2 = new Vec2(-30, 30),
    cbReceiveEachItem: CallableFunction,
    cbReUseItem: CallableFunction = null,
    cbGetNode: CallableFunction = null,
) {
    if (numberKey == 0) return;

    let listWPosEndPhase2: Vec3[] = [];
    let listWPosEndPhase1: Vec3[] = [];
    const highPhase2 = 20;
    // spawn loc for key move prepare
    for (let i = 0; i < numberKey; i++) {
        let nRandomLocX = randomRangeInt(-distanceRandom.x, distanceRandom.x);
        let nRandomLocY = randomRangeInt(-distanceRandom.y, distanceRandom.y);
        listWPosEndPhase2.push(wPosSpawnKey.clone().add3f(nRandomLocX, nRandomLocY, 0));
    }
    for (let i = 0; i < numberKey; i++) {
        let locX = listWPosEndPhase2[i].x / 2;
        listWPosEndPhase1.push(wPosSpawnKey.clone().add3f(locX, highPhase2, 0));
    }

    // generate Key to the node temp gen play anim move to this node
    for (let i = 0; i < numberKey; i++) {
        let nKey = null;

        // kiểm tra xem Get node có null hay không
        if (cbGetNode != null) {
            nKey = cbGetNode();
            nKey.getComponent(Sprite).spriteFrame = spriteFrameItem;
        }
        // còn nếu null thì ta khởi tạo
        else {
            nKey = new Node();
            nKey.addComponent(UITransform);
            nKey.addComponent(Sprite);
            nKey.setParent(parentItem);
        }

        // === set up key ===
        nKey.getComponent(Sprite).spriteFrame = spriteFrameItem;
        nKey.scale = Vec3.ZERO;
        nKey.worldPosition = listWPosEndPhase2[i].clone();

        // === tính toán cho vc di chuyển ===
        const WPosS = listWPosEndPhase2[i].clone();
        const WPosE = wPosMoveEnd;
        const WMidPos = new Vec3(wPosMoveEnd.x, WPosS.y);
        let listWPos = Bezier.GetListPointsToTween3(10, WPosS, WMidPos, WPosE);
        if (i != numberKey - 1) {
            (async () => {
                await AniTweenSys.Scale(nKey, Vec3.ONE, 0.3);
                await Utils.delay(0.2 * 1000);
                await AniTweenSys.TweenToListVec3_2(nKey, listWPos);
                if (cbReUseItem != null) {
                    cbReUseItem(nKey);
                } else {
                    nKey.destroy();
                }
                cbReceiveEachItem(i);
            })();
            await Utils.delay(0.05 * 1000);
        } else {
            await AniTweenSys.Scale(nKey, Vec3.ONE, 0.3);
            await Utils.delay(0.2 * 1000);
            await AniTweenSys.TweenToListVec3_2(nKey, listWPos);
            if (cbReUseItem != null) {
                cbReUseItem(nKey);
            } else {
                nKey.destroy();
            }
            cbReceiveEachItem(i);
        }
    }
}


/**
 * 
 * @param wPosStart 
 * @param wPosMoveEnd 
 * @param cbGetNode 
 * @param cbReUseItem == null ? destroy : cbReUseItem
 */
export async function Anim_di_chuyen_vong_cung_khong_SpawnItem(
    wPosStart: Vec3 = Vec3.ZERO,
    wPosMoveEnd: Vec3 = Vec3.ZERO,
    cbGetNode: CallableFunction,
    cbReUseItem: CallableFunction = null,
) {
    let nKey = null;

    // kiểm tra xem Get node có null hay không
    nKey = cbGetNode();

    nKey.scale = Vec3.ZERO;
    nKey.worldPosition = wPosStart.clone();

    // === tính toán cho vc di chuyển ===
    const WPosS = wPosStart.clone();
    const WPosE = wPosMoveEnd;
    const WMidPos = new Vec3(wPosMoveEnd.x, WPosS.y);
    let listWPos = Bezier.GetListPointsToTween3(10, WPosS, WMidPos, WPosE);

    await AniTweenSys.TweenToListVec3_2(nKey, listWPos);
    if (cbReUseItem != null) {
        cbReUseItem(nKey);
    } else {
        nKey.destroy();
    }
}


