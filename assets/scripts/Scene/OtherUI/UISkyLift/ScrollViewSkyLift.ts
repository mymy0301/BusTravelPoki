/**
 * 
 * dinhquangvinhdev
 * Thu Aug 28 2025 16:55:50 GMT+0700 (Indochina Time)
 * ScrollViewSkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/ScrollViewSkyLift.ts
*
*/
import { _decorator, CCFloat, Component, Layout, Node, ScrollView, tween, TweenEasing, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { ListFloorBase } from './ListFloorBase';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { CONFIG_SL } from './TypeSkyLift';
const { ccclass, property } = _decorator;

@ccclass('CInfoLayer')
class CInfoLayer {
    @property(CCFloat) idLayer: number = 0;
    @property(CCFloat) y_start: number = 0;
    @property(CCFloat) y_end: number = 0;
    @property(Node) nLayer: Node;
}

@ccclass('ScrollViewSkyLift')
export class ScrollViewSkyLift extends Component {
    @property({ type: CInfoLayer }) listInfoLayer: CInfoLayer[] = [];
    @property(UITransform) transformLayout: UITransform;
    @property(ListFloorBase) listFloorBase: ListFloorBase;
    @property(ScrollView) sv: ScrollView;
    @property(Node) nView: Node;
    @property(Layout) layout: Layout;
    //==========================================
    //#region base
    protected onDisable(): void {
        this.node.off(ScrollView.EventType.SCROLLING, this.Scrolling, this);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private _totalHOfOffset: number = 0;
    private CaculTotalHeightOfOffSet() {
        const totalHeightOfLayout = this.transformLayout.height;
        const totalHeightOfView = this.node.getComponent(UITransform).height;
        this._totalHOfOffset = totalHeightOfLayout - totalHeightOfView;
    }

    private UpdateAllLayers() {
        // tính toán phần offset của scrollView và tính lại cho hợp lý vs layer sau
        // trong trường hợp này là scroll theo chiều dọc và scrollView bottomToTop
        if (this._totalHOfOffset == 0) {
            this.CaculTotalHeightOfOffSet()
        }
        const offSet = this.node.getComponent(ScrollView).getScrollOffset();
        const raitoScrollTo = offSet.y / this._totalHOfOffset;

        // update each layer
        this.listInfoLayer.forEach(infoLayer => {
            const rightY = infoLayer.y_end - raitoScrollTo * (infoLayer.y_end - infoLayer.y_start);
            infoLayer.nLayer.position = new Vec3(infoLayer.nLayer.position.x, rightY);
        })
    }

    private GetOffSetScrollByIndexFloor(indexFloor: number): Vec2 {
        let totalHeight = this.listFloorBase._totalHeight;
        const listNFloor = this.listFloorBase._listNFloor;
        const layoutMap = this.listFloorBase.layoutMap;

        let y = layoutMap.paddingBottom;
        for (let i = 0; i <= indexFloor; i++) {
            y += listNFloor[i].getComponent(UITransform).height;
        }

        if (totalHeight == -1) {
            for (let i = 0; i < listNFloor.length; i++) {
                totalHeight += listNFloor[i].getComponent(UITransform).height;
            }

            totalHeight += layoutMap.paddingBottom + layoutMap.paddingTop;
            this.listFloorBase._totalHeight = totalHeight;
        }


        const rightHeight = totalHeight - y - 500;
        return new Vec2(0, rightHeight > 0 && rightHeight < this.sv.getMaxScrollOffset().y ? rightHeight : totalHeight - y);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public RegisterEvent() {
        this.node.on(ScrollView.EventType.SCROLLING, this.Scrolling, this);
    }

    public ScrollToProgress(progress: number, force: boolean, timeScroll: number = 1) {
        // ở đây chúng ta sẽ tìm index floor tương ứng
        const indexFloorProgress: number = DataSkyLiftSys.Instance.GetIndexFloorProgress(progress);

        const offSetProgress = this.GetOffSetScrollByIndexFloor(indexFloorProgress);
        if (force) {
            this.sv.scrollToOffset(offSetProgress, 0, true);
            this.Scrolling();
            this.UpdateAllLayers();
        } else {
            this.sv.scrollToOffset(offSetProgress, timeScroll);
        }
    }

    public ScrollToProgressCustom(progress: number, force: boolean, timeScroll: number = 1, easingChoice: TweenEasing = 'cubicIn') {
        const self = this;
        // ở đây chúng ta sẽ tìm index floor tương ứng
        const indexFloorProgress: number = DataSkyLiftSys.Instance.GetIndexFloorProgress(progress);

        const basePos = this.listFloorBase.node.position.clone();
        const offSetProgress = this.GetOffSetScrollByIndexFloor(indexFloorProgress);
        const viewHeight = this.nView.getComponent(UITransform).height;
        const totalHeight = this.listFloorBase._totalHeight;
        const rightY = totalHeight - offSetProgress.y - viewHeight;

        const posMoveTo = new Vec3(basePos.x, rightY, 0);
        if (force) {
            this.listFloorBase.node.position = posMoveTo;
        } else {
            tween(this.listFloorBase.node)
                .to(timeScroll, { position: posMoveTo }, {
                    easing: easingChoice, onUpdate(target, ratio) {
                        self.UpdateAllLayers();
                        self.Scrolling();
                    }
                })
                .start();
        }
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region scroll
    private _offSetShowing: number[] = [];
    private Scrolling() {
        this.UpdateAllLayers();

        // check can hide item
        const offsetSV: Vec2 = this.sv.getScrollOffset();
        const listNewIndexOffSet: number[] = this.GetListIndexShowFromOffSet(offsetSV);

        const listDiffNumNew: number[] = listNewIndexOffSet.filter(v => !this._offSetShowing.includes(v));
        const listDiffNumOld: number[] = this._offSetShowing.filter(v => !listNewIndexOffSet.includes(v));

        this._offSetShowing = listNewIndexOffSet;

        listDiffNumNew.forEach(v => this.listFloorBase.ListNFloor[v].getComponent(UIOpacity).opacity = 255)
        listDiffNumOld.forEach(v => this.listFloorBase.ListNFloor[v].getComponent(UIOpacity).opacity = 0)
    }

    private readonly DIFF_HEIGHT_MAX = 300;
    private readonly DIFF_HEIGHT_MIN = 300;
    private GetListIndexShowFromOffSet(offset: Vec2): number[] {
        try {
            let result = [];
            const heightView = this.nView.getComponent(UITransform).height;
            const heightLayout = this.layout.getComponent(UITransform).height;
            const min = (heightLayout - heightView) - offset.y - this.DIFF_HEIGHT_MIN;
            const max = (heightLayout - heightView) - offset.y + heightView + this.DIFF_HEIGHT_MAX;
            const listNFloor = this.listFloorBase.ListNFloor

            // kiểm tra những node nào có pos nằm trong khoảng offset
            for (let i = 0; i < listNFloor.length; i++) {
                const nFloorCheck = listNFloor[i];
                if (nFloorCheck.position.y > min && nFloorCheck.position.y < max) {
                    result.push(i);
                }

                if (nFloorCheck.position.y > max) {
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

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}