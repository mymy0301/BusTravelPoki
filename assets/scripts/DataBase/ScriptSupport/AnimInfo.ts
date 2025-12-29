import { _decorator, Component, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

export async function PlayAnimInfo(listNode: Node[], nLbTapToContinue: Node) {
    const timeDelayEachStep = 0;
    const timeAppear = 0.2;
    const timeScale = 0.3;
    for (let i = 0; i < listNode.length; i++) {
        const nodeChoice: Node = listNode[i];
        nodeChoice.scale = Vec3.ZERO;
        tween(nodeChoice)
            .to(timeScale, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
        tween(nodeChoice.getComponent(UIOpacity))
            .to(timeAppear, { opacity: 255 })
            .start();
        if (i != listNode.length - 1) {
            await Utils.delay(timeAppear * 1000);
            await Utils.delay(timeDelayEachStep * 1000);
        } else {
            tween(nLbTapToContinue.getComponent(UIOpacity))
                .to(timeAppear, { opacity: 255 })
                .start();
            await Utils.delay(timeAppear * 1000);
        }
    }
}


