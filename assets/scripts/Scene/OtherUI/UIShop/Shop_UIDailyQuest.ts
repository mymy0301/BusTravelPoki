import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { IInfoJsonDailyQuest } from '../../../Utils/Types';
import { DataDailyQuestSys } from '../../../DataBase/DataDailyQuestSys';
import { Shop_ItemDailyQuest } from './Shop_ItemDailyQuest';
const { ccclass, property } = _decorator;

@ccclass('Shop_UIDailyQuest')
export class Shop_UIDailyQuest extends Component {
    @property(Prefab) pfItemDailyQuest: Prefab = null;
    @property(Prefab) pfItemDailyQuestTut: Prefab = null;
    @property(Node) nLayout: Node;

    public InitItems() {
        const listDailyQuestToday: IInfoJsonDailyQuest[] = DataDailyQuestSys.Instance.GetListInfoItemDailyQuest();

        // init daily challenge tut
        let nItemDailyQuestTut: Node = instantiate(this.pfItemDailyQuestTut);
        nItemDailyQuestTut.parent = this.nLayout;

        // init daily challenge
        for (let i = 0; i < listDailyQuestToday.length; i++) {
            const dataDailyQuest: IInfoJsonDailyQuest = listDailyQuestToday[i];
            let item = instantiate(this.pfItemDailyQuest);
            item.parent = this.nLayout;
            item.getComponent(Shop_ItemDailyQuest).SetUp(dataDailyQuest);
        }
    }
}


