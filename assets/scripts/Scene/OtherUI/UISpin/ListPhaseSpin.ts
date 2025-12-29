import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { ItemUIPhaseSpin } from './ItemUIPhaseSpin';
import { IInfoPrizeSpin, IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
const { ccclass, property } = _decorator;

@ccclass('ListPhaseSpin')
export class ListPhaseSpin extends Component {

    @property(ItemUIPhaseSpin) listItemPhase: ItemUIPhaseSpin[] = [];
    @property(SpriteFrame) sfCoin: SpriteFrame;
    @property(SpriteFrame) sfBigCoin: SpriteFrame;
    @property(SpriteFrame) sfTicket: SpriteFrame;
    @property(SpriteFrame) sfClock: SpriteFrame;
    @property(SpriteFrame) sfHeli: SpriteFrame;
    @property(SpriteFrame) sfShuff: SpriteFrame;
    @property(SpriteFrame) sfSort: SpriteFrame;

    public listIInfoPrizeSpin: IInfoPrizeSpin[] = [];

    private GetSfSuitTypePrize(typePrize: TYPE_PRIZE) {
        switch (typePrize) {
            case TYPE_PRIZE.TICKET: return this.sfTicket;
            case TYPE_PRIZE.MONEY: return this.sfCoin;
            case TYPE_PRIZE.TIME: return this.sfClock;
            case TYPE_PRIZE.SORT: return this.sfSort;
            case TYPE_PRIZE.SHUFFLE: return this.sfShuff;
            case TYPE_PRIZE.VIP_SLOT: return this.sfHeli;
        }
    }

    private GetSpecialCoin() {
        return this.sfBigCoin;
    }

    public SetUpData() {
        let indexPrizeSpinToday: number = DataSpinSys.Instance.GetIndexPrizeSpeSlotSpinToday();
        this.listIInfoPrizeSpin = DataSpinSys.Instance.GetListPrizeToday(indexPrizeSpinToday);
        this.listIInfoPrizeSpin.forEach((prize: IInfoPrizeSpin, index: number) => {
            /**
             * ======================THIS IS CUSTOM SO MUST REMEMBER THIS LOGIC WHEN YOU CHANGE SOMETHING ABOUT SPIN======================
             * IT WILL AUTOMATICALLY UPDATE THE FIRST PRIZE IS A BIG COIN => CUSTOM IT => IF YOU CHANGE THE PRIZE MUST UPDATE THIS CODE BELOW
             */
            const prizeSet: IPrize = prize.listItem[0];
            this.SetPrizePhase(index, prizeSet);
            if (index == 0) {
                this.SetPrizeSpecialWay(0, prizeSet.typePrize == TYPE_PRIZE.MONEY);
            }
        })
    }

    public SetPrizePhase(index: number, infoPrize: IPrize) {
        this.listItemPhase[index].SetUpPrize(infoPrize, this.GetSfSuitTypePrize(infoPrize.typePrize));
    }

    public SetPrizeSpecialWay(index: number, isCoin: boolean) {
        const isUnlockSpecialPrize: boolean = DataSpinSys.Instance.IsSpecialPrizeUnlock();
        this.listItemPhase[index].SetUpSpecialPrize(isUnlockSpecialPrize, isCoin ? this.sfBigCoin : null);
    }

    public UpdateSpecialUIItem() {
        // update special item
        const itemUIPhase: ItemUIPhaseSpin = this.listItemPhase[0];
        const isSpecialPrizeUnlock: boolean = DataSpinSys.Instance.IsSpecialPrizeUnlock();
        itemUIPhase.SetUpSpecialPrize(isSpecialPrizeUnlock, null);
    }
}


