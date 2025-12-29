import { _decorator, Component, instantiate, Layout, Node, Pool, UITransform } from 'cc';
import { ConfigSortColorBuild } from './ConfigSortColorBuild';
import { TGroupBuild } from '../../Utils/Types';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Fri Aug 22 2025 17:01:25 GMT+0700 (Indochina Time)
 * ListConfigSortColorBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ListConfigSortColorBuild.ts
 *
 */

@ccclass('ListConfigSortColorBuild')
export class ListConfigSortColorBuild extends Component {
    @property(ConfigSortColorBuild) configRoot: ConfigSortColorBuild;
    private _listConfig: Node[] = [];
    private _cbUpdateSizeSelf: CallableFunction;
    private _cbUpdateDataConfig: CallableFunction;
    private _poolConfig: Pool<Node> = null;
    //==========================================
    //#region base
    protected onLoad(): void {
        // init sẵn cb cho config
        this.configRoot.SetCb(this.AddMoreConfig.bind(this), this.RemoveMoreConfig.bind(this), this._cbUpdateDataConfig);

        this.TryInitPool();
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.SIZE_CHANGED, this.UpdateSizeSelf, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.SIZE_CHANGED, this.UpdateSizeSelf, this);
    }

    /**Func này buộc phải dc gọi trong onLoad cua cha */
    public SetUpCb(cbUpdateSizeSelf: CallableFunction, cbUpdateDataConfig: CallableFunction) {
        this._cbUpdateSizeSelf = cbUpdateSizeSelf;
        this._cbUpdateDataConfig = cbUpdateDataConfig;
    }

    private TryInitPool() {
        if (this._poolConfig == null) {
            // init pool
            this._poolConfig = new Pool(() => instantiate(this.configRoot.node), 0);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private AddMoreConfig(): Node {
        if (this._poolConfig == null) { this.TryInitPool(); }

        const newConfig: Node = this._poolConfig.alloc();
        newConfig.parent = this.node;
        newConfig.active = true;
        newConfig.getComponent(ConfigSortColorBuild).ResetData();
        newConfig.getComponent(ConfigSortColorBuild).SetCb(this.AddMoreConfig.bind(this), this.RemoveMoreConfig.bind(this), this._cbUpdateDataConfig);
        this.node.getComponent(Layout).updateLayout();

        this._listConfig.push(newConfig);
        return newConfig;
    }

    private RemoveMoreConfig(nRemove: Node) {
        const indexInConfig = this._listConfig.findIndex(nCheck => nCheck == nRemove);

        switch (true) {
            case this._listConfig.length == 1:
                nRemove.getComponent(ConfigSortColorBuild).ResetData();
                break;
            default:
                this._listConfig.splice(indexInConfig, 1);
                this._poolConfig.free(nRemove);
                nRemove.active = false;
                this.node.getComponent(Layout).updateLayout();
                break;
        }

        this._cbUpdateDataConfig && this._cbUpdateDataConfig();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public Reset() {
        // chỉ reUse những đối tượng có index > 0
        for (let i = this._listConfig.length - 1; i >= 1; i--) {
            const configReUsed = this._listConfig[i];
            if (configReUsed != null) {
                this._poolConfig.free(configReUsed);
                configReUsed.active = false;
            }
        }

        // reset configRoot
        this.configRoot.ResetData();

        // reset the list config
        this.node.getComponent(Layout).updateLayout();
        this._listConfig = [this.configRoot.node];
    }

    public GetDataToExport(): TGroupBuild[] {
        let listTGroupBuild: TGroupBuild[] = [];
        this._listConfig.forEach(nConfig => {
            const buildConfig = nConfig.getComponent(ConfigSortColorBuild);
            if (buildConfig.IsMValid()) {
                const dataHas = buildConfig.GetITGroup();
                if (dataHas == null) {
                    return null;
                }
                listTGroupBuild.push(dataHas);
            }
        });

        return listTGroupBuild;
    }

    public SetUpFirst(dataGroup: TGroupBuild[]) {
        // init config to suit with the data
        for (let i = 0; i < dataGroup.length; i++) {
            let configCheck = this._listConfig[i];
            if (configCheck == null) {
                // init config
                configCheck = this.AddMoreConfig();
            }

            const dataGroupBuildCheck = dataGroup[i];
            configCheck.getComponent(ConfigSortColorBuild).SetUpFirst(dataGroupBuildCheck);
        }
    }

    public NumColorUsing(): number {
        let result: number = 0;
        this._listConfig.forEach(nConfigCheck => {
            let numColorUse = nConfigCheck.getComponent(ConfigSortColorBuild).GetNumColorUsing();
            if (numColorUse != null && numColorUse > 0) result += numColorUse;
        })

        return result;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    private UpdateSizeSelf() {
        // check cb is valid
        this._cbUpdateSizeSelf && this._cbUpdateSizeSelf();
    }
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}