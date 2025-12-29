import { _decorator, Component, JsonAsset, Node, Size, Sprite, SpriteFrame, UITransform, director, sp, Prefab } from 'cc';
import { ResourceUtils } from './ResourceUtils';
import { MConst } from '../Const/MConst';
import { DIRECT_CAR, GetMColorByNumber, GetNameDirectionCar, JsonMapGame, M_COLOR, TYPE_CAR_SIZE, TYPE_EMOTIONS, TYPE_EVENT_GAME, TYPE_PASSENGER_POSE, TYPE_PRIZE, TYPE_RECEIVE, IsColorCanShuffle, NAME_SUP_VI_CAR, COLOR_KEY_LOCK, JsonCar } from './Types';
import { Utils } from './Utils';
import { DataEventsSys } from '../Scene/DataEventsSys';
import { MConfigs, TYPE_GAME } from '../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('MConfigResourceUtils')
export class MConfigResourceUtils {


    /**
     * ========================================================================================
     * ========================================================================================
     * ========================================================================================
     */
    //#region load bundle audio
    public static isLoadDoneBundle_AUDIO_COMBO_MERGE = false;
    public static isLoadDoneBundle_AUDIO = false;
    public static isLoadDoneBundle_BACKGROUND = false;

    public static async TryPreLoadBundleEffect() {
        function loadAudioBundle(nameBundle: string, nameDir: string) {
            return new Promise<void>(resolve => {
                ResourceUtils.preload_Bundle(nameBundle, nameDir, (data) => {
                    if (data == MConst.EVENT.SUCCESS) {
                        // console.log("preload audio", nameDir, "success");
                    } else {
                        // console.warn("preload audio", nameDir, "error");
                    }
                    resolve();
                });
            })
        }

        if (!MConfigResourceUtils.isLoadDoneBundle_AUDIO) {
            await ResourceUtils.loadBundler(MConst.BUNDLE_EFFECT);
            MConfigResourceUtils.isLoadDoneBundle_AUDIO = true;
        }
        await loadAudioBundle(MConst.BUNDLE_EFFECT, MConst.DIR_AUDIO);
        MConfigResourceUtils.isLoadDoneBundle_AUDIO = true;
        // await loadAudioBundle(MConst.BUNDLE_EFFECT, MConst.DIR_AUDIO_COMBO_LOAD.MERGE);
        // MConfigResourceUtils.isLoadDoneBundle_AUDIO_COMBO_MERGE = true;
    }

    public static async TryPreloadBundleSoundBackground() {
        if (!MConfigResourceUtils.isLoadDoneBundle_BACKGROUND) {
            await ResourceUtils.loadBundler(MConst.BUNDLE_SOUND);
            MConfigResourceUtils.isLoadDoneBundle_BACKGROUND = true;
        }
    }

    public static LoadPfSupMap(dataMap: JsonMapGame): Promise<void> {
        return new Promise<void>(async resolve => {
            // check all special car
            const allInfoData = MConfigResourceUtils.CheckSupCar(dataMap);
            let listPromise = [];
            allInfoData.isHasCarAmbulance && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.AMBULANCE));
            allInfoData.isHasCarLock && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.LOCK_CAR));
            allInfoData.isHasCarMiliTary && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.MILITARY));
            allInfoData.isHasCarPolice && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.POLICE));
            allInfoData.isHasCarTwoWay && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.TWO_WAY_CAR));
            allInfoData.isHasFireTruck && listPromise.push(MConfigResourceUtils.GetPfSupVisualCar(NAME_SUP_VI_CAR.FIRE_TRUCK));
            await Promise.all(listPromise);
            resolve();
        });
    }

    //#endregion load bundle audio

    /**
     * ========================================================================================
     * ========================================================================================
     * ========================================================================================
     */
    //#region BUNDLE IMAGE GAME

    //#region passenger and emotions and splash
    public static mapImagePassengers: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static listSfEmotions: SpriteFrame[] = [];
    public static listSplashPass: SpriteFrame[] = [];
    public static mapImageFlashs: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    public static async LoadSplashPass() {
        if (MConfigResourceUtils.listSplashPass.length > 0) return;
        return new Promise<void>(resolve => {
            ResourceUtils.loadDirSpriteFrame_Bundle(`${MConst.DIR_FLASH}`, MConst.BUNDLE_GAME, (error, path, asset) => {
                for (let i = 0; i < asset.length; i++) {
                    const assetCheck: SpriteFrame = asset[i];
                    switch (assetCheck.name) {
                        case 'Flash1':
                            MConfigResourceUtils.listSplashPass[0] = assetCheck;
                            break;
                        case 'Flash2':
                            MConfigResourceUtils.listSplashPass[1] = assetCheck;
                            break;
                    }
                }
                resolve();
            });
        })
    }

    public static async GetImageFlashUntilLoad(path: string, cb: CallableFunction) {
        // while (true) {
        //     const sfImgPass = this.GetImagePassengers(path);
        //     if (sfImgPass != null) {
        //         cb(path, sfImgPass);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }

        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImageFlashs.get(path);
        }

        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImageFlash(path);
            result = TryGetResult(path);
        }
        cb(path, result);
    }

    public static async LoadImageFlash(path: string) {
        let pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageFlashs.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                console.log("LoadImageFlash Success", path);
                MConfigResourceUtils.mapImageFlashs.set(path, asset);
            });
        }
    }

    public static async LoadImagePassengersAndEmotions() {
        function IsEmotions(name: string): boolean {
            return name.includes("emoji");
        }

        return new Promise<void>(resolve => {
            ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_PASSENGERS, MConst.BUNDLE_GAME, (error, path, asset) => {
                for (let i = 0; i < asset.length; i++) {
                    const assetCheck: SpriteFrame = asset[i];
                    if (IsEmotions(assetCheck.name)) {
                        MConfigResourceUtils.listSfEmotions.push(assetCheck);
                    }
                    else {
                        MConfigResourceUtils.mapImagePassengers.set(assetCheck.name, assetCheck);
                    }
                }
                resolve();
            });
        })
    }

    public static GetPathPassengers(color: M_COLOR, posePassenger: TYPE_PASSENGER_POSE): string {
        return `${color}_${posePassenger}`;
    }

    public static GetImagePassengers(path: string): SpriteFrame {
        return MConfigResourceUtils.mapImagePassengers.get(path);
    }

    public static async GetImagePassengersUntilLoadOLD(path: string, cb: CallableFunction) {
        while (true) {
            const sfImgPass = this.GetImagePassengers(path);
            if (sfImgPass != null) {
                cb(path, sfImgPass);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static async GetImagePassengersUntilLoad(path: string, cb: CallableFunction) {
        // while (true) {
        //     const sfImgPass = this.GetImagePassengers(path);
        //     if (sfImgPass != null) {
        //         cb(path, sfImgPass);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }

        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImagePassengers.get(path);
        }

        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImagePassengers(path);
            result = TryGetResult(path);
        }
        cb(path, result);
    }

    public static async LoadImagePassengers(path: string) {
        let pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImagePassengers.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImagePassengers.set(path, asset);
            });
        }
    }

    public static GetRandomImageEmotions(): SpriteFrame {
        return Utils.randomValueOfList(MConfigResourceUtils.listSfEmotions);
    }

    public static GetImageEmotions(typeEmotion: TYPE_EMOTIONS): SpriteFrame {
        let imageReturn = MConfigResourceUtils.listSfEmotions.find((element) => element.name == typeEmotion);
        return imageReturn;
    }

    public static async GetImageEmotionsUntilLoadOLD(typeEmotion: TYPE_EMOTIONS, cb: CallableFunction) {
        while (true) {
            const sfEmo = this.GetImageEmotions(typeEmotion);
            if (sfEmo != null) {
                cb(typeEmotion, sfEmo);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static async GetImageEmotionsUntilLoad(typeEmotion: string, cb: CallableFunction) {
        // while (true) {
        //     const sfEmo = this.GetImageEmotions(typeEmotion);
        //     if (sfEmo != null) {
        //         cb(typeEmotion, sfEmo);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }
        // console.log("GetImageEmotionsUntilLoad", typeEmotion);
        function TryGetResult(typeEmotion: string): SpriteFrame {
            return MConfigResourceUtils.listSfEmotions.find((element) => element.name == typeEmotion);
        }

        let result: SpriteFrame = TryGetResult(typeEmotion);
        if (result == null) {
            await MConfigResourceUtils.LoadImageEmotions(typeEmotion);
            result = TryGetResult(typeEmotion);
        }
        cb(typeEmotion, result);
    }

    public static async LoadImageEmotions(typeEmotion: string) {
        // console.log("LoadImageEmotions", typeEmotion);
        let pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.listSfEmotions.find((element) => element.name == typeEmotion)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, typeEmotion, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.listSfEmotions.push(asset);
            });
        }
    }

    //#endregion passenger and emotions


    //#region car and mystery car
    /**
     * Check load image when change game
     * Bởi vì chúng ta pack toàn bộ ảnh xe và mũi tên vào một pack 
     * do đó nếu như lưu trữ ảnh xe và mũi tên vào list thì sẽ dẫn đến tăng drawcall đột biến do ảnh xe và mũi tên xuất phát từ hai pack khác nhau
     * cho nên nếu người chơi vào game lần đầu tiên thì ta sẽ load pack tut để đẩy tốc độ load lên
     * Khi người chơi đã chơi qua tut => đến màn game thường thì ta sẽ load pack thường và chỉ load xe , và những ảnh cần thiết cho màn chơi
     * và bộ dữ liệu cần phải được cập nhật lại khi đã chuyển sang pack thường
     * NOTE: logic này chưa code xin hãy xem lại khi load pack tut
     */
    private static _isLoadImageWhenChangeGameFirstTime: boolean = false;
    public static mapImageCars: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    public static async LoadImageWhenChangeGame(levelMapBgGame: number, mapTypeCar: Map<TYPE_CAR_SIZE, M_COLOR[]>, typeGame: TYPE_GAME, isLoadMystery: boolean = false) {
        let listPromise = [];

        if (isLoadMystery) {
            listPromise.push(
                this.LoadMysteryCar(mapTypeCar)
            )
        }

        // ========================= must load all car because you use swap car with many color ====================
        await this.LoadAllImageCar(null);

        // await this.LoadSplashPass();

        // ==========================  image cars + passenger ====================
        // switch (typeGame) {
        //     // case TYPE_GAME.TUTORIAL:
        //     //     listPromise.push(this.LoadPackTutorial());
        //     //     break;
        //     default:
        //         for (const [key, value] of mapTypeCar) {

        //             for (let indexColor = 0; indexColor < value.length; indexColor++) {
        //                 const colorCar = value[indexColor];
        //                 const pathDirCar = `${MConst.DIR_CARS}Car_${key}cho/${colorCar}/`;
        //                 const pathDirPass = `${MConst.DIR_PASSENGERS}${colorCar}/`;

        //                 const hasImage = Array.from(MConfigResourceUtils.mapImagePassengers.keys()).some(t => t.includes(`${MConst.DIR_PASSENGERS}`));

        //                 if (hasImage) { continue; }
        //                 // image passenger
        //                 listPromise.push(
        //                     ResourceUtils.loadDirSpriteFrame_Bundle(pathDirPass, MConst.BUNDLE_GAME, (error, path, asset) => {
        //                         for (let i = 0; i < asset.length; i++) {
        //                             const assetCheck: SpriteFrame = asset[i];
        //                             MConfigResourceUtils.mapImagePassengers.set(assetCheck.name, assetCheck);
        //                         }
        //                     })
        //                 )
        //             }
        //         }
        //         break;
        // }


        // // ==========================  image arrow ========================
        // if (MConfigResourceUtils.mapImageArrow.size == 0) {
        //     listPromise.push(this.LoadAllArrow());
        // }


        // // ==========================  image emotions ======================
        // const pathEmotions = `${MConst.DIR_PASSENGERS}Emotions/`;
        // if (MConfigResourceUtils.listSfEmotions.length == 0) {
        //     listPromise.push(
        //         ResourceUtils.loadDirSpriteFrame_Bundle(pathEmotions, MConst.BUNDLE_GAME, (error, path, asset) => {
        //             for (let i = 0; i < asset.length; i++) {
        //                 const assetCheck: SpriteFrame = asset[i];
        //                 MConfigResourceUtils.listSfEmotions.push(assetCheck);
        //             }
        //         })
        //     )
        // }

        // // ==========================  image mystery ========================
        // if (MConfigResourceUtils.mapImageQuestion.size == 0) {
        //     listPromise.push(this.LoadAllQuestion());
        // }

        // //============================ map game =============================
        // if (MConfigResourceUtils.GetImageMapGame(levelMapBgGame) == null) {
        //     listPromise.push(this.LoadMapBgGame(levelMapBgGame));
        // }


        await Promise.all(listPromise);

        MConfigResourceUtils._isLoadImageWhenChangeGameFirstTime = true;
    }

    public static async LoadMysteryCar(mapTypeCar: Map<TYPE_CAR_SIZE, M_COLOR[]>) {

        let setSizeCar: Set<TYPE_CAR_SIZE> = new Set();
        for (const [key, value] of mapTypeCar) {
            setSizeCar.add(key);
        }

        let listPromise = [];

        for (const key of setSizeCar) {
            const pathDirCar = `${MConst.DIR_CARS}Car_${key}cho/White/`;
            const hasImage = Array.from(MConfigResourceUtils.mapImageCars.keys()).some(t => t.includes(`White`) && t.includes(`${key}`));
            if (!hasImage) {
                listPromise.push(
                    ResourceUtils.loadDirSpriteFrame_Bundle(pathDirCar, MConst.BUNDLE_GAME, (error, path, asset) => {
                        for (let i = 0; i < asset.length; i++) {
                            const assetCheck: SpriteFrame = asset[i];
                            MConfigResourceUtils.mapImageCars.set(assetCheck.name, assetCheck);
                        }
                    })
                )
            }
        }

        await Promise.all(listPromise);
    }

    public static GetAllPathDirectCar(color: M_COLOR, sizeCar: TYPE_CAR_SIZE): string[] {
        const result: string[] = [];
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.BOTTOM));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.TOP));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.LEFT));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.TOP_LEFT));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.BOTTOM_LEFT));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.TOP_LEFT, true));
        result.push(this.GetPathCar(color, sizeCar, DIRECT_CAR.LEFT, true));
        return result;
    }

    public static async LoadAllImageCar(mapTypeCar: Map<TYPE_CAR_SIZE, M_COLOR[]>) {
        if (mapTypeCar != null) {
            // create a list pathImgCar
            let listPath: string[] = [];
            mapTypeCar.forEach((value: M_COLOR[], key: TYPE_CAR_SIZE) => {
                value.forEach((valueColor: M_COLOR, index: number) => {
                    const allPathCar: string[] = MConfigResourceUtils.GetAllPathDirectCar(valueColor, key);
                    listPath.push(...allPathCar.filter(path => !listPath.includes(path)));
                })
            })


            await ResourceUtils.preload_Item_Bundle(MConst.BUNDLE_GAME, listPath, (error, path, asset) => {
                if (error == MConst.EVENT.SUCCESS) {
                    for (let i = 0; i < asset.length; i++) {
                        const assetCheck: SpriteFrame = asset[i];
                        MConfigResourceUtils.mapImageCars.set(assetCheck.name, assetCheck);
                    }
                }
            });
        } else {
            await MConfigResourceUtils.LoadAllImagesInAtlasCar();
        }
    }

    public static async LoadAllImagesInAtlasCar() {

        function GetListPathCarWithAllDirection(color: M_COLOR, size: TYPE_CAR_SIZE): string[] {
            let result = [];
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.BOTTOM));
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.TOP));
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.LEFT));
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.TOP_LEFT));
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.BOTTOM_LEFT));
            // car open
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.TOP_LEFT, true));
            result.push(MConfigResourceUtils.GetPathCar(color, size, DIRECT_CAR.LEFT, true));
            return result;
        }

        // init list path all car normal
        // init list path Flash
        // init list path passenger
        // init list path emotions
        // init list path arrow
        // init list path question
        // init list path special car mystery car
        /*════════════════ CAR NORMAL ═════════════════════════*/
        // init list path all car normal
        let listPathCars: string[] = [];
        for (let color of Object.values(M_COLOR)) {
            switch (true) {
                case IsColorCanShuffle(color):
                    for (let size of Object.values(TYPE_CAR_SIZE)) {
                        size = size as TYPE_CAR_SIZE;
                        listPathCars.push(...GetListPathCarWithAllDirection(color, size));
                    }
                    break;
                case color == M_COLOR.AMBULANCE || color == M_COLOR.FIRE_TRUCK:
                    listPathCars.push(...GetListPathCarWithAllDirection(color, TYPE_CAR_SIZE['6_CHO']));
                    break;
                case color == M_COLOR.POLICE || color == M_COLOR.MILITARY:
                    listPathCars.push(...GetListPathCarWithAllDirection(color, TYPE_CAR_SIZE['4_CHO']));
                    break;
                case color == M_COLOR.REINDEER_CART:
                    listPathCars.push(...GetListPathCarWithAllDirection(color, TYPE_CAR_SIZE['4_CHO']));
                    break;
            }
        }


        /*════════════════ FLASH ═════════════════════════*/
        let listPathFlash: string[] = ["Flash1", "Flash2"];

        /*════════════════ PASSENGER ═════════════════════════*/
        let listPathPassenger: string[] = [];
        for (let color of Object.values(M_COLOR)) {
            for (let pose of Object.values(TYPE_PASSENGER_POSE)) {
                pose = pose as TYPE_PASSENGER_POSE;
                listPathPassenger.push(MConfigResourceUtils.GetPathPassengers(color, pose));
            }
        }

        /*════════════════ EMOTIONS ═════════════════════════*/
        let listPathEmotion: string[] = [];
        for (let emotion of Object.values(TYPE_EMOTIONS)) {
            listPathEmotion.push(emotion);
        }
        // console.log("listEmotion", listEmotion);

        /*════════════════ ARROW ═════════════════════════*/
        let listPathArrow: string[] = [
            MConfigResourceUtils.GetPathImageArrow(DIRECT_CAR.TOP),
            MConfigResourceUtils.GetPathImageArrow(DIRECT_CAR.TOP_LEFT),
            MConfigResourceUtils.GetPathImageArrow(DIRECT_CAR.BOTTOM_LEFT),
        ]

        /*════════════════ QUESTION ═════════════════════════*/
        let listPathQuestion: string[] = [
            MConfigResourceUtils.GetPathQuestion(DIRECT_CAR.TOP),
            MConfigResourceUtils.GetPathQuestion(DIRECT_CAR.TOP_LEFT),
            MConfigResourceUtils.GetPathQuestion(DIRECT_CAR.TOP_RIGHT),
            MConfigResourceUtils.GetPathQuestion(DIRECT_CAR.BOTTOM_LEFT),
            MConfigResourceUtils.GetPathQuestion(DIRECT_CAR.BOTTOM_RIGHT),
        ]

        /*════════════════ MYSTERY CAR ═════════════════════════*/
        let listPathMysteryCar: string[] = [];
        for (let size of Object.values(TYPE_CAR_SIZE)) {
            size = size as TYPE_CAR_SIZE;
            // Normal car paths
            listPathMysteryCar.push(MConfigResourceUtils.GetPathMysteryCar(DIRECT_CAR.BOTTOM, size));
            listPathMysteryCar.push(MConfigResourceUtils.GetPathMysteryCar(DIRECT_CAR.TOP, size));
            listPathMysteryCar.push(MConfigResourceUtils.GetPathMysteryCar(DIRECT_CAR.LEFT, size));
            listPathMysteryCar.push(MConfigResourceUtils.GetPathMysteryCar(DIRECT_CAR.TOP_LEFT, size));
            listPathMysteryCar.push(MConfigResourceUtils.GetPathMysteryCar(DIRECT_CAR.BOTTOM_LEFT, size));
        }

        /*════════════════ LOCK AND KEY ═════════════════════════*/
        let listPathCarLock: string[] = [];
        let listPathKeyCar: string[] = [];
        let listPathLockCar: string[] = [];
        for (let size of Object.values(TYPE_CAR_SIZE)) {
            size = size as TYPE_CAR_SIZE;
            listPathCarLock.push(MConfigResourceUtils.GetPathCarLock(DIRECT_CAR.BOTTOM, size));
            listPathCarLock.push(MConfigResourceUtils.GetPathCarLock(DIRECT_CAR.TOP, size));
            listPathCarLock.push(MConfigResourceUtils.GetPathCarLock(DIRECT_CAR.LEFT, size));
            listPathCarLock.push(MConfigResourceUtils.GetPathCarLock(DIRECT_CAR.TOP_LEFT, size));
            listPathCarLock.push(MConfigResourceUtils.GetPathCarLock(DIRECT_CAR.BOTTOM_LEFT, size));
        }

        for (let colorCheck of Object.values(COLOR_KEY_LOCK)) {
            listPathKeyCar.push(MConfigResourceUtils.GetPathKey(DIRECT_CAR.BOTTOM, colorCheck));
            listPathLockCar.push(MConfigResourceUtils.GetPathLock(DIRECT_CAR.BOTTOM, colorCheck));

            listPathKeyCar.push(MConfigResourceUtils.GetPathKey(DIRECT_CAR.TOP, colorCheck));
            listPathLockCar.push(MConfigResourceUtils.GetPathLock(DIRECT_CAR.TOP, colorCheck));

            listPathKeyCar.push(MConfigResourceUtils.GetPathKey(DIRECT_CAR.LEFT, colorCheck));
            listPathLockCar.push(MConfigResourceUtils.GetPathLock(DIRECT_CAR.LEFT, colorCheck));

            listPathKeyCar.push(MConfigResourceUtils.GetPathKey(DIRECT_CAR.TOP_LEFT, colorCheck));
            listPathLockCar.push(MConfigResourceUtils.GetPathLock(DIRECT_CAR.TOP_LEFT, colorCheck));

            listPathKeyCar.push(MConfigResourceUtils.GetPathKey(DIRECT_CAR.BOTTOM_LEFT, colorCheck));
            listPathLockCar.push(MConfigResourceUtils.GetPathLock(DIRECT_CAR.BOTTOM_LEFT, colorCheck));
        }

        /*════════════════ CAR TWO WAY ═════════════════════════*/
        let listPathArrowTwoWay: string[] = [];
        listPathArrowTwoWay.push(...MConfigResourceUtils.GetListPathArrowTwoWay(DIRECT_CAR.TOP));
        listPathArrowTwoWay.push(...MConfigResourceUtils.GetListPathArrowTwoWay(DIRECT_CAR.TOP_LEFT));
        listPathArrowTwoWay.push(...MConfigResourceUtils.GetListPathArrowTwoWay(DIRECT_CAR.BOTTOM_LEFT));

        /*════════════════ POLICE ═════════════════════════*/
        let listPathLightPolice: string[] = [];
        listPathLightPolice.push(...MConfigResourceUtils.GetListPathLightPolice(DIRECT_CAR.TOP));
        listPathLightPolice.push(...MConfigResourceUtils.GetListPathLightPolice(DIRECT_CAR.LEFT));
        listPathLightPolice.push(...MConfigResourceUtils.GetListPathLightPolice(DIRECT_CAR.TOP_LEFT));

        /*════════════════ FIRE TRUCK ═════════════════════════*/
        let listPathFireTruck: string[] = [];
        listPathFireTruck.push(MConfigResourceUtils.GetPathFireTruckLight());

        /*════════════════ Military ═════════════════════════*/
        let listPathLightMilitary: string[] = [];
        listPathLightMilitary.push(MConfigResourceUtils.GetPathLightMilitary(DIRECT_CAR.BOTTOM));
        listPathLightMilitary.push(MConfigResourceUtils.GetPathLightMilitary(DIRECT_CAR.TOP));
        listPathLightMilitary.push(MConfigResourceUtils.GetPathLightMilitary(DIRECT_CAR.LEFT));
        listPathLightMilitary.push(MConfigResourceUtils.GetPathLightMilitary(DIRECT_CAR.TOP_LEFT));
        listPathLightMilitary.push(MConfigResourceUtils.GetPathLightMilitary(DIRECT_CAR.BOTTOM_LEFT));


        //============ load ===============
        await ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_CARS, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                const assetName = assetCheck.name;
                switch (true) {
                    case listPathCars.includes(assetName):
                        MConfigResourceUtils.mapImageCars.set(assetName, assetCheck);
                        break;
                    case listPathFlash.includes(assetName):
                        MConfigResourceUtils.mapImageFlashs.set(assetName, assetCheck);
                        break;
                    case listPathPassenger.includes(assetName):
                        MConfigResourceUtils.mapImagePassengers.set(assetName, assetCheck);
                        break;
                    case listPathEmotion.includes(assetName):
                        MConfigResourceUtils.listSfEmotions.push(assetCheck);
                        break;
                    case listPathArrow.includes(assetName):
                        MConfigResourceUtils.mapImageArrow.set(assetName, assetCheck);
                        break;
                    case listPathQuestion.includes(assetName):
                        MConfigResourceUtils.mapImageQuestion.set(assetName, assetCheck);
                        break;
                    case listPathMysteryCar.includes(assetName):
                        MConfigResourceUtils.mapImageCars.set(assetName, assetCheck);
                        break;
                    case listPathCarLock.includes(assetName):
                        MConfigResourceUtils._mapCarLock.set(assetName, assetCheck);
                        break;
                    case listPathKeyCar.includes(assetName):
                        MConfigResourceUtils._mapKey.set(assetName, assetCheck);
                        break;
                    case listPathLockCar.includes(assetName):
                        MConfigResourceUtils._mapLock.set(assetName, assetCheck);
                        break;
                    case listPathArrowTwoWay.includes(assetName):
                        MConfigResourceUtils._mapArrowTwoWay.set(assetName, assetCheck);
                        break;
                    case listPathLightMilitary.includes(assetName):
                        MConfigResourceUtils._mapLightMilitary.set(assetName, assetCheck);
                        break;
                }
            }
            // console.log("Finised:", Date.now());
        });

        //====================================== Load light ==============================
        await ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_LIGHT_CARS, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                const assetName = assetCheck.name;
                switch (true) {
                    case listPathLightPolice.includes(assetName):
                        MConfigResourceUtils._mapLightPolice.set(assetName, assetCheck);
                        break;
                    case listPathFireTruck.includes(assetName):
                        MConfigResourceUtils._mapLightFireTruck.set(assetName, assetCheck);
                        break;
                }
            }
        });
    }

    public static GetPathFolderBySizeCar(size: number): string {
        switch (size) {
            case 4: case 6: case 10: return `Car_${size}cho`;
        }
        return null;
    }

    /**
     * return the path image suit with direction
     * @param color M_Color
     * @param sizePassengers number 
     * @param directionCar if null return the Brank <ready to pick up passenger>
     * @returns 
     */
    public static GetPathCar(color: M_COLOR, sizePassengers: TYPE_CAR_SIZE, directionCar: DIRECT_CAR = null, isCarOpen: boolean = false): string {
        if (!isCarOpen) {
            return `${color}_${GetNameDirectionCar(directionCar)}_${sizePassengers}`;
        } else {
            switch (directionCar) {
                case DIRECT_CAR.TOP_LEFT:
                    return `${color}_Open_${sizePassengers}`;
                case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                    return `${color}_OpenLeft_${sizePassengers}`;
            }
        }
    }

    public static GetImageCar(path: string): SpriteFrame {
        return MConfigResourceUtils.mapImageCars.get(path);
    }

    public static GetPathMysteryCar(directionCar: DIRECT_CAR, sizeCar: number): string {
        return `White_${GetNameDirectionCar(directionCar)}_${sizeCar}`;
    }

    public static async GetImageMysteryCarUntilLoadOLD(path: string, cb: CallableFunction) {
        while (true) {
            const imgCarMystery = this.GetImageMysteryCar(path);
            if (imgCarMystery != null) {
                cb(path, imgCarMystery);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static async GetImageMysteryCarUntilLoad(path: string, cb: CallableFunction) {
        // while (true) {
        //     const imgCarMystery = this.GetImageMysteryCar(path);
        //     if (imgCarMystery != null) {
        //         cb(path, imgCarMystery);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }

        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImageCars.get(path);
        }

        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImageMysteryCar(path);
            result = TryGetResult(path);
        }

        cb(path, result);
    }

    public static async LoadImageMysteryCar(path: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageCars.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImageCars.set(path, asset);
            });
        }
    }

    public static GetImageMysteryCar(path: string): SpriteFrame {
        return MConfigResourceUtils.mapImageCars.get(path);
    }

    public static PreloadAllImageInGame() {
        // pre load all image car, arrow
        ResourceUtils.preload_Bundle(MConst.DIR_CARS, MConst.BUNDLE_GAME, (error, path, asset) => { });
        ResourceUtils.preload_Bundle(MConst.DIR_ARROWS, MConst.BUNDLE_GAME, (error, path, asset) => { });
        ResourceUtils.preload_Bundle(MConst.DIR_ARROWS, MConst.BUNDLE_GAME, (error, path, asset) => { });
    }

    // private static listPathCarQueue: string[] = [];
    // public static async PreloadAllImageCarNeed(color: M_COLOR, sizePassengers: TYPE_CAR_SIZE, directionCar: DIRECT_CAR){
    //     let listPathCarCall: string[] = [];
    //     switch(directionCar){
    //         case DIRECT_CAR.TOP: // có thể cần ảnh trái, phải , mở chỗ, xuống dưới
    //     }
    // }

    // public static async PreloadImageCar(pathRoot: string) {
    //     ResourceUtils.preload_Item_Bundle(MConst.DIR_CARS, pathRoot, (err: string, path: string, asset: SpriteFrame) => {
    //         if (pathRoot == path) {
    //             MConfigResourceUtils.mapImageCars.set(path, asset);
    //         }
    //     })
    // }

    public static async GetImageCarUntilLoadOLD(path: string, cb: CallableFunction) {
        // wait 1s then check again
        while (true) {
            const imgCar = this.GetImageCar(path);
            if (imgCar != null) {
                cb(path, imgCar);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    private static queueLoadImageCarUntilLoad: string[] = [];
    public static async GetImageCarUntilLoad(path: string, cb: CallableFunction) {
        // wait 1s then check again
        // while (true) {
        //     const imgCar = this.GetImageCar(path);
        //     if (imgCar != null) {
        //         cb(path, imgCar);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }
        // console.log("GetImageCarUntilLoad", path);
        // const pathDirCar = `${MConst.DIR_CARS}Car_${key}cho/White/`;
        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImageCars.get(path);
        }

        this.queueLoadImageCarUntilLoad.push(path);
        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImageCar(path);
            result = TryGetResult(path);
        }
        this.queueLoadImageCarUntilLoad.splice(this.queueLoadImageCarUntilLoad.findIndex(pathCheck => pathCheck === path), 1);

        cb(path, result);
    }

    public static async LoadImageCar(path: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageCars.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                // console.log("LoadImageCar Success", path);
                MConfigResourceUtils.mapImageCars.set(path, asset);
            });
        }
    }

    //#endregion car and mystery car
    //==================================================

    //==================================================
    //#region car lock and key
    public static _mapCarLock: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    public static GetPathCarLock(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        return `Locked_${GetNameDirectionCar(directionCar)}_${sizeCar}`;
    }
    public static GetImageCarLock(path: string): SpriteFrame {
        return this._mapCarLock.get(path);
    }
    public static async GetImageCarLockUntilLoad(path: string, cb: CallableFunction) {
        while (true) {
            const SfImgCarLock = MConfigResourceUtils.GetImageCarLock(path);
            if (SfImgCarLock != null) {
                cb(path, SfImgCarLock);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static _mapKey: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetPathKey(directionKey: DIRECT_CAR, color: COLOR_KEY_LOCK) {
        return `key_${color}_${GetNameDirectionCar(directionKey)}`;
    }
    public static GetPathKeyForPlay(directionKey: DIRECT_CAR, color: COLOR_KEY_LOCK): string {
        let directChoice = directionKey;
        switch (directionKey) {
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                directChoice = DIRECT_CAR.LEFT;
                break;
            case DIRECT_CAR.BOTTOM:
                directChoice = DIRECT_CAR.TOP;
                break;
            case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.TOP_LEFT:
                directChoice = DIRECT_CAR.BOTTOM_LEFT;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.BOTTOM_LEFT:
                directChoice = DIRECT_CAR.TOP_LEFT;
                break;
            case DIRECT_CAR.TOP:
                directChoice = DIRECT_CAR.BOTTOM;
                break;
        }

        return `key_${color}_${GetNameDirectionCar(directChoice)}`;
    }
    public static GetImageCarKey(path: string): SpriteFrame {
        return this._mapKey.get(path);
    }
    public static async GetImageCarKeyUntilLoad(path: string, cb: CallableFunction) {
        while (true) {
            const SfImgCarKey = MConfigResourceUtils.GetImageCarKey(path);
            if (SfImgCarKey != null) {
                cb(path, SfImgCarKey);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static _mapLock: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetPathLock(directionKey: DIRECT_CAR, color: COLOR_KEY_LOCK) {
        return `lock_${color}_${GetNameDirectionCar(directionKey)}`;
    }
    public static GetImageLock(path: string): SpriteFrame {
        return this._mapLock.get(path);
    }
    public static async GetImageLockUntilLoad(path: string, cb: CallableFunction) {
        // let maxStep: number = 1000;
        while (true) {
            const SfImgLock = MConfigResourceUtils.GetImageLock(path);
            if (SfImgLock != null) {

                cb(path, SfImgLock);
                break;
            }
            // maxStep -= 1;
            // if (maxStep == -1) {
            //     console.error("Can not load img lock", path);
            //     break;
            // }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion car lock and key
    //==================================================


    //==================================================
    //#region car two way
    public static _mapArrowTwoWay: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetListPathArrowTwoWay(directCar: DIRECT_CAR): string[] {
        function GetListPath(nameDirect: string): string[] {
            return new Array(MConfigs.MAX_FRAME_ARROW_FLIPPER).fill("").map((value, index) => value = `Flipper_${nameDirect}_${index + 1}`);
        }

        let listPath: string[];
        switch (directCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM: case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: listPath = GetListPath("Top"); break;
            case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.TOP_RIGHT: listPath = GetListPath("TopLeft"); break;
            case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM_RIGHT: listPath = GetListPath("BottomLeft"); break;
        }
        return listPath;
    }

    public static GetListImgArrowTwoWay(listPath: string[]): SpriteFrame[] {
        try {
            let result: SpriteFrame[] = [];
            for (let i = 0; i < listPath.length; i++) {
                const pathChoice = listPath[i];
                const sfGet = this._mapArrowTwoWay.get(pathChoice);
                result.push(sfGet);
            }

            return result;
        } catch (e) {
            return null;
        }
    }

    public static async GetListImgArrowTwoWayUntilLoad(path: string[], cb: CallableFunction) {
        while (true) {
            const listSfArrow = MConfigResourceUtils.GetListImgArrowTwoWay(path);
            if (listSfArrow != null && listSfArrow.every(element => element != null)) {
                cb(path, listSfArrow);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion car two way
    //==================================================

    //==================================================
    //#region police
    public static _mapLightPolice: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetListPathLightPolice(directCar: DIRECT_CAR): string[] {
        function GetListPath(nameDirect: string): string[] {
            return new Array(MConfigs.MAX_FRAME_LIGHT_POLICE).fill("").map((value, index) => value = `police_${nameDirect}_light_${index + 1}`);
        }

        let listPath: string[];
        switch (directCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM: listPath = GetListPath("Top"); break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: listPath = GetListPath("Left"); break;
            case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_RIGHT:
            case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_RIGHT:
                listPath = GetListPath("TopLeft"); break;
        }
        return listPath;
    }

    public static GetListImgLightPolice(listPath: string[]): SpriteFrame[] {
        try {
            let result: SpriteFrame[] = [];
            for (let i = 0; i < listPath.length; i++) {
                const pathChoice = listPath[i];
                const sfGet = this._mapLightPolice.get(pathChoice);
                result.push(sfGet);
            }

            return result;
        } catch (e) {
            return null;
        }
    }

    public static async GetListImgLightPoliceUntilLoad(path: string[], cb: CallableFunction) {
        while (true) {
            const listSfLight = MConfigResourceUtils.GetListImgLightPolice(path);
            if (listSfLight != null && listSfLight.every(element => element != null)) {
                cb(path, listSfLight);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion police
    //==================================================

    //==================================================
    //#region firetruck
    public static _mapLightFireTruck: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetPathFireTruckLight(): string {
        return "firetruck_light";
    }

    public static GetImgLightFireTruck(path: string): SpriteFrame {
        try {
            const result = this._mapLightFireTruck.get(path);
            return result;
        } catch (e) {
            return null;
        }
    }

    public static async GetImgLightFireTruckUntilLoad(path: string, cb: CallableFunction) {
        while (true) {
            const sfLight = MConfigResourceUtils.GetImgLightFireTruck(path);
            if (sfLight != null) {
                cb(path, sfLight);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion firetruck
    //==================================================

    //==================================================
    //#region Military
    public static _mapLightMilitary: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static GetPathLightMilitary(directCar: DIRECT_CAR): string {
        const nameDirectionCar = `military_${GetNameDirectionCar(directCar)}_light`;
        return nameDirectionCar;
    }

    public static GetImgLightMilitary(path: string): SpriteFrame {
        try {
            const result = this._mapLightMilitary.get(path);
            return result;
        } catch (e) {
            return null;
        }
    }

    public static async GetImgLightMilitaryUntilLoad(path: string, cb: CallableFunction) {
        while (true) {
            const sfLight = MConfigResourceUtils.GetImgLightMilitary(path);
            if (sfLight != null) {
                cb(path, sfLight);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion Military
    //==================================================

    //==================================================
    //#region visual support car
    public static _mapPfVisualSupportCar: Map<string, Prefab> = new Map<string, Prefab>();
    public static GetPfSupVisualCar(nameSubCar: NAME_SUP_VI_CAR): Promise<Prefab> {
        try {
            const path = `${MConst.DIR_SUP_VI_CAR}${nameSubCar}`;

            if (this._mapPfVisualSupportCar.get(path) == null) {
                return new Promise<Prefab>(async resolve => {
                    try {
                        return ResourceUtils.load_Prefab_Bundle(path, MConst.BUNDLE_GAME, (error, path, asset) => {
                            // console.log("errr", error);
                            if (error == null) {
                                this._mapPfVisualSupportCar.set(path, asset);
                                resolve(asset);
                            } else {
                                resolve(null);
                            }
                        })
                    } catch (e) {
                        console.error("=== something wrong load sub vi car\n", e);
                    }
                });
            }

            return new Promise<Prefab>(resolve => { resolve(this._mapPfVisualSupportCar.get(path)); })
        } catch (e) {
            console.error("=== something wrong load sub vi car\n", e);
            return null;
        }
    }
    //#endregion visual support car
    //==================================================


    //#region arrow
    public static mapImageArrow: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static async LoadAllArrow() {
        await ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_ARROWS, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                MConfigResourceUtils.mapImageArrow.set(assetCheck.name, assetCheck);
            }
        });
    }

    public static GetPathImageArrow(directionCar: DIRECT_CAR): string {
        let directChoice: DIRECT_CAR = directionCar;
        switch (directionCar) {
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.BOTTOM:
                directChoice = DIRECT_CAR.TOP;
                break;
            case DIRECT_CAR.TOP_RIGHT:
                directChoice = DIRECT_CAR.TOP_LEFT;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                directChoice = DIRECT_CAR.BOTTOM_LEFT;
                break;
        }
        return `${GetNameDirectionCar(directChoice)}`;
    }

    public static async GetImageArrowUntilLoadOLD(path: string, cb: CallableFunction) {
        while (true) {
            const sfArrow = this.GetImageArrow(path);
            if (sfArrow != null) {
                cb(path, sfArrow);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static async GetImageArrowUntilLoad(path: string, cb: CallableFunction) {
        // while (true) {
        //     const sfArrow = this.GetImageArrow(path);
        //     if (sfArrow != null) {
        //         cb(path, sfArrow);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }

        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImageArrow.get(path);
        }

        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImageArrow(path);
            result = TryGetResult(path);
        }

        cb(path, result);
    }

    public static async LoadImageArrow(path: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageArrow.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImageArrow.set(path, asset);
            });
        }
    }

    public static GetImageArrow(path: string): SpriteFrame {
        return MConfigResourceUtils.mapImageArrow.get(path)
    }
    //#endregion arrow


    //#region question
    public static mapImageQuestion: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static async LoadAllQuestion() {
        await ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_QUESTIONS, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                MConfigResourceUtils.mapImageQuestion.set(assetCheck.name, assetCheck);
            }
        });
    }

    public static GetPathQuestion(directionCar: DIRECT_CAR): string {
        let directChoice: DIRECT_CAR = directionCar;
        switch (directionCar) {
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.BOTTOM:
                directChoice = DIRECT_CAR.TOP;
                break;
        }
        return `question_${GetNameDirectionCar(directChoice, false)}`;
    }

    public static async GetImageQuestionUntilLoadOLD(path: string, cb: CallableFunction) {
        while (true) {
            const sfQuestion = this.GetImageQuestion(path);
            if (sfQuestion != null) {
                cb(path, sfQuestion);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }

    public static async GetImageQuestionUntilLoad(path: string, cb: CallableFunction) {
        // while (true) {
        //     const sfQuestion = this.GetImageQuestion(path);
        //     if (sfQuestion != null) {
        //         cb(path, sfQuestion);
        //         break;
        //     }
        //     await Utils.delay(0.2 * 1000);
        // }

        function TryGetResult(path: string): SpriteFrame {
            return MConfigResourceUtils.mapImageQuestion.get(path);
        }

        let result: SpriteFrame = TryGetResult(path);
        if (result == null) {
            await MConfigResourceUtils.LoadImageQuestion(path);
            result = TryGetResult(path);
        }

        cb(path, result);
    }

    public static async LoadImageQuestion(path: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageQuestion.has(path)) {
            await ResourceUtils.loadSpriteFrame_Bundle_Cars(MConst.DIR_CARS, path, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImageQuestion.set(path, asset);
            });
        }
    }

    public static GetImageQuestion(path: string): SpriteFrame {
        return MConfigResourceUtils.mapImageQuestion.get(path);
    }
    //#endregion image question

    //#region image bg game
    public static mapBgGame: Map<number, SpriteFrame> = new Map<number, SpriteFrame>();
    private static readonly LEVEL_CHRIST_MAP_BG_GAME = 999999;
    public static async LoadMapBgGame(level: number, type: 'Normal' | 'Christmas') {
        let dirPathGame = '';
        switch (type) {
            case 'Normal':
                let levelResult = level < 10 ? `0${level}` : `${level}`;
                dirPathGame = `BgGames/BG_Gameplay_${levelResult}`;
                break;
            case 'Christmas':
                level = this.LEVEL_CHRIST_MAP_BG_GAME;
                dirPathGame = `BgGames/BG_Gameplay_Christmas`;
                break;
        }
        await ResourceUtils.loadSpriteFrame_Bundle(dirPathGame, MConst.BUNDLE_GAME, (error, path, asset) => {
            if (error == null && asset != null) {
                MConfigResourceUtils.mapBgGame.set(level, asset);
            }
        });

    }

    public static GetImageMapGame(level: number, type: 'Normal' | 'Christmas'): SpriteFrame {
        switch (type) {
            case 'Normal': break;
            case 'Christmas': level = this.LEVEL_CHRIST_MAP_BG_GAME; break;
        }
        return MConfigResourceUtils.mapBgGame.get(level);
    }

    public static async GetImageMapGameUntilLoad(level: number, cb: CallableFunction, type: 'Normal' | 'Christmas') {
        switch (type) {
            case 'Normal': break;
            case 'Christmas': level = this.LEVEL_CHRIST_MAP_BG_GAME; break;
        }

        let sfImg = this.GetImageMapGame(level, type);
        if (sfImg != null) {
            cb(level, sfImg);
        } else {
            await this.LoadMapBgGame(level, type);
            sfImg = this.GetImageMapGame(level, type);
            cb(level, sfImg);
        }
    }
    //#endregion image bg game

    //#endregion BUNDLE IMAGE GAME

    /**
     * ========================================================================================
     * ========================================================================================
     * ========================================================================================
     */

    //#region load bundle image flag
    public static mapFlags: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static async LoadImageFlag(path: string): Promise<SpriteFrame> {
        if (path == null) { return null; }
        path = path.toLocaleLowerCase();
        const pathBundle = MConst.BUNDLE;
        const pathFlag = `${MConst.DIR_FLAG}rank_flag-${path}-000`;
        if (!MConfigResourceUtils.mapFlags.has(pathFlag)) {
            await ResourceUtils.loadSpriteFrame_Bundle(pathFlag, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapFlags.set(pathFlag, asset);
            });
            return MConfigResourceUtils.mapFlags.get(pathFlag);
        }
        return MConfigResourceUtils.mapFlags.get(pathFlag);
    }
    // #endregion load bundle image flag

    //#region load bundle map
    public static mapMapTours: Map<string, any> = new Map<string, any>();
    public static async LoadMapGame(levelMap: number): Promise<JsonAsset> {
        const pathBundle = MConst.BUNDLE;
        const path = MConst.DIR_JSON_MAP + `Level${levelMap}`;
        if (!MConfigResourceUtils.mapMapTours.has(path)) {
            await ResourceUtils.LoadMapJson(path, pathBundle, (path, asset) => {
                MConfigResourceUtils.mapMapTours.set(path, asset);
            });
            return MConfigResourceUtils.mapMapTours.get(path);
        }
        return MConfigResourceUtils.mapMapTours.get(path);
    }

    public static async LoadMapGame_NEW(levelMap: number): Promise<JsonAsset> {
        const path = `${MConst.DIR_JSON_MAP_NEW}Level${levelMap}`;
        if (!MConfigResourceUtils.mapMapTours.has(path)) {
            await ResourceUtils.LoadMapJsonNEW(path, (path, asset) => {
                MConfigResourceUtils.mapMapTours.set(path, asset);
            });
            return MConfigResourceUtils.mapMapTours.get(path);
        }
        return MConfigResourceUtils.mapMapTours.get(path);
    }
    //#endregion load bundle map

    //#region load bundle map
    public static mapMapChrist: Map<string, any> = new Map<string, any>();
    public static async LoadMapGameChrist(levelMap: number): Promise<JsonAsset> {
        const pathBundle = MConst.BUNDLE;
        const path = MConst.DIR_JSON_MAP_CHRIST + `Level${levelMap}`;
        if (!MConfigResourceUtils.mapMapChrist.has(path)) {
            await ResourceUtils.LoadMapJson(path, pathBundle, (path, asset) => {
                MConfigResourceUtils.mapMapChrist.set(path, asset);
            });
            return MConfigResourceUtils.mapMapChrist.get(path);
        }
        return MConfigResourceUtils.mapMapChrist.get(path);
    }

    public static async LoadMapGame_NEW_Christ(levelMap: number): Promise<JsonAsset> {
        const path = `${MConst.DIR_JSON_MAP_NEW_CHRIST}Level${levelMap}`;
        if (!MConfigResourceUtils.mapMapChrist.has(path)) {
            await ResourceUtils.LoadMapJsonNEW(path, (path, asset) => {
                MConfigResourceUtils.mapMapChrist.set(path, asset);
            });
            return MConfigResourceUtils.mapMapChrist.get(path);
        }
        return MConfigResourceUtils.mapMapChrist.get(path);
    }
    //#endregion load bundle map

    //#region load bundle image items
    public static mapImageItems: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    public static async PreloadItemSmall() {
        const pathBundle = MConst.BUNDLE_GAME;
        let pathItem = MConst.DIR_ITEM + 0;
        return ResourceUtils.loadSpriteFrame_Bundle(pathItem, pathBundle, (error, path, asset) => {
            MConfigResourceUtils.mapImageItems.set(pathItem, asset);
        });
    }

    public static async LoadImageItems() {
        const lengthItem = 10
        const pathBundle = MConst.BUNDLE_GAME;
        let listCallPromise = [];

        for (let index = 0; index < lengthItem; index++) {
            const path = MConst.DIR_ITEM + index;
            if (!MConfigResourceUtils.mapImageItems.has(path)) {
                let callP = ResourceUtils.loadSpriteFrame_Bundle(path, pathBundle, (error, path, asset) => {
                    MConfigResourceUtils.mapImageItems.set(path, asset);
                });
                listCallPromise.push(callP);
            }
        }

        return Promise.all(listCallPromise);
    }

    public static async LoadImageItem(pathItem: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageItems.has(pathItem)) {
            await ResourceUtils.loadSpriteFrame_Bundle(pathItem, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImageItems.set(pathItem, asset);
            });
        }
    }

    public static async getImageItem(typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0): Promise<SpriteFrame> {
        function TryGetResult(typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0): SpriteFrame {

            switch (typePrize) {
                case TYPE_PRIZE.DOUBLE_KEY_SEASON_PASS:
                    return MConfigResourceUtils.getKeySeasonPass(indexPass);
                default:
                    return MConfigResourceUtils.mapImageItems.get(MConst.DIR_ITEM + typePrize);
            }
        }

        let result: SpriteFrame = TryGetResult(typePrize, typeReceive, indexPass);

        // console.log("Result: ", result);

        if (result == null) {
            // wait to update again => if it not found in map => wait to call get again from bundle
            let pathItem = null;
            if (typePrize != TYPE_PRIZE.DOUBLE_KEY_SEASON_PASS) {
                pathItem = MConst.DIR_ITEM + typePrize;
                await MConfigResourceUtils.LoadImageItem(pathItem);
                result = TryGetResult(typePrize, typeReceive, indexPass);
            } else {
                // too lazy to code more create func load key again => so just wait 0.2s and hope the load done
                await Utils.delay(0.2 * 1000);
                result = TryGetResult(typePrize, typeReceive, indexPass);
            }
        }

        return result;
    }

    /**
     * khi gọi func này sẽ không có custom thêm dữ liệu chung mà chỉ nhận về ảnh gốc bình thường
     * @param spriteSet 
     * @param typePrize 
     * @param typeReceive 
     * @param indexPass 
     */
    public static async setImageItem(spriteSet: Sprite, typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0) {
        let sfChoice = await MConfigResourceUtils.getImageItem(typePrize, typeReceive, indexPass);
        if (spriteSet != null && spriteSet.isValid) {
            spriteSet.spriteFrame = sfChoice;
        }
    }


    public static mapImageItemsBig: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static async LoadImageItemsBig() {
        const lengthItem = 5
        const pathBundle = MConst.BUNDLE_GAME;
        let listCallPromise = [];

        for (let index = 0; index < lengthItem; index++) {
            const path = MConst.DIR_ITEM_BIG + index;
            if (!MConfigResourceUtils.mapImageItemsBig.has(path)) {
                let callP = ResourceUtils.loadSpriteFrame_Bundle(path, pathBundle, (error, path, asset) => {
                    MConfigResourceUtils.mapImageItemsBig.set(path, asset);
                });
                listCallPromise.push(callP);
            }
        }

        return Promise.all(listCallPromise);
    }

    public static async PreloadItemBig() {
        const pathBundle = MConst.BUNDLE_GAME;
        let pathItem = MConst.DIR_ITEM_BIG + 0;
        return ResourceUtils.loadSpriteFrame_Bundle(pathItem, pathBundle, (error, path, asset) => {
            MConfigResourceUtils.mapImageItemsBig.set(pathItem, asset);
        });
    }

    public static async LoadImageItemBig(pathItem: string) {
        const pathBundle = MConst.BUNDLE_GAME;
        if (!MConfigResourceUtils.mapImageItemsBig.has(pathItem)) {
            await ResourceUtils.loadSpriteFrame_Bundle(pathItem, pathBundle, (error, path, asset) => {
                MConfigResourceUtils.mapImageItemsBig.set(pathItem, asset);
            });
        }
    }

    public static async getImageItemBig(typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0): Promise<SpriteFrame> {
        function TryGetResult(typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0): SpriteFrame {
            return MConfigResourceUtils.mapImageItemsBig.get(MConst.DIR_ITEM_BIG + typePrize);
        }

        let result: SpriteFrame = TryGetResult(typePrize, typeReceive, indexPass);

        // console.log("Result: ", result);

        if (result == null) {
            // wait to update again => if it not found in map => wait to call get again from bundle
            let pathItem = null;
            pathItem = MConst.DIR_ITEM_BIG + typePrize;
            await MConfigResourceUtils.LoadImageItemBig(pathItem);
            result = TryGetResult(typePrize, typeReceive, indexPass);
        }

        return result;
    }

    /**
     * khi gọi func này sẽ không có custom thêm dữ liệu chung mà chỉ nhận về ảnh gốc bình thường
     * @param spriteSet 
     * @param typePrize 
     * @param typeReceive 
     * @param indexPass 
     */
    public static async setImageItemBig(spriteSet: Sprite, typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE = TYPE_RECEIVE.NUMBER, indexPass = 0) {
        let sfChoice = await MConfigResourceUtils.getImageItemBig(typePrize, typeReceive, indexPass);
        if (spriteSet != null && spriteSet.isValid) {
            spriteSet.spriteFrame = sfChoice;
        }
    }

    //#endregion load bundle image items

    //#region load bundle season pass
    public static mapImageSeasonPassBg: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static mapImageSeasonPassProgresses: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static mapImageKeySeasonPassKeys: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    public static async LoadSeasonPass() {
        const pathBundle = MConst.BUNDLE_GAME;
        const pathSeasonPass = MConst.DIR_SEASON_PASS;

        return new Promise<void>(async resolve => {
            // tất cả các ảnh của season pass có thể tái chế sẽ được nhét trong cùng một atlas và một thư mục để giảm cho phí load ảnh
            await ResourceUtils.loadDirSpriteFrame_Bundle(pathSeasonPass, pathBundle, (error, path, asset) => {
                for (let i = 0; i < asset.length; i++) {
                    switch (true) {
                        case asset[i].name.includes('bg'):
                            MConfigResourceUtils.mapImageSeasonPassBg.set(asset[i].name, asset[i]);
                            break;
                        case asset[i].name.includes('key'):
                            MConfigResourceUtils.mapImageKeySeasonPassKeys.set(asset[i].name, asset[i]);
                            break;
                        case asset[i].name.includes('progress'):
                            MConfigResourceUtils.mapImageSeasonPassProgresses.set(asset[i].name, asset[i]);
                            break;
                    }
                }
            });
            resolve();
        })
    }

    public static getBgSeasonPass(index: number): SpriteFrame {
        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            // case player play first time => you will force regen event if player not play tut tile challenge => so let preload battle pass if player not play tut done
            index = 0;
        }
        return MConfigResourceUtils.mapImageSeasonPassBg.get(`bg_${index}`);
    }

    public static getProgressSeasonPass(index: number): SpriteFrame {
        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            index = 1;
            // case player play first time => you will force regen event if player not play tut tile challenge => so let preload battle pass if player not play tut done
        }
        return MConfigResourceUtils.mapImageSeasonPassProgresses.get(`progress_${index}`);
    }

    public static getKeySeasonPass(index: number): SpriteFrame {
        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            index = 0;
            // case player play first time => you will force regen event if player not play tut tile challenge => so let preload battle pass if player not play tut done
        }
        const sfResult = MConfigResourceUtils.mapImageKeySeasonPassKeys.get(`key_${index}`);
        // console.log("Check ", sfResult);
        return sfResult;
    }
    //#endregion load bundle season pass

    //#region load image constructor
    public static mapMapImageConstructor: Map<string, Map<string, SpriteFrame>> = new Map<string, Map<string, SpriteFrame>>();
    public static mapMapSkeletonConstructor: Map<string, Map<string, sp.SkeletonData>> = new Map<string, Map<string, sp.SkeletonData>>();
    public static map_pf_subs_map_lobby: Map<string, Prefab> = new Map<string, Prefab>();

    public static async LoadImageMapLobby(levelPlayer: number): Promise<Map<string, SpriteFrame>> {
        let dirPath = `Map${levelPlayer}/Maps/`;

        // load data
        if (!MConfigResourceUtils.mapMapImageConstructor.has(dirPath)) {
            let mapImageLobbyChoice: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
            await ResourceUtils.loadDirSpriteFrame_Bundle(dirPath, MConst.BUNDLE_MAP_LOBBY, (error, path, asset) => {
                for (let i = 0; i < asset.length; i++) {
                    const assetCheck: SpriteFrame = asset[i];
                    mapImageLobbyChoice.set(assetCheck.name, assetCheck);
                }
            });
            MConfigResourceUtils.mapMapImageConstructor.set(dirPath, mapImageLobbyChoice);
            return MConfigResourceUtils.mapMapImageConstructor.get(dirPath);
        }

        return MConfigResourceUtils.mapMapImageConstructor.get(dirPath);
    }

    public static async LoadSkeletonMapLobby(levelPlayer: number): Promise<Map<string, sp.SkeletonData>> {
        let dirPath = `Map${levelPlayer}/Skeletons/`;

        // load data
        if (!MConfigResourceUtils.mapMapSkeletonConstructor.has(dirPath)) {
            let mapSkeletonLobbyChoice: Map<string, sp.SkeletonData> = new Map<string, sp.SkeletonData>();
            await ResourceUtils.loadDirSkeleton_Bundle(dirPath, MConst.BUNDLE_MAP_LOBBY, (error, path, asset) => {
                for (let i = 0; i < asset.length; i++) {
                    const assetCheck: sp.SkeletonData = asset[i];
                    mapSkeletonLobbyChoice.set(assetCheck.name, assetCheck);
                }
            });
            MConfigResourceUtils.mapMapSkeletonConstructor.set(dirPath, mapSkeletonLobbyChoice);
            return MConfigResourceUtils.mapMapSkeletonConstructor.get(dirPath);
        }
        return MConfigResourceUtils.mapMapSkeletonConstructor.get(dirPath);
    }

    public static async LoadSkeletonMapLobbyIndex(levelPlayer: number, index: number) {
        let rootPath = `Map${levelPlayer}/Skeletons/`;
        let dirSkePath = `Map${levelPlayer}/Skeletons/building${index}`;

        if (!MConfigResourceUtils.mapMapSkeletonConstructor.has(rootPath)) {
            let mapSkeletonLobbyChoice: Map<string, sp.SkeletonData> = new Map<string, sp.SkeletonData>();
            await ResourceUtils.loadSkeleton_Bundle(dirSkePath, MConst.BUNDLE_MAP_LOBBY, (error, path, asset) => {
                if (error == null && asset != null) {
                    const assetCheck: sp.SkeletonData = asset;
                    mapSkeletonLobbyChoice.set(asset.name, assetCheck);
                    MConfigResourceUtils.mapMapSkeletonConstructor.set(rootPath, mapSkeletonLobbyChoice);
                }
            })
        } else {
            let mapSkeletonLobbyChoice: Map<string, sp.SkeletonData> = MConfigResourceUtils.mapMapSkeletonConstructor.get(rootPath);

            // trong trường hợp đã có danh sách nhưng chưa load skeleton
            await ResourceUtils.loadSkeleton_Bundle(dirSkePath, MConst.BUNDLE_MAP_LOBBY, (error, path, asset) => {
                if (error == null && asset != null) {
                    const assetCheck: sp.SkeletonData = asset;
                    mapSkeletonLobbyChoice.set(assetCheck.name, assetCheck);
                    MConfigResourceUtils.mapMapSkeletonConstructor.set(rootPath, mapSkeletonLobbyChoice);
                }
            })
        }
    }

    public static GetNameMapIndex(levelMap: number): string {
        return `Map${levelMap}`;
    }

    public static GetNameImageObjMap(indexMap: number, typeObj: 'MainConstructor' | 'Background' | 'Skeleton' | 'Shadow' | 'Black' | 'FloatCity', indexMC?: number, indexSub?: number): string {
        switch (typeObj) {
            case 'MainConstructor':
                return `map${indexMap}_building${indexMC}`;
            case 'Background':
                return `background_map${indexMap}`;
            case 'Skeleton':
                return `building${indexMC}`;
            case 'Shadow':
                return `map${indexMap}_shadow_building${indexMC}`;
            case 'Black':
                return `map${indexMap}_black_building${indexMC}`;
            case 'FloatCity':
                return `map_${indexMap}`;
        }
    }

    public static GetImageConstructor(levelMap: number, path: string): SpriteFrame {
        return MConfigResourceUtils.mapMapImageConstructor.get(`Map${levelMap}/Maps/`).get(path);
    }

    public static GetSkeletonConstructor(levelMap: number, path: string): sp.SkeletonData {
        return MConfigResourceUtils.mapMapSkeletonConstructor.get(`Map${levelMap}/Skeletons/`).get(path);
    }
    //#endregion load image constructor

    //#region pack tutorial
    public static async LoadPackTutorial() {
        await ResourceUtils.loadDirSpriteFrame_Bundle(MConst.DIR_PACK_TUT, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                // check if arrow => set to arrow
                switch (true) {
                    case assetCheck.name == 'BottomLeft': case assetCheck.name == 'Top': case assetCheck.name == 'TopLeft':
                        MConfigResourceUtils.mapImageArrow.set(assetCheck.name, assetCheck);
                        break;
                    case assetCheck.name.includes('emoji'):
                        MConfigResourceUtils.listSfEmotions.push(assetCheck);
                        break;
                    default:
                        // check if is car => set to car
                        // check if is passenger => set to passenger
                        const numUnderscore = assetCheck.name.split('_').length - 1;
                        switch (numUnderscore) {
                            case 1:
                                MConfigResourceUtils.mapImagePassengers.set(assetCheck.name, assetCheck);
                                break;
                            case 2:
                                MConfigResourceUtils.mapImageCars.set(assetCheck.name, assetCheck);
                                break;
                        }
                        break;
                }
            }
        });
    }
    //#endregion pack tutorial

    //#region VFX
    public static _mapVFXPrefab: Map<string, Prefab> = new Map<string, Prefab>();
    public static async LoadVFX(dirVFX: string, bundle: string) {
        if (this._mapVFXPrefab.get(`${bundle}/${dirVFX}`) == null) {
            return new Promise<Prefab>(async resolve => {
                await ResourceUtils.load_Prefab_Bundle(dirVFX, bundle, (error, path, asset) => {
                    // console.log("errr", error);
                    if (error == null) {
                        this._mapVFXPrefab.set(`${bundle}/${dirVFX}`, asset);
                        return resolve(asset);
                    } else {
                        resolve(null);
                    }
                })
            });
        }

        return this._mapVFXPrefab.get(`${bundle}/${dirVFX}`);
    }
    //#endreigon VFX


    //==========================================================
    //#region LevelProgess
    public static _mapKeyLevelProgression: Map<number, SpriteFrame> = new Map<number, SpriteFrame>();
    public static async GetImageKeyLPr(indexKey: number) {
        if (this._mapKeyLevelProgression.get(indexKey) == null) {
            return new Promise<SpriteFrame>(async resolve => {

                const pathKey = MConst.DIR_LEVEL_PROGRESION + `key_${indexKey}`;

                await ResourceUtils.loadSpriteFrame_Bundle(pathKey, MConst.BUNDLE_GAME, (error, path, asset) => {
                    // console.log("errr", error);
                    if (error == null) {
                        this._mapKeyLevelProgression.set(indexKey, asset);
                        return resolve(asset);
                    } else {
                        resolve(null);
                    }
                })
            });
        }

        return this._mapKeyLevelProgression.get(indexKey);
    }
    //#endregion LevelProgress
    //==========================================================


    //==========================================================
    //#region supCar 
    public static CheckSupCar(dataMap: JsonMapGame): {
        isHasCarPolice: boolean,
        isHasCarMiliTary: boolean,
        isHasCarAmbulance: boolean,
        isHasFireTruck: boolean,
        isHasCarLock: boolean,
        isHasCarTwoWay: boolean
    } {
        let isHasCarPolice: boolean;
        let isHasCarMiliTary: boolean;
        let isHasCarAmbulance: boolean;
        let isHasFireTruck: boolean;
        let isHasCarLock: boolean;
        let isHasCarTwoWay: boolean;

        dataMap.CarInfo.forEach((car: JsonCar) => {
            const mColorCar: M_COLOR = GetMColorByNumber(car.carColor);
            switch (true) {
                case !isHasCarPolice && mColorCar == M_COLOR.POLICE:
                    isHasCarPolice = true;
                    break;
                case !isHasCarMiliTary && mColorCar == M_COLOR.MILITARY:
                    isHasCarMiliTary = true;
                    break;
                case !isHasCarAmbulance && mColorCar == M_COLOR.AMBULANCE:
                    isHasCarAmbulance = true;
                    break;
                case !isHasFireTruck && mColorCar == M_COLOR.FIRE_TRUCK:
                    isHasFireTruck = true;
                    break;
                case !isHasCarLock && car.idCarKeyOfCarLock >= 0:
                    isHasCarLock = true;
                    break;
                case !isHasCarTwoWay && car.isTwoWayCar != null && car.isTwoWayCar:
                    isHasCarTwoWay = true;
                    break;
            }
        });

        return {
            isHasCarPolice: isHasCarPolice,
            isHasCarMiliTary: isHasCarMiliTary,
            isHasCarAmbulance: isHasCarAmbulance,
            isHasFireTruck: isHasFireTruck,
            isHasCarLock: isHasCarLock,
            isHasCarTwoWay: isHasCarTwoWay
        };
    }
    //#endregion supCar
    //==========================================================

    //==========================================================
    //#region Halloween
    public static _skeHalloween: sp.SkeletonData = null;

    public static LoadSkeHalloween() {
        if (MConfigResourceUtils._skeHalloween != null) { return; }
        // load ske
        return ResourceUtils.loadSkeleton_Bundle(MConst.DIR_HALOWEEN_SKE, MConst.BUNDLE_HALLOWEEN, (error, path, asset) => {
            // console.log("errr", error);
            if (error == null && asset != null) {
                MConfigResourceUtils._skeHalloween = asset;
            }
        })
    }
    //#endregion Halloween
    //==========================================================

    //==========================================================
    //#region Pack Christmas
    public static _skeChristmas: sp.SkeletonData = null;

    public static LoadSkeChristmas() {
        if (MConfigResourceUtils._skeChristmas != null) { return; }
        // load ske
        return ResourceUtils.loadSkeleton_Bundle(MConst.DIR_CHRISTMAS_SKE, MConst.BUNDLE_CHIRSTMAS, (error, path, asset) => {
            // console.log("errr", error , asset);
            if (error == null && asset != null) {
                MConfigResourceUtils._skeChristmas = asset;
            }
        })
    }
    //#endregion Pack Christmas
    //==========================================================

    //==========================================================
    //#region LightRoad
    public static _mapSfLightBulb: Map<string, SpriteFrame> = new Map();

    public static async LoadLightBulb() {
        if (MConfigResourceUtils._mapSfLightBulb.size > 0) { return; }

        const DIR_LIGHT_LR = 'EventChristMas/LightRoad';

        await ResourceUtils.loadDirSpriteFrame_Bundle(DIR_LIGHT_LR, MConst.BUNDLE_GAME, (error, path, asset) => {
            for (let i = 0; i < asset.length; i++) {
                const assetCheck: SpriteFrame = asset[i];
                MConfigResourceUtils._mapSfLightBulb.set(assetCheck.name, assetCheck);
            }
        })
    }

    public static GetPathLightBulb(indexColor: number, type: 'color' | 'root'): string {
        let result = null;

        switch (type) {
            case 'root':
                result = "unLight_bulb";
                break;
            case 'color':
                switch (indexColor) {
                    case 0: result = "light_bulb_1"; break;
                    case 1: result = "light_bulb_2"; break;
                    case 2: result = "light_bulb_3"; break;
                    case 3: result = "light_bulb_4"; break;
                    case 4: result = "light_bulb_5"; break;
                    case 5: result = "light_bulb_6"; break;
                    case 6: result = "light_bulb_7"; break;
                }
                break;
        }

        return result;
    }

    public static async GetLightBulbsUntilLoad(path: string, cb: (path: string, sfImg: SpriteFrame) => void) {
        while (true) {
            const sfImg = MConfigResourceUtils._mapSfLightBulb.get(path);
            if (sfImg != null) {
                cb(path, sfImg);
                break;
            }
            await Utils.delay(0.2 * 1000);
        }
    }
    //#endregion LightRoad
    //==========================================================

    //==========================================================
    //#region ReindeerCar
    public static _pfAnimReindeer: Prefab = null;
    public static async LoadPfAnimReindeer() {
        if (MConfigResourceUtils._pfAnimReindeer) { return; }

        const DIR_PF_ANIM = 'Cars/Reindeer/nReindeer';

        return ResourceUtils.load_Prefab_Bundle(DIR_PF_ANIM, MConst.BUNDLE_GAME, (err, path, prefab) => {
            if (err == null) {
                MConfigResourceUtils._pfAnimReindeer = prefab;
            }
        });
    }

    public static GetPfAnimReindeer(): Prefab { return MConfigResourceUtils._pfAnimReindeer; }
    //#endregion ReindeerCar
    //==========================================================
}


