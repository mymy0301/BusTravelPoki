import { _decorator, Component, director, instantiate, Node, Pool } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { GetMColorByNumber, JsonCar, JsonMapGame, JsonPassenger, M_COLOR, NAME_SUP_VI_CAR, STATE_CAR, STATE_GAME, STATE_PARKING_CAR, TYPE_ITEM, TYPE_LOSE_GAME, UI_END_GAME } from '../../Utils/Types';
import { GroundCarSys } from '../../Scene/GameScene/Logic/GroundCarSys';
import { ListParkingCarSys } from '../../Scene/GameScene/Logic/ListParkingCarSys';
import { ListPassengerSys } from '../../Scene/GameScene/Logic/ListPassengerSys';
import { GameInfoSys } from '../../Scene/GameScene/GameInfoSys';
import { Utils } from '../../Utils/Utils';
import { MConstBuildGame } from '../MConstBuildGame';
import { MConfigs } from '../../Configs/MConfigs';
import { TestUIGameSys } from './TestUIGameSys';
import { ReadMapJson } from '../../MJson/ReadMapJson';
import { EffectHelicopterSys } from '../../Scene/GameScene/Logic/Helicopter/EffectHelicopterSys';
import { LogicInGameSys } from '../../Scene/GameScene/SupportGameSys/LogicInGameSys';
import { AnimOpeningGame, TYPE_SHOW } from '../../Scene/GameScene/Logic/AnimOpeningGame/AnimOpeningGame';
import { HeaderInGameSys } from '../../Scene/GameScene/OtherUI/HeaderInGameSys';
import { UILoseTestGameSys } from './UILoseTestGameSys';
import { QueueCarCanMoveToGateSys } from '../../Scene/GameScene/Logic/QueueCarCanMoveToGateSys';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { LogicGenPassengerForBuild as LogicGenPassengerForTestBuild } from '../../Scene/GameScene/Logic/LogicGenPassenger';
import { PoolGameSys } from '../../Scene/LobbyScene/PoolGameSys';
import { MConfigBuildGame } from '../MConfigBuildGame';
const { ccclass, property } = _decorator;

@ccclass('TestGameSys')
export class TestGameSys extends Component {
    public static Instance: TestGameSys;

    @property(GroundCarSys) groundCarSys: GroundCarSys;
    @property(ListParkingCarSys) listParkingCarSys: ListParkingCarSys;
    @property(ListPassengerSys) listPassengerSys: ListPassengerSys;
    @property(LogicInGameSys) logicInGameSys: LogicInGameSys;
    @property(AnimOpeningGame) animOpeningGame: AnimOpeningGame;
    @property(HeaderInGameSys) headerInGameSys: HeaderInGameSys;

    @property(Node) nGate: Node;

    private _stateGame: STATE_GAME = STATE_GAME.PREPARE;

    private _isHasTime: boolean = false;

    private queueCarCanMoveToGateSys: QueueCarCanMoveToGateSys = new QueueCarCanMoveToGateSys();

    protected onLoad(): void {
        if (TestGameSys.Instance == null) {
            TestGameSys.Instance = this;
            clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetGame, this);
            clientEvent.on(MConst.EVENT.CHECK_WIN_GAME, this.CheckWinGame, this);
            clientEvent.on(MConst.EVENT.LOSE_GAME, this.LoseGame, this);
            clientEvent.on(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
            clientEvent.on(MConst.EVENT.START_TIME_GAME, this.StartTimeGame, this);

            // init logic in game
            this.logicInGameSys.SetUpCb(this.ChangeStateGame.bind(this), this.GetStateGame.bind(this));
        }
    }

    protected onDestroy(): void {
        TestGameSys.Instance = null;
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetGame, this);
        clientEvent.off(MConst.EVENT.CHECK_WIN_GAME, this.CheckWinGame, this);
        clientEvent.off(MConst.EVENT.LOSE_GAME, this.LoseGame, this);
        clientEvent.off(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.off(MConst.EVENT.START_TIME_GAME, this.StartTimeGame, this);
    }

    protected start(): void {
        // you can use this line code below if you want load game when it ready , not wait the anim change screen
        this.ChangeStateGame(STATE_GAME.PREPARE);
        // gen Helicopter
        EffectHelicopterSys.Instance.genHelicopter();
    }

    private async ResetGame() {
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_GAME, false);

        // reset data
        GameInfoSys.Instance.ResetData();
        this.listParkingCarSys.ResetData();
        this.listPassengerSys.ResetData();
        this.groundCarSys.ResetData();
        this.logicInGameSys.ResetData();

        await Utils.delay(0.2 * 1000);

        // load map again
        this.ChangeStateGame(STATE_GAME.PREPARE);
    }

    private CheckWinGame() {
        const isNoMorePassenger: boolean = this.listPassengerSys.IsNoMorePassenger();
        const isAllPassengerPickedUp: boolean = GameInfoSys.Instance.getNumPassengerPickedUp() == this.listPassengerSys.GetTotalPassenger();

        // console.log("check case win game", isNoMorePassenger, isAllPassengerPickedUp, GameInfoSys.Instance.getNumPassengerPickedUp(), this.listPassengerSys.GetTotalPassenger());

        if (isNoMorePassenger && isAllPassengerPickedUp) {
            this.ChangeStateGame(STATE_GAME.WIN_GAME);
        }
    }

    private StartTimeGame() {
        this.headerInGameSys.StartTime();
    }

    private async ChangeStateGame(state: STATE_GAME, dataCustom: any = null) {
        this._stateGame = state;

        switch (state) {
            case STATE_GAME.PREPARE:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
                this.animOpeningGame.PrepareToShowUp();
                this.headerInGameSys.PrepareToShowUp();
                this.NewGame();
                break;
            case STATE_GAME.OPENING:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

                // if has time => you can play anim for time
                if (this._isHasTime) {
                    this.animOpeningGame.AnimOpenObj(this.headerInGameSys.timeInGameSys.node, TYPE_SHOW.TOP);
                    // this.headerInGameSys.timeInGameSys.node.active = true;
                }

                // play anim show UI
                await this.animOpeningGame.AnimOpeningGame();

                this.ChangeStateGame(STATE_GAME.PLAYING);
                break;
            case STATE_GAME.PLAYING:
                // preload UI win + UI lose
                // check type game play to preload suit
                /**Sample code **/
                // clientEvent.dispatchEvent(MConst.EVENT.PRELOAD_UI_QUEUE, TYPE_UI.UI_WIN_NORMAL);

                // this.groundCarSys.TryStartTimeAllCars();
                this.groundCarSys.TryCallTimeCooldown();

                // in this game this inly call when passenger move out all and ready to get into the car
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);

                break;
            case STATE_GAME.PAUSE:
                break;
            case STATE_GAME.LOSE_GAME:
                this.headerInGameSys.timeInGameSys.PauseTime();
                // =========== maybe you need stop force something in here such as hint
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

                // =========== show ui in here
                // check type lose game
                // if lose game because no more place car in parking but player not unlock all parking car => show UIUnlockParkingFirst then so LoseGame after
                // it not => show UI Lose

                let nParkingCarLockNormal = this.listParkingCarSys.GetNParkingCarByStateParking(STATE_PARKING_CAR.LOCK_NORMAL);
                TestUIGameSys.Instance.uiLoseTestGameSys.ShowUI(nParkingCarLockNormal != null);
                break;
            case STATE_GAME.WIN_GAME:
                this.headerInGameSys.timeInGameSys.PauseTime();

                // maybe you need stop force something in here such as hint
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

                director.loadScene(MConstBuildGame.NAME_SCENE.BUILD_GAME);
                break;
        }
    }

    private ResumeGame() {
        this.ChangeStateGame(STATE_GAME.PLAYING);
    }

    private LoseGame(typeLose: TYPE_LOSE_GAME, forceLose: boolean = false) {
        if (forceLose) {
            this.ChangeStateGame(STATE_GAME.LOSE_GAME);
            return;
        }
        if (this._stateGame != STATE_GAME.PLAYING) { return; }
        this.ChangeStateGame(STATE_GAME.LOSE_GAME);
    }

    private WinGame(forceWin: boolean = false) {
        if (forceWin) {
            this.ChangeStateGame(STATE_GAME.WIN_GAME);
            return;
        }
        if (this._stateGame == STATE_GAME.LOSE_GAME || this._stateGame == STATE_GAME.WIN_GAME) { return; }
        this.ChangeStateGame(STATE_GAME.WIN_GAME);
    }

    private async NewGame() {
        // reset combo sound in here
        //** Sample code **/
        // SoundSys.Instance.resetSoundEffectComboMerge();

        await this.InitMapNormal();
        this.ChangeStateGame(STATE_GAME.OPENING);
    }

    private async InitMapNormal() {
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromBusFrenzy({ LevelData: JSON.parse(JSON.stringify(MConstBuildGame.dataMapToPlayTest)) });

        // time in game 
        if (dataMap.Time != null && dataMap.Time > 0) {
            this._isHasTime = true;
            this.headerInGameSys.ChangeTime(dataMap.Time);
        } else {
            this.headerInGameSys.HideTime();
        }

        await this.RegisterPoolSubVisualCar(dataMap);

        dataMap.CarInfo = ReSiblingJsonCar(dataMap.CarInfo);

        // set visual item in here
        const maxParkingCar: number = 7;
        await this.listParkingCarSys.SetUp(4, this.nGate.worldPosition.clone())

        await this.groundCarSys.SetUp(dataMap, this.queueCarCanMoveToGateSys,
            this.listParkingCarSys.GetNParkingCarByStateParking.bind(this.listParkingCarSys),
            this.listParkingCarSys.GetNParkingCarById.bind(this.listParkingCarSys),
            this.listParkingCarSys.GetNParkingCarVipSlot.bind(this.listParkingCarSys),
            true
        );

        // init passenger 
        const dataPassenger: number[] = dataMap.GuestColor;
        TestUIGameSys.Instance.SetGamePreparePlayNormal(1, dataPassenger.length);
        let dataInitPassenger: JsonPassenger[] = [];

        // tạo một danh sách rootDataMapCarInfo
        // danh sách sẽ bao gồm cả xe trên sân và xe trong gara và xe trong băng truyền
        let rootDatamapCarInfo: JsonCar[] = Array.from(dataMap.CarInfo);
        rootDatamapCarInfo.push(...dataMap.GarageInfo.map(infoGara => infoGara.cars).flat());
        rootDatamapCarInfo.push(...dataMap.ConveyorBeltInfo.map(infoGara => infoGara.cars).flat());

        // sort the data through the id car
        rootDatamapCarInfo.sort((a, b) => a.idCar - b.idCar);

        if (MConstBuildGame.groupChoice > 0) {
            let mapGroup = LogicGenPassengerForTestBuild(dataMap.Group, Array.from(rootDatamapCarInfo), MConstBuildGame.groupChoice);
            dataInitPassenger = mapGroup.map((color: number) => MConfigs.ConvertDataToJsonPassenger(color));
        } else {
            dataInitPassenger = dataPassenger.map((color: number) => MConfigs.ConvertDataToJsonPassenger(color));
        }

        // init id for debug pass
        dataInitPassenger.forEach((pass, index) => pass.id = index);

        //init crew
        await this.listPassengerSys.Init(this.queueCarCanMoveToGateSys, dataInitPassenger, MConfigBuildGame.idLineMapChoice);

        // move crew
        let listPromisePassMove: Promise<void>[] = [];
        switch (MConfigBuildGame.idLineMapChoice) {
            case 0:
                listPromisePassMove.push(this.listPassengerSys.MoveTheCrewForward(MConfigs.speedPassMoveWhenInitGame));
                break;
            case 1:
                listPromisePassMove.push(this.listPassengerSys.MoveTheCrewForward_open_christ(MConfigs.speedPassMoveWhenInitGame));
                break;
        }
        await Promise.all(listPromisePassMove);

        // register click for car mystery
        this.groundCarSys.RegisterClickCarMystery();
    }

    private async RegisterPoolSubVisualCar(dataMap: JsonMapGame) {
        // check in case is car need sub visual => try register it in pool
        // loop all car on ground <now in game we just need load on ground is enough> if after that it need more => you can add code to check more here
        const dataInfoSup = MConfigResourceUtils.CheckSupCar(dataMap);

        async function InitPool(nameSupViCar: NAME_SUP_VI_CAR) {
            const pfSub = await MConfigResourceUtils.GetPfSupVisualCar(nameSupViCar);
            if (pfSub == null || PoolGameSys.Instance == null) { return; }
            const poolSup = new Pool(() => instantiate(pfSub), 0);
            PoolGameSys.Instance.RegisterPool(nameSupViCar, poolSup);
        }

        let listPromise = [];
        if (dataInfoSup.isHasCarPolice) { listPromise.push(InitPool(NAME_SUP_VI_CAR.POLICE)); }
        if (dataInfoSup.isHasCarMiliTary) { listPromise.push(InitPool(NAME_SUP_VI_CAR.MILITARY)); }
        if (dataInfoSup.isHasCarAmbulance) { listPromise.push(InitPool(NAME_SUP_VI_CAR.AMBULANCE)); }
        if (dataInfoSup.isHasFireTruck) { listPromise.push(InitPool(NAME_SUP_VI_CAR.FIRE_TRUCK)); }
        if (dataInfoSup.isHasCarLock) { listPromise.push(InitPool(NAME_SUP_VI_CAR.LOCK_CAR)); }
        if (dataInfoSup.isHasCarTwoWay) { listPromise.push(InitPool(NAME_SUP_VI_CAR.TWO_WAY_CAR)); }

        await Promise.all(listPromise);
    }

    //#region common func
    public GetStateGame(): STATE_GAME {
        return this._stateGame;
    }
    //#endregion common func
}

function ReSiblingJsonCar(data: JsonCar[]): JsonCar[] {
    data.sort((a, b) => {
        const aPos = a.carPosition;
        const bPos = b.carPosition;

        // Sắp xếp theo trục y trước (TopLeft là y lớn hơn), sau đó theo trục x (x nhỏ hơn sẽ ở trước)
        if (aPos.y !== bPos.y) {
            return bPos.y - aPos.y;  // y lớn hơn sẽ được xếp trước
        } else {
            return aPos.x - bPos.x;  // x nhỏ hơn sẽ được xếp trước
        }
    });
    return data;
}
