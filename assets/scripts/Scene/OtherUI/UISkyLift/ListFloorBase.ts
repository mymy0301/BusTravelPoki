/**
 * 
 * anhngoxitin01
 * Wed Aug 27 2025 09:24:05 GMT+0700 (Indochina Time)
 * ListFloorBase
 * db://assets/scripts/Scene/OtherUI/UISkyLift/ListFloorBase.ts
*
*/
import { _decorator, Component, instantiate, Layout, Node, Pool, Prefab, ScrollView, SpriteFrame, tween, TweenEasing, UITransform, Vec2, Vec3, Widget } from 'cc';
import { PoolLobbySys } from '../../LobbyScene/PoolLobbySys';
import { ReadDataJson } from '../../../ReadDataJson';
import { CONFIG_SL, EVENT_SKY_LIFT, InfoFloorSkyLiftJSON } from './TypeSkyLift';
import { FloorBaseSys } from './FloorBaseSys';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
const { ccclass, property } = _decorator;
const POOL_PRIZE_FLOOR = "POOL_PRIZE_FLOOR"

@ccclass('ListFloorBase')
export class ListFloorBase extends Component {
    @property(SpriteFrame) sfBgLevelReached: SpriteFrame;
    @property(SpriteFrame) sfBgLevelNotReach: SpriteFrame;
    @property(SpriteFrame) sfRailSave: SpriteFrame;
    @property(SpriteFrame) sfRailNotSave: SpriteFrame;
    @property(SpriteFrame) listSfPrizeBlue: SpriteFrame[] = [];
    @property(SpriteFrame) listSfPrizeRed: SpriteFrame[] = [];
    @property(SpriteFrame) listSfPrizePurple: SpriteFrame[] = [];
    @property(Prefab) pfFloorLoop: Prefab;
    @property(Prefab) pfFloorBase: Prefab;
    @property(Prefab) pfFloorTop: Prefab;
    @property(Node) nMap: Node;
    @property(Layout) layoutMap: Layout;
    @property(Prefab) pfPrize: Prefab;
    @property(Node) nTempPrize: Node;
    public _listNFloor: Node[] = []; public get ListNFloor(): Node[] { return this._listNFloor; }
    public _totalHeight: number = -1;

    //==========================================
    //#region base
    protected start(): void {
        if (!PoolLobbySys.Instance.IsRegisterPool(POOL_PRIZE_FLOOR)) {
            const newPool = new Pool<Node>(() => instantiate(this.pfPrize), 0)
            PoolLobbySys.Instance.RegisterPool(POOL_PRIZE_FLOOR, newPool);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region public
    public InitMap() {
        // init floor
        const listInfoMapFloor: InfoFloorSkyLiftJSON[] = DataSkyLiftSys.Instance.GetDataJson;
        for (let i = 0; i < listInfoMapFloor.length; i++) {
            const infoMap: InfoFloorSkyLiftJSON = listInfoMapFloor[i];
            let nFloorInit: Node = null;
            switch (true) {
                // init base
                case i == 0:
                    nFloorInit = instantiate(this.pfFloorBase);
                    nFloorInit.getComponent(FloorBaseSys).SetUpData(infoMap, this.sfRailSave, this.sfRailNotSave, this.GetListSfPrize.bind(this));
                    break;
                // init top
                case i == listInfoMapFloor.length - 1:
                    nFloorInit = instantiate(this.pfFloorTop);
                    nFloorInit.getComponent(FloorBaseSys).SetUpData(infoMap, this.sfRailSave, this.sfRailNotSave, this.GetListSfPrize.bind(this));
                    nFloorInit.getComponent(FloorBaseSys).animPrize.RegisterCb(
                        this.InitPrize.bind(this),
                        this.ReUsePrize.bind(this)
                    )
                    break;
                // mid
                default:
                    nFloorInit = instantiate(this.pfFloorLoop);
                    nFloorInit.getComponent(FloorBaseSys).SetUpData(infoMap, this.sfRailSave, this.sfRailNotSave, this.GetListSfPrize.bind(this));
                    nFloorInit.getComponent(FloorBaseSys).animPrize.RegisterCb(
                        this.InitPrize.bind(this),
                        this.ReUsePrize.bind(this)
                    )
                    break;
            }

            // add to list
            nFloorInit.setParent(this.nMap);
            this._listNFloor.push(nFloorInit);
        }
    }

    public SetUpDataToMap(progressSet: number) {
        this._listNFloor.forEach(nFloor => nFloor.getComponent(FloorBaseSys).SetUpProgress(progressSet, this.sfBgLevelReached, this.sfBgLevelNotReach));
    }

    public GetWPosToSetCarWithProgress(progress: number) {
        let result: Vec3 = Vec3.ZERO;

        // ở đây chúng ta sẽ tìm index floor tương ứng
        const indexFloorProgress: number = DataSkyLiftSys.Instance.GetIndexFloorProgress(progress);
        // check nếu như đang ở đúng mốc rùi thì ta sẽ lấy vị trí của icon mốc đó luôn
        // còn nếu chưa đạt được mốc đấy thì ta sẽ lùi index -1 và lấy theo separate
        const nFloorChoice = this._listNFloor[indexFloorProgress].getComponent(FloorBaseSys);
        switch (true) {
            // case ở vạch xuất phát
            case progress == 0:
                result = nFloorChoice.spBgLevel.node.worldPosition.clone().add3f(CONFIG_SL.DIFF_X_CAR_AND_SEPARATE, -50, 0);
                break;
            // case ở mốc
            case nFloorChoice.InfoFloorSkyLift.progress == progress:
                result = nFloorChoice.GetWPosCarWithBgLevel();
                break;
            // case mặc định
            default:
                const nFloorRight = this._listNFloor[indexFloorProgress - 1].getComponent(FloorBaseSys);
                result = nFloorRight.GetWPosSeparateWithProgress(progress);
                break;
        }

        return result;
    }

    public async IncreaseProgress(progress: number) {
        // ở đây chúng ta sẽ auto reward prize luôn

        // tìm floor suitable => tăng tiến trình
        // nếu đạt đến mốc cuối scale bgLevel của floor kế tiếp thay đổi UI

        const indexFloorIncrease = DataSkyLiftSys.Instance.GetIndexFloorProgress(progress) - 1;

        const floorComAnim = this._listNFloor[indexFloorIncrease].getComponent(FloorBaseSys);
        await floorComAnim.IncreaseProgress(progress);

        // case nâng max level
        if (this._listNFloor[indexFloorIncrease + 1].getComponent(FloorBaseSys).InfoFloorSkyLift.progress == progress) {
            // bổ sung hiệu ứng scale bglevel và thay ảnh
            await this._listNFloor[indexFloorIncrease + 1].getComponent(FloorBaseSys).AnimReachLevel(this.sfBgLevelReached);
        }
    }

    public async DecreaseProgress(oldProgress: number, newProgress: number, totalTimeAnim: number) {
        const indexFloorOld = DataSkyLiftSys.Instance.GetIndexFloorProgress(oldProgress);
        const indexFloorNew = DataSkyLiftSys.Instance.GetIndexFloorProgress(newProgress);

        // console.log(oldProgress, indexFloorOld);
        // console.log(newProgress, indexFloorNew);


        // tạo list index Decrease theo thứ tự từ dưới lên
        let listIndexFloorDecrease = []
        listIndexFloorDecrease = new Array(indexFloorOld - indexFloorNew + 1).fill(0).map((v, _i) => indexFloorNew + _i);
        //NOTE Phần logic đoạn này đang chưa được thiết kế hợp lý cho việc dễ đọc hiểu 
        // Lý do : json thiết kế đang chưa tốt do đó phần đọc đang bị phức tạp và khó hiểu

        // loop list index decrease theo thứ tự từ trên xuống và gọi decrease level
        const timeDropEachFloor = totalTimeAnim / (listIndexFloorDecrease.length - 1);
        for (let i = listIndexFloorDecrease.length - 1; i >= 0; i--) {
            const indexFloorDecrease = listIndexFloorDecrease[i]
            const floorDecrease = this._listNFloor[indexFloorDecrease];
            await floorDecrease.getComponent(FloorBaseSys).DecreaseLevel(this.sfBgLevelNotReach, timeDropEachFloor);
        }
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region prize
    private InitPrize(): Node {
        return PoolLobbySys.Instance.GetItemFromPool(POOL_PRIZE_FLOOR);
    }
    private ReUsePrize(listPrize: Node[]) {
        PoolLobbySys.Instance.PoolListItems(listPrize, POOL_PRIZE_FLOOR);
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
    //#region btn
    //#endregion btn
    //==========================================
}