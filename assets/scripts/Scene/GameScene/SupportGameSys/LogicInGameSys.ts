import { _decorator, Component, Node } from 'cc';
import { GameSoundEffect, IPopUpBuyItemInGame, M_COLOR, STATE_CAR, STATE_GAME, STATE_PARKING_CAR, TYPE_ITEM, TYPE_LOSE_GAME } from '../../../Utils/Types';
import { CheatingSys } from '../../CheatingSys';
import { DataItemSys } from '../../DataItemSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { LogicItemInGame } from '../Logic/ItemInGame/LogicItemInGame';
import { ListParkingCarSys } from '../Logic/ListParkingCarSys';
import { GroundCarSys } from '../Logic/GroundCarSys';
import { CarSys } from '../Logic/CarSys';
import { ListPassengerSys } from '../Logic/ListPassengerSys';
import { PassengerSys } from '../Logic/PassengerSys';
import { UIReceiveCoinPassenger } from '../OtherUI/UIReceiveCoinPassenger/UIReceiveCoinPassenger';
import * as i18n from 'db://i18n/LanguageData';
import { LogicCarMovingSys } from './LogicCarMovingSys';
import { PasssengerCanJoinAnyCar } from '../../../Hint/HintSys';
import { GameManager } from '../../GameManager';
import { IntroBoosterLevel } from '../Tutorials/IntroBoosterLevel';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { LEVEL_TUT_IN_GAME } from '../../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { SoundSys } from '../../../Common/SoundSys';
import { M_ERROR } from '../../../Configs/MConfigError';
const { ccclass, property } = _decorator;

@ccclass('LogicInGameSys')
export class LogicInGameSys extends Component {
    @property(LogicItemInGame) logicItemInGame: LogicItemInGame;
    @property(ListParkingCarSys) listParkingCarSys: ListParkingCarSys;
    @property(GroundCarSys) groundCarSys: GroundCarSys;
    @property(ListPassengerSys) listPassengerSys: ListPassengerSys;
    @property(UIReceiveCoinPassenger) uiReceiveCoinPassenger: UIReceiveCoinPassenger;

    private _cbChangeStateGame: CallableFunction = null;
    private _cbGetState: CallableFunction = null;

    public SetUpCb(cbChangeStateGame: CallableFunction, cbGetState: CallableFunction) {
        this._cbChangeStateGame = cbChangeStateGame;
        this._cbGetState = cbGetState;
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.READY_TO_PICK_UP_PASSENGER_CAR, this.CallPickUpPassengerWhenHadNewCar, this);
        clientEvent.on(MConst.EVENT.USE_ITEM_WHEN_BUY_SUCCESS, this.UseItemWhenBuySuccess, this);
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE, this.CheckCanUseBtnShuffle, this);
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_VIP, this.CheckCanUseBtnVipSlot, this);

        clientEvent.on(MConst.EVENT_PARKING.REVIVE_SUCCESS, this.ReviveSuccess, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.READY_TO_PICK_UP_PASSENGER_CAR, this.CallPickUpPassengerWhenHadNewCar, this);
        clientEvent.off(MConst.EVENT.USE_ITEM_WHEN_BUY_SUCCESS, this.UseItemWhenBuySuccess, this);
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE, this.CheckCanUseBtnShuffle, this);
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_VIP, this.CheckCanUseBtnVipSlot, this);

        clientEvent.off(MConst.EVENT_PARKING.REVIVE_SUCCESS, this.ReviveSuccess, this);
    }

    public ResetData() {
        // passenger
        this.queueCallPickUpPassenger = [];
        this._isPassengerMoving = false;
        this.countAnim = 0;
        this.logicItemInGame.ResetData();
        this.uiReceiveCoinPassenger.ResetUICoin();
    }
    //#endregion func SetUp

    //#region func listener
    private UseItemWhenBuySuccess(typeItemUse: TYPE_ITEM) {
        switch (typeItemUse) {
            case TYPE_ITEM.SHUFFLE: this.btnShuffle(null, null, false); break;
            case TYPE_ITEM.SORT: this.btnSort(null, null, false); break;
            case TYPE_ITEM.VIP_SLOT: this.btnVipSlot(null, null, false); break;
        }
    }

    private CheckCanUseBtnShuffle() {
        if (!this.HasAnyCarCanShuffle()) {
            this.logicItemInGame.CanNotUseShuffleAnyMore();
        } else {
            this.logicItemInGame.CanUseShuffle();
        }
    }

    private CheckCanUseBtnVipSlot() {
        const hasBelt = this.groundCarSys.HasAnyBelt();
        const listCarReadyToMoveOnBelt = this.groundCarSys.GetListNCarByListStateOfAllBelts([STATE_CAR.READY_TO_MOVE])?.get(STATE_CAR.READY_TO_MOVE)
        const hasAnyCarCanVip = this.groundCarSys.HasAnyCarCanVip();

        if (hasAnyCarCanVip && (!hasBelt || (hasBelt && listCarReadyToMoveOnBelt.length > 0))) {
            this.logicItemInGame.CanUseVipSlot();
        } else {
            this.logicItemInGame.CanNotUseVipSlotAnyMore();
        }
    }
    //#endregion func listener

    // #region func Booster
    private CheckDataBeforeUseItem(typeItem: TYPE_ITEM, isAutoDecreaseItem: boolean = true): boolean {

        if (this._cbGetState() != STATE_GAME.PLAYING) {
            return false;
        }

        if (GameManager.Instance == null) { return true; }

        let levelPlayerCheck = 0;
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                levelPlayerCheck = GameManager.Instance.levelPlayerNow;
                break;
            case TYPE_GAME.TOURNAMENT: case TYPE_GAME.WITH_FRIEND: case TYPE_GAME.CHRISTMAS:
                levelPlayerCheck = 999;
                break;
        }
        switch (true) {
            case typeItem == TYPE_ITEM.SHUFFLE && levelPlayerCheck < LEVEL_TUT_IN_GAME.SHUFFLE: return false;
            case typeItem == TYPE_ITEM.SORT && levelPlayerCheck < LEVEL_TUT_IN_GAME.SORT: return false;
            case typeItem == TYPE_ITEM.VIP_SLOT && levelPlayerCheck < LEVEL_TUT_IN_GAME.VIP_SLOT: return false;
        }

        if (CheatingSys.Instance == null || CheatingSys.Instance.isCheatingItemInGame) {
            return true;
        }

        // check item can use or not
        if (DataItemSys.Instance.GetNumItem(typeItem) <= 0) {
            this._cbChangeStateGame(STATE_GAME.PAUSE);
            // show popUp to watch ads
            let jsonCustomUI: IPopUpBuyItemInGame = {
                typeItemBuy: typeItem
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_BUY_ITEM, 1, true, jsonCustomUI);
            return false;
        }

        return true;
    }

    public btnVipSlot(event: any, customEventData: string, isSoundClick: boolean = true) {

        LogEventManager.Instance.logButtonClick("vip_slot", "game");

        // check is carMoving or not
        if (LogicCarMovingSys.Instance.IsHasCarMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Wait car moving done"));
            return;
        }

        // check have any car wait to move to the park any more
        const listCarInBelt = this.groundCarSys.GetListNCarByListStateOfAllBelts([STATE_CAR.READY_TO_MOVE]).get(STATE_CAR.READY_TO_MOVE);
        if (this.groundCarSys.GetCarByState(STATE_CAR.READY_TO_MOVE) == null
            && (listCarInBelt == null || listCarInBelt.length == 0)) {
            return;
        }

        // check dataItem before use
        if (!this.CheckDataBeforeUseItem(TYPE_ITEM.VIP_SLOT, false)) {
            return;
        }


        // logic check before using btn vip slot
        // - Not using other item
        // - And have slot Vip can Use
        if (this.logicItemInGame.GetItemTypeUsing() == null && this.listParkingCarSys.GetNParkingCarByStateParking(STATE_PARKING_CAR.LOCK_VIP) != null) {
            if (isSoundClick) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_USE_BOOSTER);
            }
            //show shadow
            this.groundCarSys.MoveAllCarToGround2WhenUsedVip();
            clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.SHOW);
            clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.SHOW_POP_UP_VIP_SPACE);
            clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.HIDE_UI_GAME);
            clientEvent.dispatchEvent(MConst.EVENT_VIP_PARKING.OPEN);
            this.logicItemInGame.UseItem(TYPE_ITEM.VIP_SLOT);
        }
    }

    public async btnShuffle(event: any, customEventData: string, isSoundClick: boolean = true) {
        LogEventManager.Instance.logButtonClick("shuffle", "game");


        if (this.logicItemInGame._cantUseShuffleAnyMore) {
            // notification can not use Shuffle
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Not enough compatible buses!"))
            return;
        }

        // check is carMoving or not
        if (LogicCarMovingSys.Instance.IsHasCarMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Wait car moving done"));
            return;
        }

        // check have any car wait to move to the park any more
        if (this.groundCarSys.GetCarByState(STATE_CAR.READY_TO_MOVE) == null) {
            return;
        }

        // check have any car wait to move to the park any more
        const listCarState = this.groundCarSys.GetListNCarByState(STATE_CAR.READY_TO_MOVE);
        if (listCarState == null) {
            return;
        }

        // check dataItem before use
        if (!this.CheckDataBeforeUseItem(TYPE_ITEM.SHUFFLE, false)) {
            return;
        }

        // logic check before using btn shuffle
        // - Not using other item
        let doneEffect: boolean = false;
        const timeWaitAnimEff = 1.2;
        const timeDelayAfterAnim = 0.2;
        if (this.logicItemInGame.GetItemTypeUsing() == null && this.HasAnyCarCanShuffle()) {
            if (isSoundClick) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_USE_BOOSTER);
            }
            SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_BOOSTER_SHUFFLE, 1, 0.5);
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            await this.logicItemInGame.UseItem(TYPE_ITEM.SHUFFLE);
            clientEvent.dispatchEvent(MConst.EVENT.PLAY_ANIM_SHUFFLE, async () => {
                await Utils.delay(timeDelayAfterAnim * 1000);
                doneEffect = true;
            });
            await Promise.all([
                Utils.WaitReceivingDone(() => doneEffect),
                new Promise<void>(async resolve => {
                    await Utils.delay(timeWaitAnimEff * 1000)
                    await this.groundCarSys.ShuffleColorCarInGround_2()
                    resolve();
                })
            ]);
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
            clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, TYPE_ITEM.SHUFFLE);
        }
    }

    public async btnSort(event: any, customEventData: string, isSoundClick: boolean = true) {
        LogEventManager.Instance.logButtonClick("sort", "game");

        // check is carMoving or not
        if (LogicCarMovingSys.Instance.IsHasCarMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Wait car moving done"));
            return;
        }

        // check dataItem before use
        if (!this.CheckDataBeforeUseItem(TYPE_ITEM.SORT, false)) {
            return;
        }

        // logic check before using btn sort
        // - Not using other item
        // - and has at least a car in the parking
        // - passenger not go up the car
        const isHasCarUsingNormal: boolean = this.listParkingCarSys.GetNParkingCarByStateParking(STATE_PARKING_CAR.USING) != null;
        const isHasCarUsingVip: boolean = this.listParkingCarSys.GetNParkingCarByStateParking(STATE_PARKING_CAR.USING_VIP) != null;
        if (!isHasCarUsingVip && !isHasCarUsingNormal) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Please parking a car!"));
            return;
        }

        if (this._isPassengerMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Passenger is moving, please wait!"));
            return;
        }

        const isHadCarMoving: boolean = this.groundCarSys.GetCarByState(STATE_CAR.MOVING) != null;
        if (isHadCarMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Wait car moving done"));
            return;
        }

        const isHasCarCanSort: boolean = this.listParkingCarSys.GetListNCarParkingCanSort().length > 0;
        if (!isHasCarCanSort) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, "No valid target");
            return;
        }

        if (this.logicItemInGame.GetItemTypeUsing() == null) {
            if (isSoundClick) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_USE_BOOSTER);
            }
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_SORT);
            await this.logicItemInGame.UseItem(TYPE_ITEM.SORT);
            // logic get list car Parking then sort the passenger stading suit with list car send

            const listCarAreParking: Node[] = this.listParkingCarSys.GetListNCarParkingCanSort();

            // prioritize car vip
            let listMColor: M_COLOR[] = [];
            listCarAreParking.forEach((nCar: Node) => {
                let numPassengerCarNeedToMoveOn: number = nCar.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
                let colorCar: M_COLOR = nCar.getComponent(CarSys).InfoCar.colorByMColor;
                listMColor.push(...new Array(numPassengerCarNeedToMoveOn).fill(colorCar));
            });

            // listCarAreParkingNormal.forEach((nCar: Node) => {
            //     let numPassengerCarNeedToMoveOn: number = nCar.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
            //     let colorCar: M_COLOR = nCar.getComponent(CarSys).InfoCar.colorByMColor;
            //     listMColor.push(...new Array(numPassengerCarNeedToMoveOn).fill(colorCar));
            // });

            // emit call play anim in here
            clientEvent.dispatchEvent(MConst.EVENT.PASSENGER_BACK_WARD
                , async () => {
                    //=======================================================================
                    //====================== cb when anim backward done =====================
                    //=======================================================================

                    // sort the passenger standing suit with list car send
                    await this.listPassengerSys.SortPassenger(listMColor);
                }
                , () => {
                    //=======================================================================
                    //====================== cb when all anim done ==========================
                    //=======================================================================
                    // console.error("Hide Block Sort");

                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                    clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, TYPE_ITEM.SORT);


                    // get id 0 car vip or car normal 
                    let nCarVip: Node = listCarAreParking[0];
                    this.CallPickUpPassengerWhenHadNewCar();
                });
        }
    }
    //#endregion func btn

    async ReviveSuccess(isSoundClick: boolean = true) {
        if (this.logicItemInGame.GetItemTypeUsing() == null) {
            if (isSoundClick) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_USE_BOOSTER);
            }
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_SORT);
            await this.logicItemInGame.UseItem(TYPE_ITEM.SORT);
            // logic get list car Parking then sort the passenger stading suit with list car send

            const listCarAreParking: Node[] = this.listParkingCarSys.GetListNCarParkingCanSort();

            // prioritize car vip
            let listMColor: M_COLOR[] = [];
            listCarAreParking.forEach((nCar: Node) => {
                let numPassengerCarNeedToMoveOn: number = nCar.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
                let colorCar: M_COLOR = nCar.getComponent(CarSys).InfoCar.colorByMColor;
                listMColor.push(...new Array(numPassengerCarNeedToMoveOn).fill(colorCar));
            });

            // listCarAreParkingNormal.forEach((nCar: Node) => {
            //     let numPassengerCarNeedToMoveOn: number = nCar.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
            //     let colorCar: M_COLOR = nCar.getComponent(CarSys).InfoCar.colorByMColor;
            //     listMColor.push(...new Array(numPassengerCarNeedToMoveOn).fill(colorCar));
            // });

            // emit call play anim in here
            clientEvent.dispatchEvent(MConst.EVENT.PASSENGER_BACK_WARD
                , async () => {
                    //=======================================================================
                    //====================== cb when anim backward done =====================
                    //=======================================================================

                    // sort the passenger standing suit with list car send
                    await this.listPassengerSys.SortPassenger(listMColor);
                }
                , () => {
                    //=======================================================================
                    //====================== cb when all anim done ==========================
                    //=======================================================================
                    // console.error("Hide Block Sort");

                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                    clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, TYPE_ITEM.SORT);

                    // clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);

                    // get id 0 car vip or car normal 
                    let nCarVip: Node = listCarAreParking[0];
                    this.CallPickUpPassengerWhenHadNewCar();
                });
        }
    }

    //#region func game
    private HasAnyCarCanShuffle(): boolean {
        const isHaveCarCanChangeColor: boolean = this.groundCarSys.CheckHaveCarCanChangeColor();
        return isHaveCarCanChangeColor;
    }


    private queueCallPickUpPassenger: boolean[] = [];
    private countAnim: number = 0;
    private _isPassengerMoving: boolean = false;
    /**
     * Func này sẽ được gọi khi có xe mới đỗ vào bến
     * hoặc khi resume game
     */
    public CallPickUpPassengerWhenHadNewCar() {
        this.queueCallPickUpPassenger.push(true);
        if (this._cbGetState() == STATE_GAME.PLAYING) {
            this.PickUpPassenger();
        }
    }
    private async PickUpPassenger(callAfterVisual: boolean = false) {
        const self = this;
        function CheckCanPickUpAgain() {
            self.queueCallPickUpPassenger.pop();
            if (self.queueCallPickUpPassenger.length == 0) {
                self._isPassengerMoving = false;
                // check lose game 
                self.CheckLoseGame();
                // reset time double passenger
                self.listPassengerSys.ResetTimeDoublePass();
            } else {
                self.PickUpPassenger(true);
            }
        }



        //========================================================
        //========================================================
        //========================================================

        // register clock passenger
        this.listPassengerSys.RegisterCbClockTime();

        const mapPassengerCanPickUp: Map<number, Node> = this.listPassengerSys.GetAllPassengerCanPickUp();
        const arrayIdLineUpCanPickUp: number[] = Array.from(mapPassengerCanPickUp.keys());
        const listCarCanPickUp: Node[] = Array.from(this.listParkingCarSys.GetListNCarParking());

        let wasPickedUp: boolean = false;
        for (let i = 0; i < listCarCanPickUp.length; i++) {
            if (listCarCanPickUp[i] == null) { continue; }
            const nCar: Node = listCarCanPickUp[i];
            const carCheck: CarSys = nCar.getComponent(CarSys);
            const colorCarCheck = carCheck.InfoCar.color;
            for (let indexIdLineUp = 0; indexIdLineUp < arrayIdLineUpCanPickUp.length; indexIdLineUp++) {
                const idLineUpCheck = arrayIdLineUpCanPickUp[indexIdLineUp];
                const colorPassengerCheck = mapPassengerCanPickUp.get(idLineUpCheck).getComponent(PassengerSys).infoPassenger.color;

                if (colorCarCheck == colorPassengerCheck && !carCheck.InfoCar.IsFullSlot()) {
                    wasPickedUp = true;
                    // call car add passenger
                    carCheck.InfoCar.AddPassenger();
                    // call lineUp pass passenger
                    (async () => {
                        try {
                            this._isPassengerMoving = true;
                            this.countAnim += 1;
                            const idCar: number = carCheck.InfoCar.idCar;

                            await this.listPassengerSys.MoveTopPassengerToCar(carCheck.node.worldPosition.clone());

                            carCheck.visualCarSys.AddMorePassengerInCar();
                            // you can add the code line add more passengerInCar
                            await carCheck.EffCarSys.PlayEfPassengerMoveOn(idCar, () => {
                                if (this.countAnim <= 0) {
                                    return;
                                }
                                this.countAnim -= 1;
                            });
                            carCheck.TryEmitFullSlot();

                            if (this.countAnim == 0) {
                                CheckCanPickUpAgain();
                            }
                        } catch (e) {
                            console.error(M_ERROR.ERROR_CAR_WHEN_RESET);
                        }
                    })();

                    await this.listPassengerSys.MoveTheCrewForward();

                    // i want to await time move passenger to nextPlace
                    // await Utils.delay(MConfigs.DISTANCE_PASS_WAIT_TO_MOVE_ON_CAR / MConfigs.GET_VEC_PASSENGER_WAIT * 1000);

                    // =============== You can increase the speed in here ==============
                    this.listPassengerSys.TryCanDoubleSpeedPass();

                    break;
                }
            }

            // if find the car for passenger => break
            if (wasPickedUp) {
                break;
            }
        }

        // ========================= check in case call when logic done =====================
        if (wasPickedUp == true) {
            this.PickUpPassenger();
        }

        if (!callAfterVisual && !wasPickedUp && !this._isPassengerMoving) {
            // case car move in when no anim moving passenger
            CheckCanPickUpAgain();
        }

        // ========================= check in case call after visual done ===================
        if (callAfterVisual && !wasPickedUp) {
            CheckCanPickUpAgain();
        }
    }


    /**
    * Hàm này chỉ được gọi khi xe đỗ vào bến và không có người di chuyển lên xe
    * Hoặc khi người di chuyển lên xe xong rùi 
    * Hoặc mỗi khi người chơi resume game
    */
    public CheckLoseGame() {
        // const a = performance.now();
        // let b = 0;
        // console.log('CheckLoseGame');

        // console.log("========= CHECK LOGIC LOSE =================");

        // check lose game
        /** 
         * parking car luôn được đặt là using ngay sau khi người chơi click xe
         * xe chưa đỗ phần parking đã được chuyển sang trạng thái Using rùi
        */
        const resultNumParkingCarState = this.listParkingCarSys.GetListNParkingCarByListState([STATE_PARKING_CAR.USING, STATE_PARKING_CAR.USING_VIP, STATE_PARKING_CAR.EMPTY]);
        const numParkingCarUsing: number = resultNumParkingCarState.get(STATE_PARKING_CAR.USING).length;
        const numParkingCarVipUsing: number = resultNumParkingCarState.get(STATE_PARKING_CAR.USING_VIP).length;
        const numParkingCarEmpty: number = resultNumParkingCarState.get(STATE_PARKING_CAR.EMPTY).length;
        const numParkingCar: number = this.listParkingCarSys.GetListNCarParking().length;


        /**
         * Xe chỉ được chuyển sang trạng thái ready to pick up passenger nếu như xe đến bến đỗ
         */
        const resultListNCarByState = this.groundCarSys.GetListNCarByListState([STATE_CAR.READY_TO_PICK_UP_PASSENGER, STATE_CAR.READY_TO_DEPART]);
        const resultListNCarByStateOfBelt = this.groundCarSys.GetListNCarByListStateOfAllBelts([STATE_CAR.READY_TO_PICK_UP_PASSENGER, STATE_CAR.READY_TO_DEPART])
        const listCarParking: Node[] = [...resultListNCarByState.get(STATE_CAR.READY_TO_PICK_UP_PASSENGER), ...resultListNCarByStateOfBelt.get(STATE_CAR.READY_TO_PICK_UP_PASSENGER)];

        const listCarReadyTransferPass: Node[] = [...resultListNCarByState.get(STATE_CAR.READY_TO_DEPART), ...resultListNCarByStateOfBelt.get(STATE_CAR.READY_TO_DEPART)];

        const isCarReadyDepart: boolean = listCarReadyTransferPass.length > 0 || listCarParking.find(car => car.getComponent(CarSys).InfoCar.IsFullSlot()) != null;

        const hasAnyPassengerIsMoving: boolean = this.listPassengerSys.IsMovingPassenger();

        // console.log("0000",
        //     listCarReadyTransferPass.length,
        //     listCarParking.find(car => car.getComponent(CarSys).InfoCar.IsFullSlot())
        // );


        // console.log("1111",
        //     numParkingCarEmpty,
        //     listCarParking.length,
        //     numParkingCarUsing + numParkingCarVipUsing,
        //     !isCarReadyDepart,
        //     !hasAnyPassengerIsMoving
        // );

        // const passengerCheck = this.listPassengerSys.GetFirstPassengerCanPickUp();
        // if (passengerCheck != null && !PasssengerCanJoinAnyCar(passengerCheck, listCarParking)) {
        //     console.log("Lose", passengerCheck.getComponent(PassengerSys).infoPassenger.color);
        //     console.log("List color car", listCarParking.map(car => car.getComponent(CarSys).InfoCar.color));
        // }

        /**
         * ===========================LOGIC check thua game==========================
         * CASE 1: Kiểm tra nếu như số chỗ còn có thể đỗ < không tính những ô trống chưa mở khóa> == 0
         * CASE 2: Kiểm tra nếu như số xe đã đỗ == chỗ đang được sử dụng <thường + vip>
         * CASE 3: Nếu ko có 1 xe nào đang đỗ có đủ người trong info 
         * CASE 4: Nếu ko có người nào đang di chuyển
         */
        if (numParkingCarEmpty == 0 && listCarParking.length == (numParkingCarUsing + numParkingCarVipUsing) && !isCarReadyDepart && !hasAnyPassengerIsMoving) {
            /**
            *  Thi thoảng vẫn có trường hợp bị lọt vào đây đó là khi xe vừa tới bến đỗ và người từ xe trước vừa kịp dừng lên xe => có thể gây ra lỗi bị lose
            *  Do đó ở đây chúng ta sẽ check xem người cuối cùng của hàng có thể lên xe readyToPickUpPassenger hay không
            *  Nếu không thì chắc chắn là thua
            *  Nếu có thì đó là bug => ta vẫn sẽ pass và ko xử thua
            */
            // Chỉ kiểm tra nếu như pass logic if trên để giảm thiểu vc check logic 
            // bởi dòng if check logic dưới sẽ chỉ hi hữu gặp
            const passengerCheck = this.listPassengerSys.GetFirstPassengerCanPickUp();
            // console.log("stateGame", this._cbGetState());

            // console.log("log pass can move on car", passengerCheck != null, !PasssengerCanJoinAnyCar(passengerCheck, listCarParking));

            if (passengerCheck != null && !PasssengerCanJoinAnyCar(passengerCheck, listCarParking)) {
                console.log("TYPE",this.logicItemInGame.GetItemTypeUsing() == null);
                if(this.logicItemInGame.GetItemTypeUsing() == null){
                    clientEvent.dispatchEvent(MConst.EVENT.LOSE_GAME, TYPE_LOSE_GAME.NO_MORE_MOVES);
                }
                
                // b = Number.parseFloat(performance.now().toString());
            }
        }
        // const c = performance.now();
        // console.warn('Lose in ' + (b - a));
        // console.warn('Not Lose in ' + (c - a));

        // console.log("========= CHECK LOGIC LOSE DONE =================");
    }
    //#endregion func game
}


