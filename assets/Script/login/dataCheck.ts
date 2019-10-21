import logicChain, { logicResult } from "../Utils/logicChain";

/**
 * 数据检查
 */
export default class dataCheck extends logicChain {
    protected async logic(): Promise<logicResult> {
        return new Promise<logicResult>((resolve, reject) => {
            let reuslt = new logicResult

            //向下传递数据
            reuslt.nextData = {
                data: {}
            }
            resolve(reuslt)
        })
    }
}