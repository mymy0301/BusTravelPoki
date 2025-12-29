import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { ResourceUtils } from './ResourceUtils';
import { Utils } from './Utils';
import { ShareMyScorePopup } from './Share/ShareMyScorePopup';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('CanvasLoadingSys')
export class CanvasLoadingSys extends Component {
    private pathPrefabNotificationErrorAd = "/Prefabs/Others/NotificationAds";
    // @property(Prefab) private shareScorePopUp: Prefab;
    // @property(Prefab) private notificationErrorAd: Prefab;

    public static Instance: CanvasLoadingSys = null;
    private _shareMyScorePopup: ShareMyScorePopup = null;

    protected onLoad(): void {
        director.addPersistRootNode(this.node);
        if (CanvasLoadingSys.Instance == null) {
            CanvasLoadingSys.Instance = this;
        }
    }

    protected onDestroy(): void {
        CanvasLoadingSys.Instance = null;
    }

    protected async start() {
        // receive notification 
        // let notificationErrorAd = instantiate(await ResourceUtils.loadPrefab(this.pathPrefabNotificationErrorAd));
        // notificationErrorAd.setParent(this.node);
        // // init share score
        // let shareScorePopUp = instantiate(await ResourceUtils.loadPrefab(MConst.SHARE.PATH_ROOT));
        // shareScorePopUp.setParent(this.node);
        // this._shareMyScorePopup = shareScorePopUp.getComponent(ShareMyScorePopup);
    }

    public async GetSharePopUp(): Promise<ShareMyScorePopup> {
        if (this._shareMyScorePopup == null) {
            // load node share
            // init share score
            let prefabShare = await ResourceUtils.loadPrefab(MConst.SHARE.PATH_ROOT);
            let nShareScorePopUp = instantiate(prefabShare);
            nShareScorePopUp.setParent(this.node);
            await Utils.delay(0.1 * 1000);
            this._shareMyScorePopup = nShareScorePopUp.getComponent(ShareMyScorePopup);
        }
        return this._shareMyScorePopup;
    }
}


