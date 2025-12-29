import { _decorator, Component, Node } from 'cc';
import { IJsonPrizeLeaderboard, IPrize, TYPE_RECEIVE } from '../../../Utils/Types';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
const { ccclass, property } = _decorator;

@ccclass('ListPrizePreshow')
export class ListPrizePreshow extends Component {
    @property([ItemPrizeLobby]) listPrizeTop1: ItemPrizeLobby[] = [];
    @property([ItemPrizeLobby]) listPrizeTop2: ItemPrizeLobby[] = [];
    @property([ItemPrizeLobby]) listPrizeTop3: ItemPrizeLobby[] = [];

    /**
     * sample typePrize_typeReceive_value < value at least 10>
     * {
     *    prize1: '0_0_10';
     *    prize2: '1_0_10';
     *    prize3: '2_0_10';
     * }
     * @param jsonPrize 
     */
    public InitListPrize(listPrize: IPrize[][]): void {
        function SetUpForTop(listPrize: ItemPrizeLobby[], listPrizeTop: IPrize[]) {
            for (let i = 0; i < listPrizeTop.length; i++) {
                const prize = listPrizeTop[i];
                listPrize[i].SetUp(prize, listPrize[i].node.position.clone(), 1);
            }
        }

        // set up data
        if(listPrize[0]){
            SetUpForTop(this.listPrizeTop1, listPrize[0]);

        }
        if(listPrize[1]){
            SetUpForTop(this.listPrizeTop2, listPrize[1]);
        }
        if(listPrize[2]){
            SetUpForTop(this.listPrizeTop3, listPrize[2]);
        }
    }

    public Hide() {
        this.node.active = false;
    }
}


