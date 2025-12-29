import { _decorator, Color, Component, EditBox, Node, Sprite } from 'cc';
import { TGroupBuild } from '../../Utils/Types';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Fri Aug 22 2025 17:01:39 GMT+0700 (Indochina Time)
 * ConfigSortColorBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ConfigSortColorBuild.ts
 *
 */

@ccclass('ConfigSortColorBuild')
export class ConfigSortColorBuild extends Component {

    @property(EditBox) private edbStart: EditBox;
    @property(EditBox) private edbEnd: EditBox;
    @property(EditBox) private edbQuality: EditBox;
    private _cbAddConfig: CallableFunction;
    private _cbRemoveConfig: CallableFunction;
    private _cbUpdateData: CallableFunction;
    //==========================================
    //#region base

    protected onEnable(): void {
        this.RegisterColorEdb(this.edbStart);
        this.RegisterColorEdb(this.edbEnd);
        this.RegisterColorEdb(this.edbQuality);
    }

    protected onDisable(): void {
        this.UnRegisterColorEdb(this.edbStart);
        this.UnRegisterColorEdb(this.edbEnd);
        this.UnRegisterColorEdb(this.edbQuality);
    }

    public SetCb(cbAddConfig: CallableFunction, cbRemoveConfig: CallableFunction, cbUpdateData: CallableFunction) {
        this._cbAddConfig = cbAddConfig;
        this._cbRemoveConfig = cbRemoveConfig;
        this._cbUpdateData = cbUpdateData;
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private RedEdb(edb: EditBox) {
        edb.getComponent(Sprite).color = Color.RED;
    }
    private GreenEdb(edb: EditBox) {
        edb.getComponent(Sprite).color = Color.WHITE;
    }
    private RegisterColorEdb(edb: EditBox) {
        edb.node.on(EditBox.EventType.TEXT_CHANGED, this.GreenEdb, this);
    }
    private UnRegisterColorEdb(edb: EditBox) {
        edb.node.on(EditBox.EventType.TEXT_CHANGED, this.GreenEdb, this);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUpFirst(configBuild: TGroupBuild) {
        if (configBuild == null) { return; }
        this.edbStart.string = configBuild.startR.toString();
        this.edbEnd.string = configBuild.endR.toString();
        this.edbQuality.string = configBuild.quality.toString();
    }

    public ResetData() {
        this.edbStart.string = '0';
        this.edbEnd.string = '100';
        this.edbQuality.string = '0';
    }

    public IsMValid(): boolean {
        return this.edbQuality.string != '' && this.edbStart.string != '' && this.edbEnd.string != '';
    }

    public GetITGroup(): TGroupBuild {
        let numQuality, startR, endR;

        if (!this.IsMValid()) {
            return null;
        }

        //quality
        try {
            numQuality = Number.parseInt(this.edbQuality.string);
        } catch (e) {
            this.RedEdb(this.edbQuality);
            return null;
        }

        // start
        try {
            startR = Number.parseInt(this.edbStart.string);
        } catch (e) {
            this.RedEdb(this.edbStart);
            return null;
        }

        //end
        try {
            endR = Number.parseInt(this.edbEnd.string);
        } catch (e) {
            this.RedEdb(this.edbEnd);
            return null;
        }

        return {
            quality: numQuality,
            startR: startR,
            endR: endR
        }
    }

    public GetNumColorUsing(): number {
        if (this.node && this.edbQuality) {
            try {
                let input = this.edbQuality.string;
                const result = Number.parseInt(input);
                if (!isNaN(result) && Number.isInteger(result)) {
                    return result;
                }
            } catch (e) {
                return null
            }
        }
        return null
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region btn
    public OnBtnAdd() {
        this._cbAddConfig && this._cbAddConfig();
    }

    public OnBtnRemoveSelf() {
        this._cbRemoveConfig && this._cbRemoveConfig(this.node);
    }
    //#endregion btn
    //==========================================

    //==========================================
    //#region edb
    public OnEdittingQualityNumColor() {
        if (this.node && this.node.active) {
            this._cbUpdateData && this._cbUpdateData();
        }
    }
    //#endregion edb
    //==========================================
}