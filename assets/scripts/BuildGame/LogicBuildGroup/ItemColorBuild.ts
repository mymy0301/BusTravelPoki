import { _decorator, CCInteger, Color, Component, EditBox, Label, Node, Size, Sprite, UITransform } from 'cc';
import { ListConfigSortColorBuild } from './ListConfigSortColorBuild';
import { GetMColorByNumber, GetPriorityDefaultByColor, TGroupBuild } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConfigBuildGame } from '../MConfigBuildGame';
import { MConstBuildGame } from '../MConstBuildGame';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Fri Aug 22 2025 17:01:07 GMT+0700 (Indochina Time)
 * ItemColorBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ItemColorBuild.ts
 *
 */

@ccclass('ItemColorBuild')
export class ItemColorBuild extends Component {
    @property(ListConfigSortColorBuild) listConfigColor: ListConfigSortColorBuild;
    @property(Label) lbNumColor: Label;
    @property(Label) lbNumCar: Label;
    @property(Sprite) spBg: Sprite;
    @property(EditBox) ebPriority: EditBox;
    @property({ type: CCInteger, tooltip: 'Tham khảo trong MCOLOR' }) idColor: number = 0;
    private _numColor: number = 0; public get NumColor() { return this._numColor };
    //==========================================
    //#region base
    protected onLoad(): void {
        this.listConfigColor.SetUpCb(this.UpdateTransformSelf.bind(this), this.UpdateDataConfig.bind(this));
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUp(numColor: number, numCar: number, dataGroupBuild: TGroupBuild[], priority: number) {
        this._numColor = numColor;
        this.lbNumColor.string = numColor.toString();
        this.lbNumCar.string = numCar.toString();
        this.listConfigColor.SetUpFirst(dataGroupBuild);
        this.ebPriority.string = priority.toString();
    }
    public Reset() {
        this._numColor = 0;
        this.listConfigColor.Reset();
    }

    public SetBackground(index: number) {
        this.spBg.color = index % 2 == 0 ? Color.WHITE : Color.GRAY;
    }

    public get PriorityColor(): number {
        const edtPriority = this.ebPriority.string;
        if (edtPriority == null || edtPriority == "") {
            const mColorNow = GetMColorByNumber(this.idColor + 1);
            return GetPriorityDefaultByColor(mColorNow);
        }

        return Number.parseInt(edtPriority);
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    private UpdateTransformSelf() {
        const oldSize = this.node.getComponent(UITransform).contentSize.clone();
        this.node.getComponent(UITransform).contentSize = new Size(oldSize.x, this.listConfigColor.node.getComponent(UITransform).contentSize.y);
    }

    private UpdateDataConfig() {
        // loop all config to get the numColorUsing
        const colorUsing: number = this.listConfigColor.NumColorUsing();
        clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.UDPATE_GROUP, this.idColor, colorUsing);
    }
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}