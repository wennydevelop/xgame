
class loadUtils {
    protected async _loadRes(path: string, type: typeof cc.Asset) {
        return new Promise<cc.Asset>((resolve, reject) => {
            cc.loader.loadRes(path, type, (error: Error, res: cc.Asset) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(res);
                }
            })
        });
    }

    async loadRes(path: string, type: typeof cc.Asset) {
        while (true) {
            try {
                let res = await this._loadRes(path, type);
                return res;
            } catch (error) {
                console.error(error);
                //await commonUtils.sleep(1);
            }
        }
    }

    protected async _loadDir(url: string, type: typeof cc.Asset) {
        return new Promise<cc.Asset[]>((resolve, reject) => {
            cc.loader.loadResDir(url, type, (error: Error, resources: cc.Asset[]) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(resources);
                }
            })
        });
    }

    async loadDir(url: string, type: typeof cc.Asset) {
        while (true) {
            try {
                let res = await this._loadDir(url, type);
                return res;
            } catch (error) {
                console.error(error);
                //await commonUtils.sleep(1);
            }
        }
    }

    protected async _loadScene(sceneName: string) {
        return new Promise((resolve, reject) => {
            cc.director.preloadScene(sceneName, null, (error: Error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }

    async loadScene(sceneName: string) {
        while (true) {
            try {
                await this._loadScene(sceneName);
                break;
            } catch (error) {
                console.error(error);
                //await commonUtils.sleep(1);
            }
        }
    }

    async updateSpriteFrame(sprite: cc.Sprite, url: string) {
        sprite.spriteFrame = await this.loadRes(url, cc.SpriteFrame) as cc.SpriteFrame;
    }

    // 节点设置本地图片
    loadSpriteFrame(url: string, spriteComponent?: cc.Sprite, callFunc?: Function) {
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                console.log(`本地图片加载失败: `, err);
            } else if (cc.isValid(spriteComponent)) {
                spriteComponent.spriteFrame = frame;
            }

            if (callFunc) {
                callFunc(frame, err);
            }
        })
    }
    // 节点设置远程图片
    loadRemoteSprite(url: string, sp: cc.Sprite, callFunc?: Function) {
        if (!url || url == "") {
            console.error("远程图片地址不能未空!");
            return;
        }
        sp.spriteFrame = null;
        cc.loader.load(url, (err, texture) => {
            if (err) {
                console.error(`远程图片加载失败: `, err);
            } else if (cc.isValid(sp)) {
                sp.spriteFrame = new cc.SpriteFrame(texture);
            }
            if (callFunc) {
                callFunc(texture, err);
            }
        })
    }

    /**释放资源及资源引用到的资源 */
    releaseAssetRecursively(res: cc.Asset) {
        if (!res) return;
        //if (res.isLock()) return;

        let urls = cc.loader.getDependsRecursively(res);
        for (let url of urls) {
            let asset = cc.loader.getRes(url);
            if (asset) {
                cc.loader.releaseAsset(asset);
            }
        }
        cc.loader.releaseAsset(res);
    }
}

let loadUtil = new loadUtils();
export default loadUtil