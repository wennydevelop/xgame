import logicChain, { logicResult } from "../Utils/logicChain";

/**
 * 登陆
 */
export default class login extends logicChain {
    protected async logic(data: any): Promise<logicResult> {
        return new Promise<logicResult>((resolve, reject) => {
            let reuslt = new logicResult
            let loginLogic;

            loginLogic = async () => {
                let loginCallback = (data) => {
                    // 数据处理
 
                    // 向下传递数据
                    reuslt.nextData = {
                        data:{
                            data:data
                        }
                    }
                    resolve(reuslt)   
                }
                try {
                    
                    //await gssdk.login({});
                    console.log("登录完成")
                    
                    loginCallback({});
                } catch (e) {
                    console.error('登录异常:', e)
                }
            }

            setTimeout(() => {
                loginLogic();
            }, 3000);
        })
    }
}