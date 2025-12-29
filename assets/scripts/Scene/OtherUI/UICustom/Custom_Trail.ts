import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { Custom_ItemTrail } from './Custom_ItemTrail';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CUSTOMS, STATE_ITEM_TRAIL } from '../../../Utils/Types/TypeCustoms';
import { DataTrailsSys } from '../../../DataBase/DataTrailsSys';
const { ccclass, property } = _decorator;

@ccclass('Custom_Trail')
export class Custom_Trail extends Component {
    @property(Node) nContent: Node;
    @property(Prefab) pfItemTrails: Prefab;

    private _listItemTrail: Custom_ItemTrail[] = [];

    protected onLoad(): void {
        // gen list items trail to it
        this.GenItemsTrail();

        clientEvent.on(EVENT_CUSTOMS.TRAIL.CHOICE_TRAIL, this.UnchoiceOldTrail, this);
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_CUSTOMS.TRAIL.CHOICE_TRAIL, this.UnchoiceOldTrail, this);
    }

    private GenItemsTrail(){
        const listDataTrails = DataTrailsSys.Instance.GetListTrails();
        const idDataTrailChoice: string = DataTrailsSys.Instance.GetIdTrailChoice();
        for(let i=0 ;i< listDataTrails.length ; i++){
            const dataTrail = listDataTrails[i];
            const itemTrail = instantiate(this.pfItemTrails);
            itemTrail.parent = this.nContent;
            const compItemTrail = itemTrail.getComponent(Custom_ItemTrail);
            const progressTrail : number = DataTrailsSys.Instance.GetProgressTrails(dataTrail.Id);
            compItemTrail.SetUp(dataTrail, idDataTrailChoice, progressTrail);
            this._listItemTrail.push(compItemTrail);
        }
    }

    //#region func listen
    private UnchoiceOldTrail(idTrail: string) {
        for (let i = 0; i < this._listItemTrail.length; i++) {
            const itemCheck = this._listItemTrail[i];
            if (itemCheck.InfoTrail.Id != idTrail && itemCheck.GetState() == STATE_ITEM_TRAIL.CHOICING) {
                itemCheck.ChangeState(STATE_ITEM_TRAIL.UNCHOICING);
                // because just can choice one => just change it 
                break;
            }
        }
    }
    //#endregion func listen
}


