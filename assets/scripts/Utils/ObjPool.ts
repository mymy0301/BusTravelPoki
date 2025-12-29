import { _decorator, Component, error, instantiate, Node, Prefab } from 'cc';
import { MConsolLog } from '../Common/MConsolLog';
const { ccclass, property } = _decorator;

@ccclass('ObjectPool')
export class ObjectPool {
    private _listObjsWaiting: any[] = [];
    private _listObjsUsing: any[] = [];
    private mPrefab: Prefab = null;
    private nParent: Node = null;
    private nNode: Node = null;

    public InitObjectPool(nParent: Node, mPrefab: Prefab = null, nNode: Node = null) {
        this.mPrefab = mPrefab;
        this.nParent = nParent;
        this.nNode = nNode;
        this._listObjsWaiting = [];
        this._listObjsUsing = [];
    }

    public InitObjsPool(maxNumberInitStart: number) {
        // init list
        for (let i = 0; i < maxNumberInitStart; i++) {
            let newObj = this.GenObjects();
            this._listObjsWaiting.push(newObj);
        }
    }



    private GenObjects(): Node {
        let newObj = instantiate(this.mPrefab != null ? this.mPrefab : this.nNode) as Node;
        newObj.active = false;
        newObj.setParent(this.nParent);
        return newObj;
    }

    public GetObj(): Node {

        let objResult: Node;
        // objResult = this.GenObjects();
        if (this._listObjsWaiting.length == 0) {
            objResult = this.GenObjects();
        } else {
            objResult = this._listObjsWaiting.pop();
        }
        this._listObjsUsing.push(objResult);
        return objResult;
    }

    public ReUseObj(obj: Node) {
        obj.active = false;
        let indexObj = this._listObjsUsing.indexOf(obj);
        if (indexObj != -1) {
            this._listObjsUsing.splice(this._listObjsUsing.indexOf(obj), 1);
            this._listObjsWaiting.push(obj);
        }
    }

    public ReUseObj2(obj: Node) {
        obj.active = false;
        this._listObjsUsing.splice(this._listObjsUsing.indexOf(obj), 1);
        this._listObjsWaiting.push(obj);
    }

    public ReUseObj3(obj: Node, tempSaveNode: Node) {
        obj.active = false;
        this._listObjsUsing.splice(this._listObjsUsing.indexOf(obj), 1);
        this._listObjsWaiting.push(obj);
        obj.setParent(tempSaveNode);
    }

    public ReUseObj4(obj: Node) {
        const indexObj = this._listObjsUsing.indexOf(obj);
        if (indexObj == -1) { return; }
        let listObjRemove = this._listObjsUsing.splice(this._listObjsUsing.indexOf(obj), 1);
        this._listObjsWaiting.push(listObjRemove[0]);
    }

    public DestroyObj(obj: Node) {
        obj.destroy();
        this._listObjsUsing = this._listObjsUsing.filter(element => element != undefined && element != null);
    }

    public ReUseAllObjUsing(parentNode: Node) {
        this._listObjsUsing.forEach(element => {
            element.active = false;
            this._listObjsWaiting.push(element);
            element.setParent(parentNode);
        });
        this._listObjsUsing = [];
    }

    public GetListObjPoolWaiting() { return this._listObjsWaiting; }
    public GetListObjPoolUsing() { return this._listObjsUsing; }

    public LogListObj() { MConsolLog.Log(this._listObjsWaiting); }
}


