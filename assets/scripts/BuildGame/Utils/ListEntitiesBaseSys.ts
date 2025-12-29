import { _decorator, Component, instantiate, Node, Pool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Sat Jun 28 2025 16:32:28 GMT+0700 (Indochina Time)
 * ListEntitiesBaseSys
 * db://assets/scripts/BuildGame/Utils/ListEntitiesBaseSys.ts
 *
 */

@ccclass('ListEntitiesBaseSys')
export class ListEntitiesBaseSys extends Component {
    @property(Prefab) pfEntity: Prefab;
    @property({ tooltip: "có thể null hoặc không", type: Node }) nSaveItemReUse: Node;

    protected onEnable(): void {
        if (this._poolEntities == null) {
            this.InitPool();
        }
    }

    //==========================================
    //#region pool
    private _poolEntities: Pool<Node> = null; // Pool of entities
    public InitPool() {
        if (this._poolEntities == null) {
            this._poolEntities = new Pool<Node>(() => {
                return instantiate(this.pfEntity);
            }, 0); // Initial size of the pool
        }
    }

    public GetEntity(): Node {
        return this._poolEntities.alloc();
    }

    public ReUseEntiny(nEntiny: Node) {
        if (this._poolEntities == null) {
            console.error("Pool is not initialized. Call InitPool() first.");
            return;
        }
        if (nEntiny == null) {
            console.error("Entity to re-use is null.");
            return;
        }
        nEntiny.setParent(this.nSaveItemReUse != null ? this.nSaveItemReUse : this.node);
        nEntiny.active = false;
        this._poolEntities.free(nEntiny);
    }

    public ReUseAllEntities(listNEntinies: Node[]) {
        if (this._poolEntities == null) {
            console.error("Pool is not initialized. Call InitPool() first.");
            return;
        }
        if (listNEntinies == null || listNEntinies.length === 0) {
            console.error("list to re-use is null.");
            return;
        }
        for (const entity of listNEntinies) {
            if (entity != null) {
                entity.setParent(this.nSaveItemReUse != null ? this.nSaveItemReUse : this.node);
                entity.active = false;
                this._poolEntities.free(entity);
            }
        }
    }
    //#endregion pool
    //==========================================

    //==========================================
    //#region ID
    public _idAutoGen: number = 1;
    public GetAutoIdEntities(): number {
        const result = this._idAutoGen;
        this._idAutoGen += 1;
        return result;
    }
    public ResetAutoIdEntities() {
        this._idAutoGen = 1;
    }

    public ReduceIdEntities(numReduce: number = 1) {
        this._idAutoGen -= numReduce;
        if (this._idAutoGen < 1) {
            this._idAutoGen = 1;
        }
    }

    public SetMaxIdCar(idMax: number) {
        console.log("max id set: ", idMax);

        if (this._idAutoGen < idMax) {
            this._idAutoGen = idMax + 1;
        }
    }
    //#endreigon ID
    //==========================================
}