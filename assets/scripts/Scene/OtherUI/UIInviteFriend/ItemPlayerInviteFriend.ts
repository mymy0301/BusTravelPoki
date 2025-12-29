import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('ItemPlayerInviteFriend')
export class ItemPlayerInviteFriend extends Component {
    @property(Sprite) spAvatar: Sprite;
    private _pathAvatar: string = null;

    public SetUp(dataPlayer: IDataPlayer_LEADERBOARD) {
        this._pathAvatar = dataPlayer.avatar;
        this.LoadAvatar();
    }

    private LoadAvatar() {
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
}


