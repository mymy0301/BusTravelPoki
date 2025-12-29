import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

const ZipCache = new Map<string, any>();
const ResCache = new Map<string, any>();

const enable = true;
@ccclass('ZipLoader')
export class ZipLoader{
    // private static _ins: ZipLoader;
    // private inited: boolean = false;
    // static get ins() {
    //     if (!this._ins) {
    //         this._ins = new ZipLoader();
    //     }
    //     return this._ins;
    // }

    // constructor() {
    //     if (!enable) return;
    //     if (window["canloadZipFile"] == "yes") {
    //         this.init();
    //     }
    // }

    // downloadZip(path: string) {
    //     if (!enable) return;
    //     return new Promise((resolve) => {
    //         fetch(`${path}.zip`)
    //             .then((response) => response.blob())
    //             .then((blob: Blob) => {
    //                 this.init();
    //                 resolve(blob);
    //             })
    //             .catch((error) => {
    //                 window["canloadZipFile"] = "no";
    //                 console.warn("BLOCK LOAD ZIP");
    //                 resolve(null);
    //             });
    //     });
    // }

    // /**
    //  * load and unzip file
    //  * @param path filePath
    //  */
    // async loadCombieZip(zipBundles: string[], progressCallback?: Function) {
    //     if (!enable) return;
    //     const loadZipPs = zipBundles.map((name: string) => {
    //         return ZipLoader.ins.loadZip(`${name}`);
    //     });
    //     await this.allProgress(loadZipPs, progressCallback);
    //     console.log("cache json size: ", ZipCache.size);
    // }
    // async loadZip(path: string) {
    //     if (!enable) return;
    //     if (window["canloadZipFile"] == "no") {
    //         console.warn("BLOCK LOAD ZIP");
    //         return;
    //     }
    //     // const jsZip = JSZip();

    //     // download
    //     if (window["files"] && Array.isArray(window["files"])) {
    //         const obj = window["files"].find((data) => data.path == path);
    //         if (obj) {
    //             this.init();
    //             var zipBuffer = obj.file;
    //             console.log("cache zip : ", path);
    //         }
    //     }
    //     if (!zipBuffer) {
    //         zipBuffer = await this.downloadZip(`assets/remote/${path}`);
    //         console.log("cache load in intro zip : ", path);
    //     }

    //     if (!zipBuffer) return;
    //     // unzip
    //     const zipFile = await jsZip.loadAsync(zipBuffer);

    //     //console.log("zipFile : ", zipFile);
    //     // Parsing the zip file, concatenating paths, bundle names, and file names, and storing them directly in a Map
    //     zipFile.forEach((key, data) => {
    //         if (data.dir) return;
    //         // console.log(key, data);
    //         ZipCache.set("assets" + "/" + key, data);
    //     });
    // }

    // init() {
    //     if (!enable) return;
    //     if (this.inited) return;
    //     this.inited = true;
    //     //handle load json
    //     const accessor = Object.getOwnPropertyDescriptor(
    //         XMLHttpRequest.prototype,
    //         "response"
    //     );
    //     Object.defineProperty(XMLHttpRequest.prototype, "response", {
    //         get: function () {
    //             if (this.zipCacheUrl) {
    //                 const res = ResCache.get(this.zipCacheUrl);
    //                 return this.responseType === "json" ? JSON.parse(res) : res;
    //             }
    //             return accessor.get.call(this);
    //         },
    //         set: function (str) {
    //             //console.log("set responseText: %s", str);
    //             return accessor.set.call(this, str);
    //         },
    //         configurable: true,
    //     });

    //     // Intercepting 'open'
    //     const oldOpen = XMLHttpRequest.prototype.open;
    //     // @ts-ignore
    //     XMLHttpRequest.prototype.open = function (
    //         method,
    //         url,
    //         async,
    //         user,
    //         password
    //     ) {
    //         // Record resource if it exists
    //         if (ZipCache.has(url as string)) {
    //             this.zipCacheUrl = url;
    //         }
    //         return oldOpen.apply(this, arguments);
    //     };

    //     // Intercepting 'send'
    //     const oldSend = XMLHttpRequest.prototype.send;
    //     XMLHttpRequest.prototype.send = function (data) {
    //         if (this.zipCacheUrl) {
    //             // Skip parsing if cached
    //             if (!ResCache.has(this.zipCacheUrl)) {
    //                 const cache = ZipCache.get(this.zipCacheUrl);
    //                 if (this.responseType === "json") {
    //                     cache.async("text").then((text) => {
    //                         ResCache.set(this.zipCacheUrl, text);
    //                         this.onload();
    //                     });
    //                 } else {
    //                     cache.async(this.responseType).then((res) => {
    //                         ResCache.set(this.zipCacheUrl, res);
    //                         this.onload();
    //                     });
    //                 }
    //             } else {
    //                 // Call onload after parsing and avoid making real network requests
    //                 this.onload();
    //             }
    //             return;
    //         }
    //         return oldSend.apply(this, arguments);
    //     };
    // }

    // private allProgress(
    //     promises: Promise<void>[],
    //     progressCallback?: Function
    // ) {
    //     if (progressCallback) {
    //         let d = 0;
    //         progressCallback(0);
    //         for (const p of promises) {
    //             p.then(() => {
    //                 d++;
    //                 console.log(d, promises.length);
    //                 progressCallback(d / promises.length);
    //             });
    //         }
    //     }

    //     return Promise.all(promises);
    // }
}


