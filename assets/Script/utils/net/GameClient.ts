export default abstract class GameClient {

    protected _roleId: number | string//角色Id
    protected _token: any//登陆授权
    protected _serverTimeOffset: number = 0;//与服务器的时间差

    protected _protocol: string = "https"//协议
    protected _host: string = "localhost"//主机名
    protected _port: number = 443//端口号

    protected _messageCallback: Function
    protected _errorCallback: (error: any, retry: () => void) => void;
    protected _disconnectCallback: Function

    protected _sslHandShakeErrorCallBack: Function;  //客户端时间不对导致握手错误
    protected _openId: string = '';
    protected _showLoadingModalCallback: (index: number, url: string) => void = null;//显示模态化遮挡层
    protected _closeLoadingModalCallback: (index: number, url: string) => void = null;//隐藏模态遮挡层

    constructor() {

    }

    /**
     * 发起连接，如果已经连接将重新连接
     */
    abstract connect();

    /**
     * 发起对服务器的请求
     */
    abstract request(action, data, callback);

    /**
     * 设置服务器推送的消息回调
     */
    setMessageCallback(callback) {
        this._messageCallback = callback
    }

    /**
     * 当发生错误时的统一回调
     */
    setErrorCallback(callback: (error: any, retry: () => void) => void) {
        this._errorCallback = callback;
    }

    /**
     * 设置断开连接回调
     */
    setDisconnectCallback(callback) {
        this._disconnectCallback = callback;
    }

    get roleId(): number | string {
        return this._roleId
    }

    set roleId(value: number | string) {
        this._roleId = value
    }

    get token() {
        return this._token
    }

    set token(value) {
        this._token = value
    }

    get serverTimeOffset() {
        return this._serverTimeOffset
    }

    set serverTimeOffset(value) {
        this._serverTimeOffset = value;
    }

    get host() {
        return this._host
    }

    set host(value) {
        this._host = value
    }

    get port() {
        return this._port
    }

    set port(value) {
        this._port = value
    }

    get protocol() {
        return this._protocol
    }

    set protocol(value) {
        this._protocol = value
    }

    get openId() {
        return this._openId;
    }

    set openId(value) {
        this._openId = value;
    }

    /**
     * 获取当前服务器时间
     */
    get serverTime(): Date {
        return new Date(new Date().getTime() + this._serverTimeOffset);
    }

    public set showModalCallback(callback: (index: number, url: string) => void) {
        this._showLoadingModalCallback = callback;
    }

    public set closeModalCallback(callback: (index: number, url: string) => void) {
        this._closeLoadingModalCallback = callback;
    }

    public set sslHandShakeErrorCallBack(callback: (index: number, url: string) => void) {
        this._sslHandShakeErrorCallBack = callback;
    }


}