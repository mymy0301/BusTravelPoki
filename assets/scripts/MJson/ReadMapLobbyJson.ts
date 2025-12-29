import { _decorator, Canvas, Component, director, instantiate, Material, Node, Prefab, Scene, Size, sp, Sprite, SpriteFrame, UITransform, Vec3, Vec4, Widget } from 'cc';
import * as dataJsonLobby from './DataLobby.json';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { ConstructorSys } from '../Scene/LobbyScene/UIBackground/ConstructorSys';
import { IMapLobbyJson, IObjConstructor, ISupObjConstructor, IObjSubsMap, IPrize, ISupSke } from '../Utils/Types';
import { ReadJsonOptimized } from '../ReadDataJson';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { MConst } from '../Const/MConst';
import { AnimBoat_map_1 } from '../Map_Lobby/AnimBoat_map_1';
import { AnimPillarLiberty } from '../Map_Lobby/AnimPillarLiberty';
import { AnimBoat_map_2 } from '../Map_Lobby/AnimBoat_map_2';
import { MConfigs } from '../Configs/MConfigs';

const { ccclass, property } = _decorator;

/**
 * NOTE Phần json constructor nên giảm thiểu param và chỉnh lại thành mỗi constructor sẽ quyết định anim của riêng mình , cần tạo abstract và interface
 */

@ccclass('ReadMapLobbyJson')
export class ReadMapLobbyJson {

    private static instance: ReadMapLobbyJson = null;

    private readonly POS_DEFAULT_FLOATING_CITY: Vec3 = new Vec3(0, 50, 0);
    private readonly SCALE_DEFAULT_PARENT_BUILDING: Vec3 = Vec3.ONE.clone().multiplyScalar(0.305);

    private _mapGame: Map<number, IMapLobbyJson> = null;

    public static get Instance(): ReadMapLobbyJson {
        if (ReadMapLobbyJson.instance == null) {
            ReadMapLobbyJson.instance = new ReadMapLobbyJson();
            ReadMapLobbyJson.instance._mapGame = new Map();
        }

        return ReadMapLobbyJson.instance;
    }

    public async LoadMap(levelMapRead: number, indexBuilding: number) {
        // let listSkeLoad = [];
        // for (let i = 0; i <= indexBuilding; i++) {
        //     listSkeLoad.push(MConfigResourceUtils.LoadSkeletonMapLobbyIndex(levelMapRead, i));
        // }

        let listPromises = [];
        listPromises.push(MConfigResourceUtils.LoadImageMapLobby(levelMapRead));
        listPromises.push(MConfigResourceUtils.LoadSkeletonMapLobby(levelMapRead));
        switch (levelMapRead) {
            case 1: listPromises.push(ReadSpecialMap1()); break;
            case 2: listPromises.push(ReadSpecialMap2()); break;
            case 3: listPromises.push(ReadSpecialMap3()); break;
            case 4: listPromises.push(ReadSpecialMap4()); break;
            case 5: listPromises.push(ReadSpecialMap5()); break;
        }

        //wait to load UI
        await Promise.all(listPromises);
    }


    /**
     * hàm này sẽ tự sinh ra các consstructor và trả về danh sách thứ tự các constructor theo thứ tự được sinh ra
     * @param levelMapRead 
     * @param nUIBackground 
     * @param pfConstructor 
     * @returns Promise<Node[]>
     */
    public async ReadMapAndSetUpBase(levelMapRead: number, totalConstructorUnlocked: number, progressConstructorNow: number,
        nUIBackground: Node, pfConstructor: Prefab, pfSkeletonConstructor: Prefab, matBgGardient: Material): Promise<{ listConstructor: Node[], infoMap: IMapLobbyJson }> {

        const dataJsonMap: IMapLobbyJson = this.GetInfoJsonMap(levelMapRead);
        let listConstructor: Node[] = new Array(dataJsonMap.listConstructors.length);

        /**
        * =========================================================
        * This code below is a base => you can use if else and use a custom function something else in the level special you want or just use code base
        * Some case you need to custom code such as:
        *          - about the siblingIndex level
        *          - about the parent level
        * =========================================================
        */

        // init background
        matBgGardient.setProperty("Color1", GetColorToSetShader(dataJsonMap.colorUp));
        matBgGardient.setProperty("Color2", GetColorToSetShader(dataJsonMap.colorDown));

        // init Float City
        const nFloatCity = new Node();
        nFloatCity.addComponent(UITransform);
        nFloatCity.name = `FloatCity_${levelMapRead}`;
        nFloatCity.position = this.POS_DEFAULT_FLOATING_CITY;
        nFloatCity.parent = nUIBackground;

        // init sp bg map
        const nBgMap = new Node();
        nBgMap.addComponent(UITransform);
        nBgMap.addComponent(Sprite);
        nBgMap.name = `BgMap_${levelMapRead}`;
        const spBgMap = nBgMap.getComponent(Sprite);
        const pathBgMap = MConfigResourceUtils.GetNameImageObjMap(levelMapRead, 'FloatCity');
        spBgMap.spriteFrame = MConfigResourceUtils.GetImageConstructor(levelMapRead, pathBgMap);
        nBgMap.parent = nFloatCity;
        nBgMap.position = dataJsonMap.posMap;

        // init parent constructor
        const nParentCons = new Node();
        nParentCons.name = "ParentCons";
        nParentCons.scale = this.SCALE_DEFAULT_PARENT_BUILDING;
        nFloatCity.addChild(nParentCons);

        // init constructor
        for (let i = 0; i < dataJsonMap.listConstructors.length; i++) {
            let infoConstructor: IObjConstructor = dataJsonMap.listConstructors[i];
            // bởi vì phần info này cần phải convert list prize riêng từ json dó đó khi ép kiểu từ json phần listPrize chắc chắn là null
            // chúng ta cần phải readOptimize lại dữ liệu sau đó gán lại để chính xác

            const listPrize: IPrize[] = ReadJsonOptimized(infoConstructor);
            infoConstructor.listPrize = listPrize;
            // kiêm tra tiến trình unlock của người chơi nếu như số công trình unlock được lớn hơn index của công trình => công trình đó đã unlcok hoàn toàn
            // còn nếu số công trình unlock được nhỏ hơn index công trình => công trình đó chưa unlock và chưa đến lượt unlock
            // còn nếu số công trình unlock được == index công trình => công trình đó đang được unlock
            let progressConstructor: number = 0;

            switch (true) {
                case totalConstructorUnlocked > i:
                    progressConstructor = -2;
                    break;
                case totalConstructorUnlocked < i:
                    progressConstructor = -1;
                    break;
                case totalConstructorUnlocked == i:
                    progressConstructor = progressConstructorNow;
                    break;
            }
            let objConstructor: Node = instantiate(pfConstructor);
            objConstructor.parent = nUIBackground;

            objConstructor.getComponent(ConstructorSys).SetUp(levelMapRead, nParentCons, infoConstructor, progressConstructor, pfSkeletonConstructor);
            listConstructor[infoConstructor.index - 1] = objConstructor;
        }

        for (let i = 0; i < listConstructor.length; i++) {
            listConstructor[i].setSiblingIndex(dataJsonMap.listConstructors[i].siblingIndex);
        }

        // init sub map
        const objSubMap: Node = new Node();
        objSubMap.name = 'SubMap_layer_1';
        objSubMap.setParent(nParentCons);
        for (let i = 0; i < dataJsonMap.listSubsMap.length; i++) {
            const infoSubsMap: IObjSubsMap = dataJsonMap.listSubsMap[i];
            const prefabSubsMap: Prefab = MConfigResourceUtils.map_pf_subs_map_lobby.get(infoSubsMap.name);
            if (prefabSubsMap == null) continue;
            const objSubs: Node = instantiate(prefabSubsMap);
            objSubs.setParent(objSubMap);
            objSubs.setPosition(infoSubsMap.pos);
            objSubs.setScale(infoSubsMap.scale);
            objSubs.name = infoSubsMap.name;
            PlayDataSpecialForSubsMap(objSubs, infoSubsMap, levelMapRead);
        }

        // để đảm bảo ko bị lỗi do tốc độ initNode
        objSubMap.setSiblingIndex(0);

        return {
            listConstructor: listConstructor,
            infoMap: dataJsonMap
        };
    }

    public GetInfoJsonMap(levelMapRead: number): IMapLobbyJson {
        function ReadListSubConstructors(listSubConstructors: any): ISupObjConstructor[] {
            // check valid
            if (listSubConstructors == null) { return []; }
            // check param
            let result = listSubConstructors as ISupObjConstructor[];
            result.forEach(supConstructorCheck => {
                supConstructorCheck.isShowFromStart = supConstructorCheck.isShowFromStart != null ? supConstructorCheck.isShowFromStart : false;
            })
            return result;
        }

        function ReadListSupSke(listSupSke: any): ISupSke[] {
            // check valid
            if (listSupSke == null) { return []; }
            // check param
            let result = listSupSke as ISupSke[];
            result.forEach(supSke => {
                supSke.parent = supSke.parent == null ? 'bottom' : supSke.parent;
                supSke.scale = supSke.scale == null ? Vec3.ONE.clone() : supSke.scale;
            })
            return result;
        }

        function ReadListConstructors(listConstructors: any): IObjConstructor[] {
            // check valid
            if (listConstructors == null) { return []; }
            // check param
            let result = listConstructors as IObjConstructor[];
            result.forEach(constructCheck => {
                constructCheck.canPlayAnimIdle = !(constructCheck.canPlayAnimIdle != null && !constructCheck.canPlayAnimIdle);
                constructCheck.canPlayAnimOpen = !(constructCheck.canPlayAnimOpen != null && !constructCheck.canPlayAnimOpen);
                constructCheck.scaleVisual = constructCheck.scaleVisual == null ? Vec3.ONE.clone() : constructCheck.scaleVisual;
                const listSupConstructors = ReadListSubConstructors(constructCheck.listSubConstructors);
                constructCheck.listSubConstructors = listSupConstructors;
                const listSupSke = ReadListSupSke(constructCheck.listSupSke);
                constructCheck.listSupSke = listSupSke;
                constructCheck.scaleWhenZoom = constructCheck.scaleWhenZoom == null ? MConfigs.NUM_SCALE_WHEN_BUILD : constructCheck.scaleWhenZoom;
                constructCheck.distanceWhenZoom = constructCheck.distanceWhenZoom == null ? MConfigs.DISTANCE_HIGHER_CAM_WHEN_BUILD : constructCheck.distanceWhenZoom;
            })
            return result;
        }

        //============= check info map in data ================
        const mapInData = this._mapGame.get(levelMapRead);
        if (mapInData != null) return mapInData;

        //============= Read map =======================
        const infoMapTotal: any = dataJsonLobby["default"];
        const dataMap: any = infoMapTotal[`Map${levelMapRead.toString()}`];
        const listPrize: IPrize[] = ReadJsonOptimized(dataMap);
        const listConstructors: IObjConstructor[] = ReadListConstructors(dataMap.listConstructors)
        let infoMap: IMapLobbyJson = {
            title: dataMap.title as string,
            colorUp: dataMap.colorUp as string,
            colorDown: dataMap.colorDown as string,
            listConstructors: listConstructors,
            listSubsMap: dataMap.listSubsMap as IObjSubsMap[],
            listPrize: listPrize,
            posMap: dataMap.posMap != null ? dataMap.posMap as Vec3 : Vec3.ZERO
        }

        return infoMap;
    }

    public GetInfoConstructor(levelMapRead: number, indexConstructor: number): { title: string, listPrize: IPrize[] } {
        const infoMapTotal: any = dataJsonLobby["default"];
        const dataMap: any = infoMapTotal[`Map${levelMapRead.toString()}`];
        const infoConstructor: IObjConstructor = dataMap.listConstructors[indexConstructor] as IObjConstructor;
        const listPrize: IPrize[] = ReadJsonOptimized(infoConstructor);
        return { title: infoConstructor.title, listPrize: listPrize };
    }

    public GetInfoFullConstructor(levelMapRead: number, indexConstructor: number): IObjConstructor {
        const infoMapTotal: any = dataJsonLobby["default"];
        const dataMap: any = infoMapTotal[`Map${levelMapRead.toString()}`];
        if (indexConstructor >= dataMap.listConstructors.length) { indexConstructor = dataMap.listConstructors.length - 1; }
        const infoConstructor: IObjConstructor = dataMap.listConstructors[indexConstructor] as IObjConstructor;
        return infoConstructor;
    }

    public GetNameMap(levelMapRead: number): string {
        let dataMap = this.GetInfoJsonMap(levelMapRead);
        return dataMap.title;
    }
}

function AddToPromise(dirPrefabPathLoad: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const namePf: string = getLastPathSegment(dirPrefabPathLoad)
        if (MConfigResourceUtils.map_pf_subs_map_lobby.get(namePf) != null) { resolve(); }
        else {
            ResourceUtils.load_Prefab_Bundle(dirPrefabPathLoad, MConst.BUNDLE_MAP_LOBBY, (error, path, pfLoad) => {
                if (pfLoad != null && MConfigResourceUtils.map_pf_subs_map_lobby.get(pfLoad.name) == null) {
                    MConfigResourceUtils.map_pf_subs_map_lobby.set(pfLoad.name, pfLoad);
                    // console.warn("Done ", pfLoad.name);
                    resolve();
                } else {
                    console.error(pfLoad.name, error);
                    resolve();
                }
            });
        }
    });
}

async function ReadSpecialMap1() {
    const dirPrefabPath1 = `/Map1/Maps/Subs/Boat/pf_boat_map_1`;
    const dirPrefabPath2 = `/Map1/Maps/Subs/PillarLiberty/pf_pillar_Liberty`;
    const dirPrefabPath3 = `/Map1/Maps/Subs/CarHotDog/pf_car_hot_dog`;
    const dirPrefabPath4 = `/Map1/Maps/Subs/BaseBuidling3/pf_base_building3`;
    let listPromise = [];

    listPromise.push(AddToPromise(dirPrefabPath1));
    listPromise.push(AddToPromise(dirPrefabPath2));
    listPromise.push(AddToPromise(dirPrefabPath3));
    listPromise.push(AddToPromise(dirPrefabPath4));

    await Promise.all(listPromise);
}

async function ReadSpecialMap2() {
    const dirPrefabPath1 = `/Map2/Maps/Subs/Boat/pf_boat_map_2`;
    const dirPrefabPath2 = `/Map2/Maps/Subs/HandRail/pf_hand_rail`;

    let listPromise = [];

    listPromise.push(AddToPromise(dirPrefabPath1));
    listPromise.push(AddToPromise(dirPrefabPath2));

    await Promise.all(listPromise);
}

async function ReadSpecialMap3() {
    const dirPrefabPath1 = `/Map3/Maps/Subs/floor_building2/floor_building2`;

    let listPromise = [];

    listPromise.push(AddToPromise(dirPrefabPath1));

    await Promise.all(listPromise);
}

async function ReadSpecialMap4() { }

async function ReadSpecialMap5() { }

async function PlayDataSpecialForSubsMap(nSub: Node, infoSubsMap: IObjSubsMap, levelMapRead: number) {
    switch (true) {
        case levelMapRead == 1 && infoSubsMap.name == 'pf_boat_map_1':
            const nameAnim_boat: string = infoSubsMap.dataCustom as string;
            nSub.getComponent(AnimBoat_map_1).PlayDataCustom(nameAnim_boat);
            break;
        case levelMapRead == 1 && infoSubsMap.name == 'pf_pillar_Liberty':
            const nameAnim_pillar: string = infoSubsMap.dataCustom as string;
            nSub.getComponent(AnimPillarLiberty).PlayDataCustom(nameAnim_pillar);
            break;
        case levelMapRead == 2 && infoSubsMap.name == 'pf_boat_map_2':
            const nameAnim_bloat_2: string = infoSubsMap.dataCustom as string;
            nSub.getComponent(AnimBoat_map_2).PlayDataCustom(nameAnim_bloat_2);
            break;
    }
}

function GetColorToSetShader(hexColor: string): Vec4 {
    // Convert hex color string (e.g., "#RRGGBB" or "#RRGGBBAA") to Vec4 (r, g, b, a) in [0,1] range
    hexColor = hexColor.replace('#', '');
    let r = 1, g = 1, b = 1, a = 1;
    if (hexColor.length === 6) {
        r = parseInt(hexColor.substring(0, 2), 16) / 255;
        g = parseInt(hexColor.substring(2, 4), 16) / 255;
        b = parseInt(hexColor.substring(4, 6), 16) / 255;
    } else if (hexColor.length === 8) {
        r = parseInt(hexColor.substring(0, 2), 16) / 255;
        g = parseInt(hexColor.substring(2, 4), 16) / 255;
        b = parseInt(hexColor.substring(4, 6), 16) / 255;
        a = parseInt(hexColor.substring(6, 8), 16) / 255;
    }
    return new Vec4(r, g, b, a);
}

function getLastPathSegment(path: string): string {
    const segments = path.split('/');
    return segments[segments.length - 1];
}