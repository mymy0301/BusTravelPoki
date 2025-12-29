/**
 * 
 * dinhquangvinhdev
 * Wed Sep 03 2025 08:35:42 GMT+0700 (Indochina Time)
 * ListProgressSupSkyLift
 * db://assets/scripts/Scene/OtherUI/SupSkyLift/ListProgressSupSkyLift.ts
*
*/
import { _decorator, Component, instantiate, Layout, Node, Pool, Prefab, ScrollView, SpriteFrame, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { CONFIG_SL, InfoFloorSkyLiftJSON } from '../UISkyLift/TypeSkyLift';
import { PoolGameSys } from '../../LobbyScene/PoolGameSys';
import { ProgressSupSkyLift } from './ProgressSupSkyLift';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
const { ccclass, property } = _decorator;

@ccclass('ListProgressSupSkyLift')
export class ListProgressSupSkyLift extends Component {
    @property(Prefab) pfProgressLoop: Prefab;
    @property(Prefab) pfProgressEnd: Prefab;
    @property(Layout) layoutContain: Layout;
    @property(ScrollView) sv: ScrollView;
    @property(Node) nView: Node;
    @property(Prefab) pfPrize: Prefab;
    @property(SpriteFrame) sfBgLevelReach: SpriteFrame;
    @property(SpriteFrame) sfBgLevelNoReach: SpriteFrame;
    @property(SpriteFrame) listSfPrizeBlue: SpriteFrame[] = [];
    @property(SpriteFrame) listSfPrizeRed: SpriteFrame[] = [];
    @property(SpriteFrame) listSfPrizePurple: SpriteFrame[] = [];
    private _dataProgress: InfoFloorSkyLiftJSON[] = [];
    private _listNProgress: Node[] = [];
    private _progressNow: number = 0;

    //==========================================
    //#region base
    protected onDisable(): void {
        this.UnRegisterScroll();
    }

    public SetUp(data: InfoFloorSkyLiftJSON[]) {
        this._dataProgress = data;

        if (this._listNProgress.length > 0) { return; }

        if (PoolGameSys.Instance == null) { return; }

        this.TryRegisterPrize();

        for (let i = 1; i < data.length; i++) {
            const nProgress: Node = this.InitNProgress('loop');
            nProgress.parent = this.layoutContain.node;
            const dataProgress: InfoFloorSkyLiftJSON = this._dataProgress[i];
            const level: number = this._dataProgress[i - 1].progress;
            nProgress.getComponent(ProgressSupSkyLift).SetUp(dataProgress, level, this.GetListSfPrize.bind(this));
            nProgress.getComponent(ProgressSupSkyLift).animPrize.RegisterCb(this.InitPrize.bind(this), this.ReUsePrize.bind(this));
            this._listNProgress.push(nProgress);
        }

        // init last
        const nProgress: Node = this.InitNProgress('end');
        nProgress.parent = this.layoutContain.node;
        nProgress.getComponent(ProgressSupSkyLift).SetUp(null, CONFIG_SL.MAX_PROGRESS, null);
        this._listNProgress.push(nProgress);

        this.layoutContain.updateLayout(true);
    }

    public SetUpProgress(progressPlayer: number) {
        this._progressNow = progressPlayer;

        for (let i = 0; i < this._listNProgress.length; i++) {
            const nProgressPlayer: Node = this._listNProgress[i];
            nProgressPlayer.getComponent(ProgressSupSkyLift).SetUpProgress(progressPlayer, this.sfBgLevelReach, this.sfBgLevelNoReach);
        }

        this.RegisterScroll();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private InitNProgress(type: 'loop' | 'end') {
        switch (type) {
            case 'loop': return instantiate(this.pfProgressLoop);
            case 'end': return instantiate(this.pfProgressEnd);
        }
    }

    private GetIndexNProgress(score: number): number {
        if (score >= CONFIG_SL.MAX_PROGRESS) { return this._listNProgress.length - 1; }

        let indexProgressIncrease: number = -1;

        for (let i = 0; i < this._listNProgress.length; i++) {
            const nProgress = this._listNProgress[i];
            const infoCheck = nProgress.getComponent(ProgressSupSkyLift).InfoFloorSkyLift;
            if (infoCheck.progress < score) {
                indexProgressIncrease = i;
            }

            if (infoCheck.progress == score) {
                indexProgressIncrease = i;
                break;
            }

            if (infoCheck.progress > score) {
                break;
            }
        }

        indexProgressIncrease += 1;

        return indexProgressIncrease;
    }

    private GetOffSetScrollByIndexFloor(indexFloor: number): Vec2 {
        try {
            let x = -this.layoutContain.paddingLeft;
            let i = 1;
            while (i <= indexFloor) {
                const widthItem = this._listNProgress[i - 1].getComponent(UITransform).width;
                x -= i == indexFloor ? widthItem / 2 : widthItem;
                i++;
            }

            if (x > this.sv.getMaxScrollOffset().x) { x = this.sv.getMaxScrollOffset().x; }
            // if (x < 0) { x = 0; }

            const y = -14.75800000000001;
            return new Vec2(x, y);
        } catch (e) {
            console.error(e);
            return Vec2.ZERO;
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region prize
    private TryRegisterPrize() {
        if (!PoolGameSys.Instance.IsRegisterPool(CONFIG_SL.KEY_POOL_PRIZE)) {
            const newPoolSL = new Pool<Node>(() => instantiate(this.pfPrize), 0);
            PoolGameSys.Instance.RegisterPool(CONFIG_SL.KEY_POOL_PRIZE, newPoolSL);
        }
    }

    private InitPrize(): Node {
        return PoolGameSys.Instance.GetItemFromPool(CONFIG_SL.KEY_POOL_PRIZE);
    }
    private ReUsePrize(listPrize: Node[]) {
        PoolGameSys.Instance.PoolListItems(listPrize, CONFIG_SL.KEY_POOL_PRIZE);
    }

    private GetListSfPrize(type: 'Red' | 'Blue' | 'Purple') {
        switch (type) {
            case 'Red': return this.listSfPrizeRed;
            case 'Blue': return this.listSfPrizeBlue;
            case 'Purple': return this.listSfPrizePurple;
        }
    }
    //#endregion prize
    //==========================================

    //==========================================
    //#region public
    public ScrollToProgress(progress: number, force: boolean, timeScroll: number = 1) {
        // ở đây chúng ta sẽ tìm index floor tương ứng
        const indexFloorProgress: number = this.GetIndexNProgress(progress);

        const offSetProgress = this.GetOffSetScrollByIndexFloor(indexFloorProgress);
        if (force) {
            let x = offSetProgress.x - this.nView.getComponent(UITransform).width / 2;
            if (x < -1910) { x = -1900; }  //NOT GOOD
            this.layoutContain.node.position = new Vec3(x, this.layoutContain.node.position.y, 0);
            // this.sv.scrollToOffset(offSetProgress, timeScroll, true);
        } else {
            this.sv.scrollToOffset(offSetProgress, timeScroll);
        }
    }

    public GetPosCar(progress: number): Vec3 {
        const indexFloorProgress: number = this.GetIndexNProgress(progress);
        const nProgress: Node = this._listNProgress[indexFloorProgress];
        const result = nProgress.getComponent(ProgressSupSkyLift).GetPosCar(progress);
        return result;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region anim
    public async AnimProgress(newProgress: number) {
        switch (true) {
            case newProgress > this._progressNow:
                await this.IncreaseProgress(newProgress);
                break;
        }
    }

    private async IncreaseProgress(newProgress: number) {
        let indexProgressIncrease: number = -1;
        let indexProgressReach: number = -1;

        for (let i = 0; i < this._listNProgress.length; i++) {
            const nProgress = this._listNProgress[i];
            const infoCheck = nProgress.getComponent(ProgressSupSkyLift).InfoFloorSkyLift;
            if (i == this._listNProgress.length - 1) {
                indexProgressReach = i;
            }

            if (infoCheck != null && infoCheck.progress < newProgress) {
                indexProgressIncrease = i + 1;
            }

            if (infoCheck != null && infoCheck.progress == newProgress) {
                indexProgressReach = i + 1;
            }

            if (infoCheck != null && infoCheck.progress > newProgress) {
                if (indexProgressIncrease == -1) { indexProgressIncrease += 1; }
                break;
            }
        }

        // anim show
        const nProgressIncrease: Node = this._listNProgress[indexProgressIncrease];
        const nProgressReach: Node = this._listNProgress[indexProgressReach];

        if (nProgressIncrease != null) {
            await nProgressIncrease.getComponent(ProgressSupSkyLift).IncreaseProgress(newProgress);
            const isRecevePrize = DataSkyLiftSys.Instance.IsReceivePrizeClone(nProgressIncrease.getComponent(ProgressSupSkyLift).InfoFloorSkyLift.idFloor)
            if (nProgressReach != null) {
                if (!isRecevePrize) {
                    nProgressIncrease.getComponent(ProgressSupSkyLift).PlayAnimReceivePrize();
                }
                await nProgressReach.getComponent(ProgressSupSkyLift).ReachLevel(this.sfBgLevelReach);
            }
        }
    }
    //#endregion anim
    //==========================================

    //==========================================
    //#region scroll
    private RegisterScroll() {
        this.sv.node.on(ScrollView.EventType.SCROLLING, this.Scrolling, this);
    }

    private UnRegisterScroll() {
        this.sv.node.off(ScrollView.EventType.SCROLLING, this.Scrolling, this);
    }

    private _offSetShowing: number[] = [];
    private Scrolling() {
        // check can hide item
        const offsetSV: Vec2 = this.sv.getScrollOffset();
        const listNewIndexOffSet: number[] = this.GetListIndexShowFromOffSet(offsetSV);

        const listDiffNumNew: number[] = listNewIndexOffSet.filter(v => !this._offSetShowing.includes(v));
        const listDiffNumOld: number[] = this._offSetShowing.filter(v => !listNewIndexOffSet.includes(v));

        this._offSetShowing = listNewIndexOffSet;

        listDiffNumNew.forEach(v => this._listNProgress[v].getComponent(UIOpacity).opacity = 255)
        listDiffNumOld.forEach(v => this._listNProgress[v].getComponent(UIOpacity).opacity = 0)
    }

    private readonly DIFF_WIDTH_MAX = 300;
    private readonly DIFF_WIDTH_MIN = 300;
    private GetListIndexShowFromOffSet(offset: Vec2): number[] {
        try {
            let result = [];
            const widthView = this.nView.getComponent(UITransform).width;
            const widthLayout = this.layoutContain.node.getComponent(UITransform).width;
            const min = -offset.x - this.DIFF_WIDTH_MIN;
            const max = -offset.x + widthView + this.DIFF_WIDTH_MAX;
            const listNFloor = this._listNProgress;

            // kiểm tra những node nào có pos nằm trong khoảng offset
            for (let i = 0; i < listNFloor.length; i++) {
                const nFloorCheck = listNFloor[i];
                if (nFloorCheck.position.x > min && nFloorCheck.position.x < max) {
                    result.push(i);
                }

                if (nFloorCheck.position.x > max) {
                    break;
                }
            }

            return result;
        } catch (e) {
            console.error(e);
        }
    }
    //#endregion scroll
    //==========================================

}