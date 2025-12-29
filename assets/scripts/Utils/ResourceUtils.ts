import { assetManager, AudioClip, ImageAsset, Prefab, resources, SpriteFrame, Texture2D, _decorator, Material, TextAsset, AssetManager, sp, JsonAsset, Asset } from 'cc';
import { LoadCompleteCallback, LoadCompleteCallbackDir, MConst } from '../Const/MConst';
import { Utils } from './Utils';
import { MConsolLog } from '../Common/MConsolLog';
const { ccclass, property } = _decorator;

@ccclass('ResourceUtils')
export class ResourceUtils {
    public static loadPrefab(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, onProgress, (err, prefab: Prefab) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(prefab);
                }
            });
        });
    }

    public static loadPrefabUI(path: string, cb: LoadCompleteCallback<Prefab>) {
        // console.log("loadPrefabUI",path);
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, prefab: Prefab) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("loadPrefabUI FINISHED",path);
                    cb(null, path, prefab);
                    resolve && resolve(prefab);
                }
            });
        })
    }

    public static preLoadSceneBundle(path: string, pathBundle: string, cb: LoadCompleteCallback<any>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).preloadScene(path, (finished: number, total: number, item: AssetManager.RequestItem) => {
                //  console.log("preLoadSceneBundle "+path,finished, total);
            }, (err) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    // cb(null, path, null);
                    // // console.log(ret);
                    // resolve && resolve(null);
                    assetManager.getBundle(pathBundle).loadScene(path,
                        (finished: number, total: number, item: AssetManager.RequestItem) => {
                            // console.log("loadSceneBundle "+path,finished, total);
                        },
                        (err, ret) => {
                            if (err) {
                                console.log(err);
                                resolve(null);
                            }
                            else {
                                cb(null, path, ret);
                                // console.log("loadSceneBundle",ret);
                                resolve && resolve(ret);
                            }
                        });
                }
            });
        });
    }

    public static loadSceneBundle(path: string, pathBundle: string, cb: LoadCompleteCallback<any>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).loadScene(path,
                (finished: number, total: number, item: AssetManager.RequestItem) => {
                    // console.log("loadSceneBundle222 " + path, finished, total);
                },
                (err, ret) => {
                    if (err) {
                        console.log(err);
                        cb(err, path, null);
                        resolve(null);
                    }
                    else {
                        cb(null, path, ret);
                        // console.log("loadSceneBundle", ret);
                        resolve && resolve(ret);
                    }
                });
        });
    }

    public static loadDirPrefab_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallbackDir<Prefab>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).loadDir(path, Prefab, (err, ret) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    cb(null, path, ret);
                    // console.log(ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static loadAllInDir(path: string, pathBundle: string, cb: LoadCompleteCallbackDir<any>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).loadDir(path, Asset, (err, ret) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    cb(null, path, ret);
                    // console.log(ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    

    public static preLoadPrefab(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.preload(path, Prefab, onProgress, (err, prefab: AssetManager.RequestItem[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(prefab);
                }
            });
        });
    }

    public static loadAudio(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, AudioClip, onProgress, (err, audio: AudioClip) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(audio);
                }
            });
        });
    }

    public static loadJson(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, onProgress, (err, json: JsonAsset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(json);
                }
            });
        });
    }

    public static loadJsonAsset(path: string, pathBundle: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let ret = assetManager.getBundle(pathBundle).get(path, JsonAsset);
            if (ret) {
                resolve(ret);
                return;
            }
            assetManager.getBundle(pathBundle).load(path, JsonAsset, (err, ret) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    resolve(ret);
                }
            });
        })
    }

    public static loadJsonAssetRemote(path: string): Promise<any> {
        console.log("loadJsonAssetRemote", path);
        return new Promise<any>((resolve, reject) => {
            assetManager.loadRemote<ImageAsset>(path + ".json", function (err, jsonAsset: JsonAsset) {

                if (err) {
                    resolve(null);
                }
                else {
                    console.log(jsonAsset);
                    resolve(jsonAsset);
                }
            });
        })
    }

    public static loadSprite(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, ImageAsset, onProgress, (err, imageAsset: ImageAsset) => {
                if (err) {
                    reject(err);
                } else {
                    const spriteFrame = new SpriteFrame();
                    const texture = new Texture2D();
                    texture.image = imageAsset;
                    spriteFrame.texture = texture;
                    resolve(spriteFrame);
                }
            });
        });
    }

    public static loadSpriteFrame(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, ImageAsset, onProgress, (err, imageAsset: ImageAsset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(SpriteFrame.createWithImage(imageAsset));
                }
            });
        });
    }

    public static loadImageAsset(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, ImageAsset, onProgress, (err, imageAsset: ImageAsset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(imageAsset);
                }
            });
        });
    }

    public static loadDirSprite(dirPath: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.loadDir(dirPath, SpriteFrame, onProgress, (err, spriteFrameList: SpriteFrame[]) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(spriteFrameList);
                }
            });
        });
    }

    public static loadImageFromURL(remoteUrl: string): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>((resolve, reject) => {
            // Remote texture url with file extensions
            assetManager.loadRemote<ImageAsset>(remoteUrl, { ext: ".jpg" }, function (err, imageAsset: ImageAsset) {

                if (err) {
                    resolve(null);
                }
                else {
                    const spriteFrame = new SpriteFrame();
                    const texture = new Texture2D();
                    texture.image = imageAsset;
                    // MConsolLog.Log("check imageAsset", imageAsset);
                    spriteFrame.texture = texture;
                    resolve(spriteFrame);
                }
            });
        });
    }

    public static loadImageAssetFromURL(remoteUrl: string): Promise<ImageAsset> {
        return new Promise((resolve, reject) => {
            // Remote texture url with file extensions
            assetManager.loadRemote<ImageAsset>(remoteUrl, function (err, imageAsset: ImageAsset) {
                if (!err) {
                    resolve(imageAsset);
                } else {
                    reject(err);
                }
            });
        });
    }

    public static loadMaterial(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, Material, onProgress, (err, material: Material) => {
                if (!err) {
                    resolve(material);
                } else {
                    reject(err);
                }
            });
        });
    }

    public static loadFileText(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(path, TextAsset, onProgress, (err, text: TextAsset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(text);
                }
            });
        });
    }

    /**
     * 
     * @param path 
     * @param onProgress 
     * @returns a list or err
     */
    public static preLoadMaterial(path: string, onProgress?: (finished: number, total: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.preload(path, Material, onProgress, (err, requestItem) => {
                if (!err) {
                    resolve(requestItem);
                } else {
                    reject(err);
                }
            });
        });
    }

    public static loadBundler(name: string) {
        // console.log("loadBundlerloadBundlerloadBundler: " + name);
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, ret) => {
                // console.log(ret)
                resolve(null);
            });
        });
    }

    public static loadSpriteFrame_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallback<SpriteFrame>) {
        return new Promise((resolve, reject) => {
            const pathSF = path + '/spriteFrame';
            // console.log("1", pathSF);
            let ret = assetManager.getBundle(pathBundle).get(pathSF, SpriteFrame);
            if (ret) {
                // console.log("2", path);
                cb(null, path, ret);
                resolve && resolve(ret);
                return;
            }
            // console.log("3", pathBundle,path);
            assetManager.getBundle(pathBundle).load(pathSF, SpriteFrame, (err, ret) => {
                if (err) {
                    resolve(null);
                }
                else {
                    // console.log("4", ret);    
                    cb(null, path, ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static loadSpriteFrame_Bundle_Cars(pathDir: string, path: string, pathBundle: string, cb: LoadCompleteCallback<SpriteFrame>) {
        return new Promise((resolve, reject) => {
            const pathSF = pathDir + path + '/spriteFrame';
            // console.log("1", pathSF);
            let ret = assetManager.getBundle(pathBundle).get(pathSF, SpriteFrame);
            if (ret) {
                // console.log("2", path);
                cb(null, path, ret);
                resolve && resolve(ret);
                return;
            }
            // console.log("3", pathBundle,path);
            assetManager.getBundle(pathBundle).load(pathSF, SpriteFrame, (err, ret) => {
                if (err) {
                    resolve(null);
                }
                else {
                    // console.log("4", ret);    
                    cb(null, path, ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static loadDirSpriteFrame_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallbackDir<SpriteFrame>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).loadDir(path, SpriteFrame, (err, ret) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    cb(null, path, ret);
                    // console.log(ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static loadAudioClip_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallback<AudioClip>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).load(path, AudioClip, (err, ret) => {
                if (err) {
                    // reject(null);
                }
                else {
                    cb(null, path, ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static preload_Bundle(pathBundle: string, pathDir: string, cb: CallableFunction) {
        assetManager.getBundle(pathBundle).preloadDir(pathDir, (err, data) => {
            if (err) {
                cb(MConst.EVENT.FAILED);
                // console.log(err);
            } else {
                cb(MConst.EVENT.SUCCESS);
                // console.log(data);
            }
        });
    }

    public static preload_Item_Bundle(pathBundle: string, pathItem: string[], cb: CallableFunction) {
        assetManager.getBundle(pathBundle).preload(pathItem, SpriteFrame, (err, data) => {
            if (err) {
                cb(MConst.EVENT.FAILED, null, null);
                // console.log(err);
            } else {
                cb(MConst.EVENT.SUCCESS, pathItem, data);
                // console.log(data);
            }
        });
    }

    public static load_Prefab_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallback<Prefab>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).load(path, Prefab, (err, ret) => {
                if (err) {
                    console.error(err);
                    // reject(null);
                }
                else {
                    cb(null, path, ret);
                    resolve && resolve(ret);
                }
            });
        });
    }


    //#region cache image from ResourceUtils
    public static mapCacheAvatars: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    public static mapLoadingImages: string[] = [];
    //#endregion cache image from ResourceUtils
    public static async TryLoadImage(pathAvatar: string, cb: CallableFunction) {
        let pathAvatarLoad = pathAvatar;
        if (pathAvatarLoad == null || pathAvatarLoad == '' || pathAvatarLoad == 'undefined')
            pathAvatarLoad = MConst.PATH.NON_AVATAR;

        if (!ResourceUtils.mapCacheAvatars.has(pathAvatarLoad)) {
            let spriteFrame: SpriteFrame = null;

            // check image is loading 
            // if not => add to loading
            // if is loading wait until the older load is done

            if (ResourceUtils.mapLoadingImages.findIndex(path => path == pathAvatarLoad) == -1) {
                ResourceUtils.mapLoadingImages.push(pathAvatarLoad);

                if (pathAvatarLoad == MConst.PATH.NON_AVATAR) {
                    spriteFrame = await ResourceUtils.loadSpriteFrame(pathAvatarLoad);
                } else {
                    spriteFrame = await ResourceUtils.loadImageFromURL(pathAvatarLoad);
                    if (spriteFrame == null) {
                        spriteFrame = await ResourceUtils.loadSpriteFrame(MConst.PATH.NON_AVATAR);
                    }
                }

                ResourceUtils.mapLoadingImages.splice(ResourceUtils.mapLoadingImages.findIndex(path => path == pathAvatarLoad), 1);
                ResourceUtils.mapCacheAvatars.set(pathAvatarLoad, spriteFrame);
            } else {
                // just only wait for 1 minute
                for (let i = 0; i < 120; i++) {
                    if (ResourceUtils.mapCacheAvatars.has(pathAvatarLoad)) {
                        break;
                    }
                    await Utils.delay(0.5 * 1000);
                }
            }
        } else {
            MConsolLog.Log("already load image");
        }

        // MConsolLog.Log("pathAvatar :" + pathAvatar, ResourceUtils.mapCacheAvatars.get(pathAvatar));
        cb(pathAvatar, ResourceUtils.mapCacheAvatars.get(pathAvatarLoad));
    }

    public static loadSkeleton_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallback<sp.SkeletonData>) {
        return new Promise((resolve, reject) => {
            const pathSF = path;
            // console.log("1", pathSF);
            let ret = assetManager.getBundle(pathBundle).get(pathSF, sp.SkeletonData);
            if (ret) {
                // console.log("2", path);
                cb(null, path, ret);
                resolve && resolve(ret);
                return;
            }
            // console.log("3", pathBundle,path);
            assetManager.getBundle(pathBundle).load(pathSF, sp.SkeletonData, (err, ret) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    // console.log("4", ret);    
                    cb(null, path, ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    public static loadDirSkeleton_Bundle(path: string, pathBundle: string, cb: LoadCompleteCallbackDir<sp.SkeletonData>) {
        return new Promise((resolve, reject) => {
            assetManager.getBundle(pathBundle).loadDir(path, sp.SkeletonData, (err, ret) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    cb(null, path, ret);
                    // console.log(ret);
                    resolve && resolve(ret);
                }
            });
        });
    }

    //#region cache map json tour
    public static mapCacheJsonMapTour: Map<string, any> = new Map<string, any>();
    public static mapLoadingJsonMapTour: string[] = [];
    public static async LoadMapJson(pathMapLoad: string, pathBundle: string, cb: CallableFunction) {
        if (pathMapLoad == null || pathMapLoad == '' || pathMapLoad == 'undefined') {
            cb(null);
            return;
        }

        // check if not json map tour in cache => load map
        if (!ResourceUtils.mapCacheJsonMapTour.has(pathMapLoad)) {
            let jsonMap: any = null;
            // check mapJson is loading 
            // if not => add to loading
            // if is loading wait until the older load is done
            if (ResourceUtils.mapLoadingJsonMapTour.findIndex(path => path == pathMapLoad) == -1) {
                ResourceUtils.mapLoadingJsonMapTour.push(pathMapLoad);

                jsonMap = await ResourceUtils.loadJsonAsset(pathMapLoad, pathBundle);

                ResourceUtils.mapLoadingJsonMapTour.splice(ResourceUtils.mapLoadingJsonMapTour.findIndex(path => path == pathMapLoad), 1);
                ResourceUtils.mapCacheJsonMapTour.set(pathMapLoad, jsonMap);
            } else {
                // just only wait for 1 minute
                for (let i = 0; i < 120; i++) {
                    if (ResourceUtils.mapCacheJsonMapTour.has(pathMapLoad)) {
                        break;
                    }
                    await Utils.delay(0.5 * 1000);
                }
            }

            cb(pathMapLoad, ResourceUtils.mapCacheJsonMapTour.get(pathMapLoad));
        }
    }

    public static async LoadMapJsonNEW(pathMapLoad: string, cb: CallableFunction) {
        if (pathMapLoad == null || pathMapLoad == '' || pathMapLoad == 'undefined') {
            cb(null);
            return;
        }

        // check if not json map tour in cache => load map
        if (!ResourceUtils.mapCacheJsonMapTour.has(pathMapLoad)) {
            let jsonMap: any = null;
            // check mapJson is loading 
            // if not => add to loading
            // if is loading wait until the older load is done
            if (ResourceUtils.mapLoadingJsonMapTour.findIndex(path => path == pathMapLoad) == -1) {
                ResourceUtils.mapLoadingJsonMapTour.push(pathMapLoad);

                jsonMap = await ResourceUtils.loadJsonAssetRemote(pathMapLoad);

                ResourceUtils.mapLoadingJsonMapTour.splice(ResourceUtils.mapLoadingJsonMapTour.findIndex(path => path == pathMapLoad), 1);
                ResourceUtils.mapCacheJsonMapTour.set(pathMapLoad, jsonMap);
            } else {
                // just only wait for 1 minute
                for (let i = 0; i < 120; i++) {
                    if (ResourceUtils.mapCacheJsonMapTour.has(pathMapLoad)) {
                        break;
                    }
                    await Utils.delay(0.5 * 1000);
                }
            }

            cb(pathMapLoad, ResourceUtils.mapCacheJsonMapTour.get(pathMapLoad));
        }
    }
    //#endregion cache map json tour
}