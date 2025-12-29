/**
 * 
 * dinhquangvinhdev
 * Mon Aug 18 2025 09:18:21 GMT+0700 (Indochina Time)
 * MPoolSys
 * db://assets/scripts/Utils/MPoolSys.ts
*
*/
import { _decorator, Component, Node, Pool } from 'cc';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('MPoolSys')
export class MPoolSys extends Component {
    public mapPool: Map<string, Pool<any>> = new Map();

    //==========================================
    //#region base
    public onDisable(): void {
        // release all item in the pool
        this.mapPool.forEach(poolCheck => poolCheck.destroy());
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region public
    public IsRegisterPool(key: string): boolean {
        return this.mapPool.get(key) != null;
    }

    public RegisterPool(key: string, poolRegister: Pool<any>): boolean {
        if (this.mapPool.get(key) != null) { return false; }
        this.mapPool.set(key, poolRegister);
        return true;
    }

    public GetPool(key: string): Pool<any> {
        return this.mapPool.get(key);
    }

    public PoolItem(nItem: any, key: string): boolean {
        if (this.mapPool.get(key) == null) { return false; }
        this.mapPool.get(key).free(nItem);
        nItem.setParent(this.node);
        return true;
    }

    public PoolListItems(listItem: any[], key: string): boolean {
        if (this.mapPool.get(key) == null) { return false; }
        this.mapPool.get(key).freeArray(listItem);
        listItem.forEach(item => item.setParent(this.node));
        return true;
    }

    public GetItemFromPool(key: string): any {
        if (this.mapPool.get(key) == null) { return null; }
        const item = this.mapPool.get(key).alloc();
        return item;
    }

    public async GetItemUntilDone(key: string, cb: CallableFunction, time: number = 1): Promise<any> {
        while (true) {
            const itemGet = this.GetItemFromPool(key);
            if (itemGet != null) {
                cb(key, itemGet);
                break;
            }
            await Utils.delay(time * 1000);
        }
    }
}