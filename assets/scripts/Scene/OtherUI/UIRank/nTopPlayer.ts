import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { IPrize } from '../../../Utils/Types';
import { EVENT_RANK_NOTI_FORCE_CLOSE, EVENT_RANK_NOTI_OPEN } from './TypeRank';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('nTopPlayer')
export class nTopPlayer extends Component {
    @property(Sprite) spAvatar: Sprite;
    @property(Label) lbNamePlayer: Label;
    @property(Node) nPrize: Node;
    private _dataItem: IDataPlayer_LEADERBOARD = null;
    private _pathAvatar: string = null;
    private _listPrize: IPrize[] = [];

    protected onDisable(): void {
        clientEvent.dispatchEvent(EVENT_RANK_NOTI_FORCE_CLOSE);
    }

    public SetUp(data: IDataPlayer_LEADERBOARD, prize: IPrize[]) {
        this._listPrize = prize;
        this._dataItem = data;
        this._pathAvatar = data.avatar;
        this.lbNamePlayer.string = data.name;

        this.LoadAvatar();
    }

    public SetUpEmptyPlayer(prize: IPrize[]) {
        this._listPrize = prize;
        this._pathAvatar = MConfigFacebook.Instance.playerPhotoURL;
        this.lbNamePlayer.string = MConfigFacebook.Instance.playerName;

        this.LoadAvatar();
    }

    public LoadAvatar() {
        let self = this;
        this.spAvatar.spriteFrame = null;
        try {
            ResourceUtils.TryLoadImage(this._pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._pathAvatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    private onClickPrize() {
        if (this._dataItem != null) {
            LogEventManager.Instance.logButtonClick(`prize_week`, "nTopPlayer");
            let typeBubble = TYPE_BUBBLE.TOP_MID;

            switch (this._dataItem.rank) {
                case 1: typeBubble = TYPE_BUBBLE.TOP_MID; break;
                case 2: typeBubble = TYPE_BUBBLE.TOP_LEFT; break;
                case 3: typeBubble = TYPE_BUBBLE.TOP_RIGHT; break;
            }

            const listPrize = Array.from(this._listPrize);
            const wPos = this.nPrize.worldPosition.clone();
            clientEvent.dispatchEvent(EVENT_RANK_NOTI_OPEN, listPrize, typeBubble, wPos);
        }
    }
}


