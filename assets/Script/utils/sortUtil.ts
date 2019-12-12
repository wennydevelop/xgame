
export default class sortUtil{
    protected static _instance: sortUtil
    public static get instance():sortUtil{
        if(!this._instance){
            this._instance = new sortUtil();
        }
        return this._instance;
    }

    test(){
        let a = [12,3,6,2,9,4,1,8,7,19,15,13,16,18,28,26,27,33,38,35,37,36,32,31,5,6,8,2,99,100,85,62,72,1]
        a = this.s_bubble(a);
    }

    // 冒泡
    s_bubble(arr:number[]):number[]{
        let len:number= arr.length;
        let tmp:number = 0;
        for(let i=0;i<len;i++){
            for(let j=i+1;j<len;j++){
                if(arr[i]>arr[j]){
                    tmp=arr[i];
                    arr[i]=arr[j];
                    arr[j]=tmp;
                }
            }
        }
        return arr;
    }

    // 快速
    s_quick(arr:number[]):number[]{
        let qUpSort = (resArr: number[], left: number, right: number) => {
            if (right <= left) {
                console.log("sort end left: " + left + " right: " + right);
                return;
            }
            let initLeft: number = left;
            let initRight: number = right;

            let keyNum: number = resArr[left];
            while (right > left) {
                while (right > left && resArr[right] > keyNum) {
                    right--;
                }
                resArr[left] = resArr[right];
                resArr[right] = keyNum;

                while (right > left && resArr[left] < keyNum) {
                    left++;
                }
                resArr[right] = resArr[left];
                resArr[left] = keyNum;
            }

            qUpSort(resArr, initLeft, left - 1);
            qUpSort(resArr, left + 1, initRight);

        }

        qUpSort(arr, 0, arr.length);
        return arr;
    }
}