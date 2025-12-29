import { _decorator, Color, Component, ERaycast2DType, Node, PhysicsSystem2D, RaycastResult2D, Vec3 } from 'cc';
import { GROUP_COLLIDER, TAG_COLLIDER } from './Types';
import { MyDrawSys } from './MyDrawSys';
const { ccclass, property } = _decorator;

@ccclass('CustomRayCastCheck')
export class CustomRayCastCheck {
    public static CheckCarBlock(wPosStart: Vec3, wPosEnd: Vec3): Node {
        let result: Node = null;

        // get the right distance
        const rcResult: readonly Readonly<RaycastResult2D>[] = PhysicsSystem2D.instance.raycast(wPosStart, wPosEnd, ERaycast2DType.All);
        // MyDrawSys.Instance.ClearDrawWithTime();
        MyDrawSys.Instance.DrawLine(wPosStart, [wPosEnd], Color.RED);

        for (const rc of rcResult) {
            if (rc.collider.group == GROUP_COLLIDER.DEFAULT && rc.collider.tag == TAG_COLLIDER.DEFAULT) {
                result = rc.collider.node;
                break;
            }
        }

        return result;
    }

    public static CheckAllCarBlock2(wPosStart: Vec3, wPosEnd: Vec3): Node[] {
        let listNode: Node[] = [];
        const rcResult: readonly Readonly<RaycastResult2D>[] = PhysicsSystem2D.instance.raycast(wPosStart, wPosEnd, ERaycast2DType.All);
        // MyDrawSys.Instance.ClearDrawWithTime();
        // MyDrawSys.Instance.DrawLine(wPosStart, [wPosEnd], Color.RED);

        // let listRc = [];
        for (const rc of rcResult) {
            // listRc.push({ "name": rc.collider.node.name, "group": rc.collider.group, "tag": rc.collider.tag });
            if (rc.collider.group == GROUP_COLLIDER.DEFAULT && (rc.collider.tag == TAG_COLLIDER.DEFAULT || rc.collider.tag == TAG_COLLIDER.GARAGE)) {
                listNode.push(rc.collider.node);
            }
        }

        // console.log("list rc", listRc);
        // console.log("list node block", Array.from(listNode));

        return listNode;
    }

    public static CheckAllCarsBlock(wPosStart: Vec3, wPosEnd: Vec3): Node[] {
        const listNode: Node[] = [];
        const rcResult: readonly Readonly<RaycastResult2D>[] = PhysicsSystem2D.instance.raycast(wPosStart, wPosEnd, ERaycast2DType.All);
        // MyDrawSys.Instance.ClearDrawWithTime();
        // MyDrawSys.Instance.DrawLine(wPosStart, [wPosEnd], Color.RED);

        for (const rc of rcResult) {
            if (rc.collider.group == GROUP_COLLIDER.CAR) {
                listNode.push(rc.collider.node);
            }
        }

        return listNode;
    }
    public static CheckAllCarBlockInBuild(wPosStart: Vec3, wPosEnd: Vec3): Node[] {
        // get the right distance
        const rcResult: readonly Readonly<RaycastResult2D>[] = PhysicsSystem2D.instance.raycast(wPosStart, wPosEnd, ERaycast2DType.All);
        // MyDrawSys.Instance.ClearDrawWithTime();
        MyDrawSys.Instance.DrawLine(wPosStart, [wPosEnd], Color.RED);

        let result: Node[] = [];
        for (const rc of rcResult) {
            if (rc.collider.group == GROUP_COLLIDER.CAR) {
                result.push(rc.collider.node);
            }
        }

        return result;
    }
}


