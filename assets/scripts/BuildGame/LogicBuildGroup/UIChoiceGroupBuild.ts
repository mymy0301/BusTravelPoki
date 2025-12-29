import { _decorator, Component, instantiate, Node, Pool } from 'cc';
import { TGroupToLogic } from '../../Utils/Types';
import { MConfigBuildGame } from '../MConfigBuildGame';
import { ChoiceGroupBuild } from './ChoiceGroupBuild';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 25 2025 15:33:55 GMT+0700 (Indochina Time)
 * UIChoiceGroupBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/UIChoiceGroupBuild.ts
 *
 */

@ccclass('UIChoiceGroupBuild')
export class UIChoiceGroupBuild extends Component {
    @property(Node) nTemplateGroupChoice: Node;
    @property(Node) nSaveTemp: Node;
    @property(Node) nLayout: Node;
    private _listNGroup: Node[] = [];
    private _pool: Pool<Node> = null;
    private _cbChoiceGroup: CallableFunction;
    private _indexChoicing: number = 0; public GetIndexChoice() { return this._indexChoicing; }
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private TryInitPool() {
        if (this._pool == null) {
            this._pool = new Pool(() => instantiate(this.nTemplateGroupChoice), 0);
        }
    }

    private PoolObj(objSet: Node) {
        objSet.active = false;
        objSet.setParent(this.nSaveTemp);
        this._pool.free(objSet);
    }

    private ChoiceGroup(indexChoice: number) {
        if (this._listNGroup[indexChoice] == null) { return; }

        this._indexChoicing = indexChoice;
        this._cbChoiceGroup && this._cbChoiceGroup(indexChoice);
        this._listNGroup.forEach(nChoice => nChoice.getComponent(ChoiceGroupBuild).UIUnChoice());
        this._listNGroup[indexChoice].getComponent(ChoiceGroupBuild).UIChoice();
    }

    private ForceChoice(_indexChoicing: number) {
        if (this._listNGroup[_indexChoicing] == null) { return; }

        this._indexChoicing = _indexChoicing;
        this._listNGroup.forEach(nChoice => nChoice.getComponent(ChoiceGroupBuild).UIUnChoice());
        this._listNGroup[_indexChoicing].getComponent(ChoiceGroupBuild).UIChoice();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public Reset() {
        this._listNGroup.forEach(nCheck => this.PoolObj(nCheck));
        this._listNGroup = [];
    }

    public SetUp(cbChoiceGroup: CallableFunction) {
        this._cbChoiceGroup = cbChoiceGroup;

        this._indexChoicing = 0;

        this.TryInitPool();

        const listGroupLogic = MConfigBuildGame.listLogicGroup;

        listGroupLogic.forEach((groupLogic, _index) => {
            let nChoice = this._pool.alloc();
            nChoice.setParent(this.nLayout);
            nChoice.active = true;
            nChoice.getComponent(ChoiceGroupBuild).SetUp(_index, this.ChoiceGroup.bind(this));
            nChoice.getComponent(ChoiceGroupBuild).UIUnChoice();
            this._listNGroup.push(nChoice);
        })

        this.ForceChoice(0);
    }

    /**
     * This func will be call when update newData or delete data
     */
    public UpdateUI() {
        const listGroupLogic = MConfigBuildGame.listLogicGroup;

        switch (true) {
            case listGroupLogic.length > this._listNGroup.length:
                // init more
                const lengthnChoiceNow = this._listNGroup.length;
                for (let i = lengthnChoiceNow; i <= listGroupLogic.length - 1; i++) {
                    let nChoice = this._pool.alloc();
                    nChoice.setParent(this.nLayout);
                    nChoice.active = true;
                    nChoice.getComponent(ChoiceGroupBuild).SetUp(i, this.ChoiceGroup.bind(this));
                    this._listNGroup.push(nChoice);
                }
                break;
            case listGroupLogic.length < this._listNGroup.length:
                const numRemove = this._listNGroup.length - listGroupLogic.length;
                let listNPool: Node[] = this._listNGroup.splice(this._listNGroup.length - numRemove, numRemove);
                listNPool.forEach(nPool => this.PoolObj(nPool));

                if (this._indexChoicing >= this._listNGroup.length) { this.ForceChoice(0) }
                break;
        }
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}