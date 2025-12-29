import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, Vec3 } from 'cc';
import { IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { ItemPrizeUIWin } from './ItemPrizeUIWin';
const { ccclass, property } = _decorator;

@ccclass('ListPrizeUIWin')
export class ListPrizeUIWin extends Component {
    @property(Prefab) pfItemWin: Prefab;
    @property(Prefab) pfItemLevelProgressWin: Prefab;
    public _listNItem: Node[] = [];
    private _nCoinItem: Node = null;

    public SetUp(listIPrize: IPrize[], numPrizeCarLevelProgress: number = 0) {
        // normal prizes
        listIPrize.forEach(dataPrize => {
            // init prize , not need pool in here because no show UIAgain
            let newPrize = instantiate(this.pfItemWin);
            newPrize.scale = Vec3.ZERO;
            newPrize.setParent(this.node);
            newPrize.getComponent(ItemPrizeUIWin).SetUp(dataPrize);
            this._listNItem.push(newPrize);

            //save n coin
            if (dataPrize.typePrize == TYPE_PRIZE.MONEY) {
                this._nCoinItem = newPrize;
            }
        })

        // init prize levelProgress
        if (numPrizeCarLevelProgress > 0) {
            let newPrizeLevelProgress = instantiate(this.pfItemLevelProgressWin);
            newPrizeLevelProgress.scale = Vec3.ZERO;
            newPrizeLevelProgress.setParent(this.node);
            newPrizeLevelProgress.getComponent(ItemPrizeUIWin).SetUpLbPrize(numPrizeCarLevelProgress);
            this._listNItem.push(newPrizeLevelProgress);
        }
    }

    public InitItemEmpty(numPrize: number, sfItem: SpriteFrame, customScale: Vec3 = Vec3.ONE, trimImage: boolean = false) {
        let newPrize = instantiate(this.pfItemWin);
        newPrize.scale = Vec3.ZERO;
        newPrize.setParent(this.node);
        newPrize.getComponent(ItemPrizeUIWin).SetUpLbPrize(numPrize);
        newPrize.getComponent(ItemPrizeUIWin).SetUpSpriteFrame(sfItem);
        newPrize.getComponent(ItemPrizeUIWin).SetUpScaleSp(customScale);
        newPrize.getComponent(ItemPrizeUIWin).spPrize.trim = trimImage;
        this._listNItem.push(newPrize);
    }

    public PlayAnimItems(timeAnim: number) {
        this._listNItem.forEach(item => {
            item.getComponent(ItemPrizeUIWin).PlayAnimSkeLight(timeAnim);
        })
    }

    //==========================================
    //#region x2Coin
    public async Anim_IncreaseCoinReward_ExceptX2(timeIncreaseText: number) {
        // get nCoin
        const nCoin = this._nCoinItem;
        await nCoin.getComponent(ItemPrizeUIWin).PlayAnimDoubleValue(timeIncreaseText);
    }
    //#endregion x2Coin
    //==========================================
}


