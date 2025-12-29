import { _decorator, Component, instantiate, Node, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UINotificationCarCollingBuild')
export class UINotificationCarCollingBuild extends Component {
    public static Instance: UINotificationCarCollingBuild = null;
    @property(Node) private nTempNotification: Node;
    @property(Node) private nShow: Node;
    private mapNotification: Map<number, Node> = new Map();
    private _idNotification: number = 0; private get IDNotificationAutoGen(): number { return this._idNotification++; }

    protected onLoad(): void {
        if (UINotificationCarCollingBuild.Instance == null) {
            UINotificationCarCollingBuild.Instance = this;
            this.nTempNotification.active = false;
        }
    }

    protected onDestroy(): void {
        UINotificationCarCollingBuild.Instance = null;
    }

    //#region public func
    public ShowNotificationWithTime(wPos: Vec3) {
        let nNotification: Node = this.GetNotification();
        nNotification.setParent(this.nShow);
        nNotification.worldPosition = wPos;
        nNotification.active = true;

        tween(nNotification)
            .delay(2)
            .call(() => { this.ReUseNotification(nNotification); })
            .start();
    }

    public ShowNotification(wPos: Vec3): number {
        let nNotification: Node = this.GetNotification();
        nNotification.setParent(this.nShow);
        nNotification.worldPosition = wPos;
        nNotification.active = true;

        // set id notification
        let idNotification: number = this.IDNotificationAutoGen;
        this.mapNotification.set(idNotification, nNotification);
        return idNotification;
    }

    public HideNotification(idNotification: number) {
        let nNotification: Node = this.mapNotification.get(idNotification);
        if (nNotification != null) {
            this.ReUseNotification(nNotification);
            this.mapNotification.delete(idNotification);
        }
    }
    //#endregion public func

    private GetNotification(): Node {
        if (this.nTempNotification.children.length > 1) {
            return this.nTempNotification.children[0];
        } else {
            return instantiate(this.nTempNotification.children[0]);
        }
    }

    private ReUseNotification(nNotification: Node) {
        nNotification.active = false;
        nNotification.setParent(this.nTempNotification);
        Tween.stopAllByTarget(nNotification);
    }
}


