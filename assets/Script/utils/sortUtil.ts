
export default class sortUtil {
    protected static _instance: sortUtil
    public static get instance(): sortUtil {
        if (!this._instance) {
            this._instance = new sortUtil();
        }
        return this._instance;
    }

    test() {
        let a = [12, 3, 6, 2, 9, 4, 1, 8, 7, 19, 15, 13, 16, 18, 28, 26, 27, 33, 38, 35, 37, 36, 32, 31, 5, 6, 8, 2, 99, 100, 85, 62, 72, 1]
        a = this.s_bubble(a);
    }

    // 冒泡排序
    s_bubble(arr: number[]): number[] {
        let len: number = arr.length;
        let tmp: number = 0;
        let isSwap: boolean = true;
        for (let i = 0; i < len; i++) {
            // 如果有一次循环中没有产生交换,则说明数组已经是有序的
            if (!isSwap) { break; }
            isSwap = false;
            for (let j = i + 1; j < len; j++) {
                if (arr[i] > arr[j]) {
                    tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                    isSwap = true;
                }
            }
        }
        return arr;
    }

    // 快速排序
    s_quick(arr: number[]): number[] {
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
    s_select(arr: number[]): number[] {
        for (let i = 0; i < arr.length; i++) {
            let minIndex: number = 0;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[minIndex] > arr[j]) {
                    minIndex = j;
                }
            }
            if (minIndex != i) {
                let tmp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = tmp;
            }
        }
        return arr;
    }

    // classic argorithm begin //

    // 扑克洗牌
    shuffle(arr: number[]): number[] {
        for (let i = arr.length; i > 0; i--) {
            let index = Math.floor(Math.random() * i);
            let tmp = arr[i - 1];
            arr[i - 1] = arr[index];
            arr[index] = tmp;
        }
        return arr;
    }

    // 字符串匹配 kmp 在文本 text 中寻找模式串 pattern，返回所有匹配的位置开头
    // site:http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html
    kmp_match(text: string, pattern: string) {
        let positions: number[] = [];
        let maxMatchLengths: number[] = this.calculateMaxMatchLengths(pattern);
        console.log(`匹配串: ${text}`);
        console.log(`模式串: ${pattern}`);
        console.log(`最大匹配数表: ${maxMatchLengths.join(`-`)}`);
        let count = 0;
        for (let i = 0; i < text.length; i++) {
            while (count > 0 && pattern.charAt(count) != text.charAt(i)) {
                count = maxMatchLengths[count - 1];
            }
            if (pattern.charAt(count) == text.charAt(i)) {
                count++;
            }
            if (count == pattern.length) {
                positions.push(i - pattern.length + 1)
                count = maxMatchLengths[count - 1];
            }
        }
        console.log(`匹配结果: ${positions.join("-")}`);
        return positions;
    }
    // 构造模式串 pattern 的最大匹配数表
    protected calculateMaxMatchLengths(pattern: string): number[] {
        let maxMatchLengths: number[] = [];
        for (let i = 0; i < pattern.length; i++) { maxMatchLengths[i] = 0; }
        let maxLength: number = 0;
        maxMatchLengths[0] = 0;
        for (let i = 1; i < pattern.length; i++) {
            while (maxLength > 0 && pattern.charAt(maxLength) != pattern.charAt(i)) {
                maxLength = maxMatchLengths[maxLength - 1];
            }
            if (pattern.charAt(maxLength) == pattern.charAt(i)) {
                maxLength++;
            }
            maxMatchLengths[i] = maxLength;
        }
        return maxMatchLengths;
    }

    /**
     * 只出现一次的数字
     * 给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素
     */
    public getOne(a: number[]) {
        // 运用异或运算
        // 异或运算 同为真 结果大于0 异为假 结果等于0 
        // 异或运算满足交换律 a ^ b = c c ^ a = b
        // 因此将数组内元素异或一遍即可得到 这个只出现一次的数字
    }

    // classic argorithm end   //
}