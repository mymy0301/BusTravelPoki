import { _decorator, Component, Enum, Node, Vec3 } from 'cc';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { CurrencySys } from '../../CurrencySys';
const { ccclass, property } = _decorator;

const join_follow = Enum({
    JOIN_GROUP: 0,
    FOLLOW_PAGE: 1
});

@ccclass('UISetting_join_follow')
export class UISetting_join_follow extends Component {
    @property(Node) nCoin: Node;
    @property({ type: join_follow }) type = join_follow.JOIN_GROUP;

    protected onEnable(): void {
        switch (this.type) {
            case join_follow.JOIN_GROUP:
                this.nCoin.active = !DataInfoPlayer.Instance.IsReceivePrizeJoinGroup();
                break;
            case join_follow.FOLLOW_PAGE:
                this.nCoin.active = !DataInfoPlayer.Instance.IsReceivePrizeFollowPage();
                break;
        }
    }

    private HidePrize(): void {
        this.nCoin.active = false;
    }

    public async AnimReceivePrize() {
        switch (this.type) {
            case join_follow.JOIN_GROUP:
                // add 1000 coin
                CurrencySys.Instance.AddMoney(1000, `UISetting_join_group`, false);
                DataInfoPlayer.Instance.ReceivePrizeJoinGroup_success();
                break;
            case join_follow.FOLLOW_PAGE:
                CurrencySys.Instance.AddMoney(1000, `UISetting_follow_page`, false);
                DataInfoPlayer.Instance.ReceivePrizeFollowPage_success();
                break;
        }

        this.HidePrize();
        const wPosRoot: Vec3 = this.nCoin.worldPosition.clone();
        await AniTweenSys.playAnimPopUpItemUpper(this.nCoin, wPosRoot, this.node);
    }
}


