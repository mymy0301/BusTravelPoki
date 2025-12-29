import { find, RenderTexture, Camera, instantiate, screen, isValid, Node, UITransform } from "cc";
let captureCamera = null;
/**
 * @author ccbbs
 * @file 屏幕截取，长按分享
 * @version 1.0.0
 * @date 2021-12-29
 * @example 
 * ```js
 * //创建截图摄像机
 * createCaptureCamera().then(()=>{
 * captureScreen();//截图
 * getScreenData();//获得屏幕数据
 * })
 * 
 * setCaptureCameraVisibility(1).then(()=>{
 * captureScreen();//截图
 * getScreenData();//获得屏幕数据
 * })
 * ```
 */

const removeCamera = function () {
    captureCamera.node.destroy();
}

const _getRenderData = function (camera: Camera,width:number,height:number) {
    const _texture = camera.targetTexture;
    return toB64(_texture.readPixels(), _texture,width,height);
}
function toB64(arrayBuffer: Uint8Array, RTex: RenderTexture,width:number,height:number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // console.log(canvas.width);
    // console.log(canvas.height);
    // console.log(Math.floor(RTex.width));
    // console.log(Math.floor(RTex.height));

    // const widthW = canvas.width = Math.floor(RTex.width);
    // const heightH = canvas.height = Math.floor(RTex.height);
    // canvas.width = width;
    // canvas.width = height;

    // console.log(canvas.width);
    // console.log(canvas.height);

    // console.log(Math.floor(RTex.width));
    // console.log(Math.floor(RTex.height));

    canvas.width = width;
    canvas.height = height;

    const rowBytes = width * 4;//bytes amount in each row
    for (let row = 0; row < height; row++) {
        const srow = height - 1 - row;
        const imageData = ctx.createImageData(width, 1);
        const start = srow * width * 4;
        for (let i = 0; i < rowBytes; i++) {
            imageData.data[i] = arrayBuffer[start + i];
        }
        ctx.putImageData(imageData, 0, row);
    }
    return canvas.toDataURL('image/jpeg', 0.8);
}
export type screenPixelArrayType = [number, number, number, number][]
function formatScreenPixel(arrayBuffer: Uint8Array): screenPixelArrayType[] {
    const width = Math.floor(screen.windowSize.width);
    const height = Math.floor(screen.windowSize.height);
    const rowBytes = width * 4;//bytes amount in each row
    const screenPixelArray: screenPixelArrayType[] = [];
    for (let row = 0; row < height; row++) {
        const srow = height - 1 - row;
        const start = srow * width * 4;
        const rowArray: screenPixelArrayType = [];
        screenPixelArray[row] = rowArray;
        for (let i = 0; i < rowBytes; i += 4) {
            rowArray.push([arrayBuffer[start + i], arrayBuffer[start + i + 1], arrayBuffer[start + i + 2], arrayBuffer[start + i + 3]]);
        }
    }
    return screenPixelArray;
}
const _createImg = function (data: string) {
    const img = document.createElement("img");
    const gameDiv = document.getElementById('Cocos3dGameContainer');
    img.src = data;
    img.style.position = 'absolute';
    img.width = gameDiv.clientWidth;
    img.height = gameDiv.clientHeight;
    img.style.left = '0';
    img.style.top = '0';
    img.style.opacity = '0.01';
    gameDiv.appendChild(img);
    return img;
}

function removeImg(img) {
    img.parentNode.removeChild(img);
}

function createRenderTexture(camera: Camera, node? : Node) {
    const texture = new RenderTexture();
    if(node != undefined){
        let uiTransform = node.getComponent(UITransform)
        var width = uiTransform.width
        var height = uiTransform.height
    }else{
        width = screen.windowSize.width
        height = screen.windowSize.height;
    }
    texture.initialize({
        width,
        height
    })
    camera.targetTexture = texture;
}

function judgeCaptureCameraValid() {
    if (!isValid(captureCamera)) {
        throw new SyntaxError('please execute  function:createCaptureCamera first');
    }
}
function backNextTickPromise(): Promise<any> {
    return new Promise(resolve => requestAnimationFrame(resolve))
}
function captureNode(_node : Node,_camera:Camera): Promise<void>{
    // const _cameraNode = instantiate(_node);
    // _cameraNode.parent = _node.parent;
    // const comp = _cameraNode.getComponent(Camera);
    createRenderTexture(_camera, _node);
    captureCamera = _camera;
    return backNextTickPromise();
}
function createCaptureCamera(): Promise<void> {
    const _node = find('Canvas/Camera');
    const _cameraNode = instantiate(_node);
    _cameraNode.parent = _node.parent;
    const comp = _cameraNode.getComponent(Camera);
    createRenderTexture(comp);
    captureCamera = comp;
    return backNextTickPromise();
}
function setCaptureCameraVisibility(visibility: number): Promise<void> {
    judgeCaptureCameraValid();
    captureCamera.visibility = visibility;
    return backNextTickPromise();
}
function captureScreen(): HTMLImageElement {
    // judgeCaptureCameraValid();
    // const _data = _getRenderData(captureCamera);
    // const _img = _createImg(_data);
    // return _img;
    return null;
}

function getBase64(_camera:Camera,width:number,height:number){
    // judgeCaptureCameraValid();
    return _getRenderData(captureCamera,width,height);
}

function getScreenData(): screenPixelArrayType[] {
    judgeCaptureCameraValid();
    return formatScreenPixel(captureCamera.targetTexture.readPixels());
}

export {
    setCaptureCameraVisibility,
    createCaptureCamera,
    captureScreen,
    getScreenData,
    removeCamera,
    removeImg,
    getBase64,
    captureNode,
};