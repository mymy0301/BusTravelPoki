import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('PlayerTopUIRankTournament')
export class PlayerTopUIRankTournament extends Component {
    @property(Sprite) spAvatar: Sprite;
    @property(Label) lbNamePlayer: Label;
    @property(Label) lbScorePlayer: Label;
    private _pathAvatar: string = null;
    @property(SpriteFrame) sfAvatarDefault: SpriteFrame = null;

    // private readonly color

    //#region Set up
    public SetUp(dataPlayerLeaderboard: IDataPlayer_LEADERBOARD) {
        // console.log("dataPlayerLeaderboard", dataPlayerLeaderboard);
        this._pathAvatar = dataPlayerLeaderboard.avatar;
        this.lbNamePlayer.string = dataPlayerLeaderboard.name;
        this.lbScorePlayer.string = dataPlayerLeaderboard.score == 0 ? `???` : Utils.convertTimeToFormat(-dataPlayerLeaderboard.score);

        this.LoadAvatar();
    }

    private LoadAvatar() {
        let self = this;
        this.spAvatar.spriteFrame = this.sfAvatarDefault;
        try {
            ResourceUtils.TryLoadImage(this._pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == self._pathAvatar && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }
    }

    public Hide() {
        this.node.active = false;
    }
    //#endregion Set up
}


