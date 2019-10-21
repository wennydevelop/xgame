import HttpClient from "./HttpClient";
import GameClient from "./GameClient";
import Core from "../../core/Core";
import Log from "../../core/Log";
import { Md5 } from "../crypt/md5";

type ResponseData = { succeed: boolean, code: 0 | number, message: "success" | string, data: any }
type RequestData = { role: any, index: number, retry: number, data: any, sign?: string }

let log: Log = new Log({ tags: ["HttpClient"] })
export default class HttpGameClient extends GameClient {
    protected _client: HttpClient = new HttpClient()
    protected _requestIndex = 0;
    protected _retryCount: number = 3;

    public searchExt: () => string;

    constructor() {
        super()
    }


    /**
     * 获取token对外接口
     */
    public getToken: () => string = null;

    /**
     * 获取账号服返回的gametoken
     */
    public getGameToken: () => string = null;

    /**
     * 获取openId
     */
    public getOpenId: () => string = null;

    /**
     * 获取roleId对外接口
     */
    public getRoleId: () => string = null;

    /**
     * 获取appid
     */
    public getAppId: () => string = () => {
        throw new Error("未设置APPID")
    };

    connect() {
        //http 不需要连接
    }

    request(action, data, callback: (data: ResponseData) => void,
        { version, tag, name, modal, downloadProgress, uploadProgress, errorCallback, serverHost }: {
            version?: number,
            tag?: string,
            name?: string,
            modal?: boolean,
            downloadProgress?: (loaded: number, total: number) => void,
            uploadProgress?: (loaded: number, total: number) => void,
            errorCallback?: (error: any, retry: () => void) => void,
            serverHost?: string
        } = {}
    ) {

        this._requestIndex++;//每次请求拥有新的id
        var requestData = {
            appId: this.getAppId ? this.getAppId() : undefined,
            role: this.getRoleId ? this.getRoleId() : undefined,//请求用户
            // token:this._token,//token
            index: this._requestIndex,//请求索引
            retry: 0,//是否重试
            v: version,
            t: tag,
            name: name,
            data: data
        }

        this.requestFromData(action, requestData, callback, { modal, downloadProgress, uploadProgress, errorCallback, serverHost });
    }

    protected requestFromData(action, requestData: RequestData, callback: (data: ResponseData) => void,
        { modal, downloadProgress, uploadProgress, errorCallback, serverHost }: { modal?: boolean, downloadProgress?: (loaded: number, total: number) => void, uploadProgress?: (loaded: number, total: number) => void, errorCallback?: (error: any, retry: () => void) => void, serverHost?: string } = {},
        isRetry = false, modalIndex = -1
    ) {
        let sign = ``;
        let now = Date.now()
        // if (this.roleId) {
        let makeSign = (data): string => {

            let str = JSON.stringify(data) + (this.token || "") + now;
            // console.log(`str:`, str);
            let sign = Md5.hashStr(str) as string;
            let ary = []
            // console.log(`加密前:`, sign);
            sign.split("").forEach((c, i) => {
                ary.push(String.fromCharCode((c.charCodeAt(0) + i % 4)));
            });

            return ary.join("");
        }
        if (!serverHost) {
            sign = makeSign(requestData)
        }

        // }

        let data = JSON.stringify(requestData)
        log.warn("request", action, data);

        let search = this.searchExt ? this.searchExt() : "";

        let url: string
        if (this._protocol == "https" && this._port == 443) {
            url = `${this._protocol}://${serverHost || this._host}/${action}${search}`
        } else if (this._protocol == "http" && this._port == 80) {
            url = `${this._protocol}://${serverHost || this._host}/${action}${search}`
        } else {
            url = `${this._protocol}://${serverHost || this._host}:${this._port}/${action}${search}`
        }


        let index = modalIndex == -1 ? Core.instance.loadingIndex : modalIndex
        //重试不重复打开模态
        if (!isRetry && modal && this._showLoadingModalCallback) {
            this._showLoadingModalCallback(index, action);
        }

        let headMap: any = {}
        headMap["Content-Type"] = "application/json;charset=utf-8"
        headMap["token"] = this._token || "";
        headMap["role"] = this._roleId
        headMap["sign"] = sign;
        headMap["ts"] = now;
        headMap["appId"] = this.getAppId();

        this._client.request({
            method: "POST",
            url: url,
            data: data,
            headMap: headMap,
            onDone: (data) => {
                //进行回调
                if (typeof (data) == 'string' && data.length > 4000) {
                    //log.warn("response", action, data.substr(0, 4000))
                } else {
                    //log.warn("response", action, data);
                }

                let newData = JSON.parse(data);
                callback({
                    succeed: newData.ok, code: newData.c, message: newData.m, data: typeof newData.r == "string" ? JSON.parse(newData.r) : newData.r
                });
                if (modal && this._closeLoadingModalCallback) {
                    this._closeLoadingModalCallback(index, action);
                }

            },
            onError: (error) => {

                let retry = () => {
                    //重试函数
                    if (modal) {
                        this._showLoadingModalCallback(index, action);
                    }
                    requestData.retry++
                    this.requestFromData(action, requestData, callback, { modal: modal, downloadProgress: downloadProgress, uploadProgress: uploadProgress, errorCallback: errorCallback, serverHost }, true, index);
                }

                if (requestData.retry > this._retryCount) {
                    //多次请求无果

                    if (errorCallback) {
                        errorCallback(error, retry);//当请求捕获错误时，则不进行全局错误回调
                    } else if (this._errorCallback) {
                        this._errorCallback(error, retry)
                    }
                    if (modal && this._closeLoadingModalCallback) {
                        this._closeLoadingModalCallback(index, action);
                    }
                    //log.error("多次请求无果");
                } else {
                    requestData.retry++
                    this.requestFromData(action, requestData, callback, { modal: modal, downloadProgress: downloadProgress, uploadProgress: uploadProgress, errorCallback: errorCallback, serverHost }, true, index);
                }
                //log.error(`OnError:`, error);
                if (requestData.retry > this._retryCount && ((error as string).indexOf('ssl hand shake error') != -1 || (error as string).indexOf('证书无效') != -1)) {
                    if (this._sslHandShakeErrorCallBack) {
                        this._sslHandShakeErrorCallBack(index, action)
                    }
                }
            },
            onTimeout: () => {
                //超时进行重试

                let retry = () => {
                    //重试函数
                    if (modal) {
                        this._showLoadingModalCallback(index, action);
                    }
                    requestData.retry++
                    this.requestFromData(action, requestData, callback, { modal: modal, downloadProgress: downloadProgress, uploadProgress: uploadProgress, errorCallback: errorCallback, serverHost }, true, index);
                }

                if (requestData.retry > this._retryCount) {
                    //多次请求无果
                    if (errorCallback) {
                        errorCallback("timeout", retry);//当请求捕获错误时，则不进行全局错误回调
                    } else if (this._errorCallback) {
                        this._errorCallback("timeout", retry)
                    }
                    if (modal && this._closeLoadingModalCallback) {
                        this._closeLoadingModalCallback(index, action);
                    }
                    //log.error("多次请求无果");
                } else {
                    requestData.retry++
                    this.requestFromData(action, requestData, callback, { modal: modal, downloadProgress: downloadProgress, uploadProgress: uploadProgress, errorCallback: errorCallback, serverHost }, true, index);
                }
            },
            onProgress: (loaded: number, total: number) => {
                if (downloadProgress) {
                    downloadProgress(loaded, total)
                }
            },
            onUploadProgress: (loaded: number, total: number) => {
                if (uploadProgress) {
                    uploadProgress(loaded, total)
                }
            }
        })
    }

    get retryCount() {
        return this._retryCount
    }
    set retryCount(value) {
        this._retryCount = value
    }

    get client() {
        return this._client;
    }
}