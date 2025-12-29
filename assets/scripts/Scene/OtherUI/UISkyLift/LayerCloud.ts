/**
 * 
 * dinhquangvinhdev
 * Fri Aug 29 2025 11:00:11 GMT+0700 (Indochina Time)
 * LayerCloud
 * db://assets/scripts/Scene/OtherUI/UISkyLift/LayerCloud.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, randomRange, randomRangeInt, Tween, tween, UITransform, Vec3 } from 'cc';
import { PoolLobbySys } from '../../LobbyScene/PoolLobbySys';
const { ccclass, property } = _decorator;

const KEY_POOL_CLOUD = "KEY_POOL_CLOUD";

@ccclass('LayerCloud')
export class LayerCloud extends Component {
    @property(Prefab)
    cloudPrefab: Prefab = null;

    @property(Node)
    cloudParent: Node = null;

    @property
    minCloudScale: number = 0.5;

    @property
    maxCloudScale: number = 1.2;

    @property
    minSpeed: number = 50; // pixel / giây
    @property
    maxSpeed: number = 120;

    @property
    minGroupSize: number = 2;
    @property
    maxGroupSize: number = 5;

    @property
    maxCloud: number = 10;
    @property
    maxGroupCloudStart: number = 5;

    @property
    timeInitCloud: number = 3;

    private _idCloud: number = 0;
    private _mapCloud: Map<number, Node> = new Map();
    private _mapTweenCloud: Map<number, Tween<Node>> = new Map();
    private readonly minHeight = 1073.8;

    //===========================================
    //#region base
    protected onEnable(): void {
        if (PoolLobbySys.Instance != null && PoolLobbySys.Instance.IsRegisterPool(KEY_POOL_CLOUD)) {
            this._mapCloud.forEach(cloud => {
                PoolLobbySys.Instance.PoolItem(cloud, KEY_POOL_CLOUD);
            })
        }

        // Bắt đầu spawn loop
        this.KeepGroupCloud();
        this.schedule(this.SpawnCloudGroup, this.timeInitCloud);
    }

    protected onDisable(): void {
        this._mapTweenCloud.forEach(tCloud => tCloud.stop());
        this.unschedule(this.SpawnCloudGroup);
    }
    //#endregion base
    //===========================================

    //===========================================
    //#region self

    private TryRegisterPool() {
        if (!PoolLobbySys.Instance.IsRegisterPool(KEY_POOL_CLOUD)) {
            PoolLobbySys.Instance.RegisterPool(KEY_POOL_CLOUD, new Pool<Node>(() => instantiate(this.cloudPrefab), 0));
        }
    }

    private KeepGroupCloud() {
        if (this._mapCloud.size > 0) {
            this._mapTweenCloud.forEach(tCloud => {
                tCloud.start();
            })
        } else {
            this.TryRegisterPool();

            for (let i = 0; i < this.maxCloud; i++) {
                this.SpawnCloudGroup(true, "KEY_KEY");
            }
        }
    }

    private SpawnCloudGroup(isPosFromMid: boolean, seed: string) {
        // giới hạn cloud để tối ưu
        if (this._mapCloud.size >= this.maxCloud) { return; }
        this.TryRegisterPool();

        let groupSize = randomRangeInt(this.minGroupSize, this.maxGroupSize + 1);

        // init list pos
        for (let i = 0; i < groupSize; i++) {
            // Init cloud
            let cloud = PoolLobbySys.Instance.GetItemFromPool(KEY_POOL_CLOUD);
            this.cloudParent.addChild(cloud);
            this._mapCloud.set(this._idCloud++, cloud);
            // set move
            this.MoveCloud(this._idCloud, i, cloud, isPosFromMid, seed);
        }
    }

    private MoveCloud(idCloud: number, indexInGroup: number, cloud: Node, fromMid: boolean = false, seed: string = '') {
        const infoCloud = this.GetInfoCloudStart(indexInGroup, fromMid, idCloud.toString());

        cloud.setPosition(infoCloud.posS);
        cloud.setScale(infoCloud.scale);

        // tween di chuyển
        cloud.active = true;
        this._mapTweenCloud.set(
            idCloud,
            tween(cloud)
                .to(infoCloud.duration, { position: infoCloud.posE })
                .call(() => {
                    if (PoolLobbySys.Instance != null) {
                        try {
                            cloud.active = false;
                            PoolLobbySys.Instance.PoolItem(cloud, KEY_POOL_CLOUD);
                            this._mapCloud.delete(idCloud);
                            this._mapTweenCloud.delete(idCloud);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                })
                .start()
        )
    }

    /**
     * 
     * @param indexInGroup 
     * @param fromMid // false: cloud từ start || true: cloud trong khoảng start đến end
     * @param seed:      // fromMid == true => you need seedKey
     * @param xStart    // -800 - bắt đầu ngoài màn hình
     * @param xEnd      // 800 - kết thúc ngoài màn hình
     * @returns 
     */
    private GetInfoCloudStart(indexInGroup: number, fromMid: boolean, seed: string = '', xStart: number = -800, xEnd: number = 800): { posS: Vec3, posE: Vec3, scale: Vec3, duration: number } {
        const parentUI = this.cloudParent.getComponent(UITransform);

        // random y trong khoảng chiều cao của layer
        let y = randomRangeInt(this.minHeight, parentUI.height);
        let posS: Vec3;

        // set vị trí ban đầu (lệch thêm chút cho từng đám trong nhóm)
        if (fromMid) {
            posS = sunflowerPointsInRectangel(xEnd, parentUI.height, 1)[0];
            posS.add3f(0, this.minHeight + parentUI.height / 2, 0);
            y = posS.y;
        } else {
            y = randomRangeInt(this.minHeight, parentUI.height);
            posS = new Vec3(xStart, y, 0);
        }

        const posE = new Vec3(xEnd, y, 0)

        // random scale
        let valueScale = randomRange(this.minCloudScale, this.maxCloudScale);
        const scale = new Vec3(valueScale, valueScale, 1)

        // random tốc độ
        let speed = randomRange(this.minSpeed, this.maxSpeed);
        let distance = xEnd - (xStart - indexInGroup * 50);
        const duration = distance / speed;

        return {
            posS: posS,
            posE: posE,
            scale: scale,
            duration: duration
        }
    }

    //#endregion self
    //===========================================
}

/**
 * Generates N evenly distributed random points within a rectange using the sunflower algorithm.
 * @param width width of rectange.
 * @param height height of rectange.
 * @param count The number of points to generate.
 * @returns An array of Vec3 positions.
 */
function sunflowerPointsInRectangel(width: number, height: number, count: number): Vec3[] {
    const points: Vec3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const indexStart: number = randomRangeInt(1, 100);
    for (let i = indexStart; i < indexStart + count; i++) {
        const theta = i * goldenAngle;
        const x = width / 2 * Math.cos(theta);
        const y = height / 2 * Math.sin(theta);
        points.push(new Vec3(x, y, 0));
    }
    return points;
}