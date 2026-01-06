/**
 * 
 * dinhquangvinhdev
 * Mon Aug 11 2025 15:19:01 GMT+0700 (Indochina Time)
 * LayerPlayerTTPrepare
 * db://assets/scripts/Scene/OtherUI/UITreasureTrailPrepare/LayerPlayerTTPrepare.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, SpriteFrame, Vec3 } from 'cc';
import { AvatarTT } from './AvatarTT';
import { Utils } from '../../../Utils/Utils';
import { InfoBot_TreasureTrail } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

const LIST_POS_AVATAR_UI_TREASURE_TRAIL_PREPARE = [
    new Vec3(-9.467, 43.28, 0),
    new Vec3(-55.028, 7.75, 0),
    new Vec3(49.26, 7.06, 0),
    new Vec3(-9.537, -7.1, 0),
    new Vec3(-84.511, -14.179, 0),
    new Vec3(80.788, -18.604, 0),
    new Vec3(29.265, -34.976, 0),
    new Vec3(-127.129, -51.348, 0),
    new Vec3(-38.381, -48.693, 0),
    new Vec3(125.839, -51.79, 0),
    new Vec3(49.343, -72.587, 0),
    new Vec3(-69.881, -76.127, 0),
    new Vec3(-9.322, -122.414, 0),
]

@ccclass('LayerPlayerTTPrepare')
export class LayerPlayerTTPrepare extends Component {
    @property(Prefab) pfAvatar: Prefab;
    @property(Node) nPoolAvatar: Node;
    @property(SpriteFrame) sfBgAvatar_gold: SpriteFrame;
    @property(SpriteFrame) sfBgAvatar_red: SpriteFrame;
    private _poolAvatar: Pool<Node> = null;
    public numPlayer: number = LIST_POS_AVATAR_UI_TREASURE_TRAIL_PREPARE.length;
    private _listBot: Node[] = [];

    private readonly SCALE_BOT: Vec3 = Vec3.ONE.clone().multiplyScalar(0.78);
    private readonly SCALE_PLAYER: Vec3 = Vec3.ONE;

    //==========================================
    //#region base
    protected onLoad(): void {
        this._poolAvatar = new Pool(() => instantiate(this.pfAvatar), 0);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private ReUseBot(nBot: Node) {
        nBot.active = false;
        this._poolAvatar.free(nBot);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public async PlayAnim(listInfoBot: InfoBot_TreasureTrail[]) {

        const timeDelayEachShowAva: number = 0.15;

        for (let index = 0; index < this.numPlayer; index++) {
            const posSet = LIST_POS_AVATAR_UI_TREASURE_TRAIL_PREPARE[index];
            //gen bot
            let nAvatarPlayer: Node = this._poolAvatar.alloc();
            this._listBot.push(nAvatarPlayer);
            const avaCom = nAvatarPlayer.getComponent(AvatarTT);
            const pathBot = listInfoBot[LIST_POS_AVATAR_UI_TREASURE_TRAIL_PREPARE.length - 1 - index].avatar;
            // avaCom.SetUp(((index == this.numPlayer - 1) ? this.sfBgAvatar_gold : this.sfBgAvatar_red), pathBot);
            //Tất cả đều là bot
            avaCom.SetUp(this.sfBgAvatar_red, pathBot);
            nAvatarPlayer.parent = this.node;
            nAvatarPlayer.position = posSet;
            if (index == this.numPlayer - 1) {
                await avaCom.AnimShow(this.SCALE_PLAYER);
            } else {
                avaCom.AnimShow(this.SCALE_BOT);
                await Utils.delay(timeDelayEachShowAva * 1000);
            }
        }
    }

    public ReUseAllBots() {
        this._listBot.forEach(bot => this.ReUseBot(bot));
    }
    //#endregion public
    //==========================================
}