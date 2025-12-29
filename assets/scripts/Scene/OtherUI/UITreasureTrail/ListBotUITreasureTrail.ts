/**
 * 
 * anhngoxitin01
 * Mon Aug 18 2025 09:12:55 GMT+0700 (Indochina Time)
 * ListBotUITreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/ListBotUITreasureTrail.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, SpriteFrame, Vec3 } from 'cc';
import { PoolLobbySys } from '../../LobbyScene/PoolLobbySys';
import { InfoBot_TreasureTrail } from '../../../Utils/Types';
import { AvatarTT } from '../UITreasureTrailPrepare/AvatarTT';
import { CONFIG_TT } from './TypeTreasureTrail';
import { MPoolSys } from '../../../Utils/MPoolSys';
import { PoolGameSys } from '../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;
const KEY_POOL_BOT = "KEY_POOL_BOT";

@ccclass('ListBotUITreasureTrail')
export class ListBotUITreasureTrail extends Component {
    @property(Prefab) pfBotTreasureTrail: Prefab;
    @property(SpriteFrame) sfAvatarPlayer: SpriteFrame;
    @property(SpriteFrame) sfAvatarBot: SpriteFrame;
    private _listBot: Node[] = [];

    private readonly SCALE_BOT: Vec3 = Vec3.ONE.clone().multiplyScalar(0.7);

    private _poolChoice: MPoolSys = null;

    //==========================================
    //#region base
    protected onEnable(): void {
        if (this._poolChoice == null) {
            // register pool
            const newPool = new Pool(() => instantiate(this.pfBotTreasureTrail), 0);
            switch (true) {
                case PoolLobbySys.Instance != null:
                    this._poolChoice = PoolLobbySys.Instance;
                    break;
                case PoolGameSys.Instance != null:
                    this._poolChoice = PoolGameSys.Instance;
                    break;
            }
            this._poolChoice.RegisterPool(KEY_POOL_BOT, newPool);
        }
    }
    //#endregion base
    //==========================================F

    //==========================================
    //#region private
    private InitBot(): Node {
        const nBot: Node = this._poolChoice.GetItemFromPool(KEY_POOL_BOT);
        return nBot;
    }

    private InitBots(maxBot: number) {
        const numBotNow = this._listBot.length;
        for (let i = numBotNow; i < maxBot; i++) {
            // init bot và add vào list
            let bot = this.InitBot();
            bot.setParent(this.node);
            this._listBot.push(bot);
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUpData(listInfoBot: InfoBot_TreasureTrail[]) {
        const maxBotShow: number = listInfoBot.length > CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI ? CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI : listInfoBot.length;

        this.InitBots(maxBotShow);

        let listPosBot: Vec3[] = sunflowerPointsInEllipse(50, 20, maxBotShow);
        // sort list từ cao xuống thấp
        listPosBot = listPosBot.sort((a, b) => b.y - a.y);

        for (let index = 0; index < maxBotShow; index++) {
            const nBot = this._listBot[index];
            const dataBot = listInfoBot[maxBotShow - 1 - index];
            let sfAvatar = null;
            sfAvatar = (dataBot.id == CONFIG_TT.ID_PLAYER ? this.sfAvatarPlayer : this.sfAvatarBot);
            nBot.getComponent(AvatarTT).SetUp(sfAvatar, dataBot.avatar);
            nBot.scale = this.SCALE_BOT;

            nBot.position = listPosBot[index];
            nBot.active = true;
        }
    }

    public GetListBotShowing(): Node[] {
        return this._listBot;
    }

    public ReUseListBots(numBot: number) {
        let listBotReuse = this._listBot.splice(0, numBot);
        listBotReuse.forEach(bot => {
            bot.active = false;
            this._poolChoice.PoolItem(bot, KEY_POOL_BOT);
        })
    }
    //#endregion public
    //==========================================
}

/**
 * Generates N evenly distributed random points within an ellipse using the sunflower algorithm.
 * @param radiusX The horizontal radius of the ellipse.
 * @param radiusY The vertical radius of the ellipse.
 * @param count The number of points to generate.
 * @returns An array of Vec3 positions.
 */
function sunflowerPointsInEllipse(radiusX: number, radiusY: number, count: number): Vec3[] {
    const points: Vec3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const r = Math.sqrt(i + 0.5) / Math.sqrt(count);
        const theta = i * goldenAngle;
        const x = radiusX * r * Math.cos(theta);
        const y = radiusY * r * Math.sin(theta);
        points.push(new Vec3(x, y, 0));
    }
    return points;
}