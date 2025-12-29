import { _decorator, Component, instantiate, Node, Prefab, Rect, ScrollView, UITransform } from 'cc';
import { DataFriendJoinedSys } from '../../../DataBase/DataFriendJoinedSys';
import { ItemPrizeUIInviteFriend } from './ItemPrizeUIInviteFriend';
const { ccclass, property } = _decorator;

@ccclass('ListPrizeFriendJoined')
export class ListPrizeFriendJoined extends Component {
    @property(Prefab) prefabItemPrizeFriendJoined: Prefab;
    @property(Node) content: Node;

    private _wasInit: boolean = false;

    public Init() {
        if (this._wasInit) return;

        let data = DataFriendJoinedSys.Instance.GetAllPrizeFriendJoined();
        let numPrizeReceiveNow = DataFriendJoinedSys.Instance.GetNumberPrizeFriendWasReceived(DataFriendJoinedSys.Instance.GetNumberFriendLocal());

        for (let i = 0; i < data.length; i++) {
            let item = instantiate(this.prefabItemPrizeFriendJoined);
            item.parent = this.content;
            item.getComponent(ItemPrizeUIInviteFriend).SetUp(i, data[i], numPrizeReceiveNow);
        }
        this._wasInit = true;
    }
}


