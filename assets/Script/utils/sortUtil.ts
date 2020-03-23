
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

    // 冒泡排序
    s_bubble(arr:number[]):number[]{
        let len:number= arr.length;
        let tmp:number = 0;
        let isSwap:boolean=true;
        for(let i=0;i<len;i++){
            // 如果有一次循环中没有产生交换,则说明数组已经是有序的
            if(!isSwap){ break;}
            isSwap=false;
            for(let j=i+1;j<len;j++){
                if(arr[i]>arr[j]){
                    tmp=arr[i];
                    arr[i]=arr[j];
                    arr[j]=tmp;
                    isSwap=true;
                }
            }
        }
        return arr;
    }

    // 快速排序
    s_quick(arr:number[]):number[]{
        let qUpSort = (resArr: number[], left: number, right: number) => {
            if (right <= left) {
                //console.log("sort end left: " + left + " right: " + right);
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

    // 选择排序
    s_select(arr:number[]):number[]{
        for(let i=0;i<arr.length;i++){
            let minIndex:number=0;
            for(let j=i+1;j<arr.length;j++){
                if(arr[minIndex]>arr[j]){ 
                    minIndex=j;
                }
            }
            if(minIndex!=i){
                let tmp=arr[i];
                arr[i]=arr[minIndex];
                arr[minIndex]=tmp;
            }
        }
        return arr;
    }

    // classic argorithm begin //

    // 扑克洗牌
    shuffle(arr:number[]):number[]{
        for(let i=arr.length-1;i>0;i--){
            let index = Math.floor(Math.random()*i);
            let tmp = arr[i];
            arr[i] = arr[index];
            arr[index]=tmp;
        }
        return arr;
    }

    // classic argorithm end   //
}