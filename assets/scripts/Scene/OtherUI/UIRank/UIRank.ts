import { _decorator, Component, Node, PageView, UIOpacity } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { EVENT_RANK_CHANGE_PAGE, EVENT_RANK_TURN_OFF_BLOCK_UI, EVENT_RANK_TURN_ON_BLOCK_UI, PAGE_VIEW_RANK } from './TypeRank';
import { PageView_UIRank } from './PageView_UIRank';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UIRank')
export class UIRank extends UIBaseSys {
    @property(Node) blockView: Node;
    @property(PageView_UIRank) pageViewUIRank: PageView_UIRank = null;

    protected onLoad(): void {
        clientEvent.on(EVENT_RANK_TURN_ON_BLOCK_UI, this.TunrOnBlock, this);
        clientEvent.on(EVENT_RANK_TURN_OFF_BLOCK_UI, this.TurnOffBlock, this);
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_RANK_TURN_ON_BLOCK_UI, this.TunrOnBlock, this);
        clientEvent.off(EVENT_RANK_TURN_OFF_BLOCK_UI, this.TurnOffBlock, this);
    }

    private TunrOnBlock() {
        this.blockView.active = true;
    }

    private TurnOffBlock() {
        this.blockView.active = false;
    }

    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIRank");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_RANK, 1);
    }
}


