interface Array<T>{
    /**
     * 通过key value 查找 获取结果集
     */
    whereEqual(key,value):Array<T>;

    /**
     * 通过表达式查找 获取结果集
     */
    where(callback:(a:T)=>boolean):Array<T>;

    /**
     * 统计数量
     */
    countEqual(key,value):number;

    /**
     * 统计数量
     */
    count(callback:(a:T)=>boolean):number;

    /**
     * 使用表达式进行排序
     */
    orderBy(callback:(a:T)=>number):Array<T>;

    /**
     * 使用表达式进行倒叙排序
     */
    orderByDescing(callback:(a:T)=>number):Array<T>;

    /**
     * 获取结果集第一个对象
     */
    single:T;

    /**
     * 遍历数组
     */
    foreach(callback:(a:T)=>void):Array<T>;

    /**
     * 从列表中移除对象列表
     */
    remove(list:Array<T>):Array<T>;

    /**
     * 从列表中移除某个对象
     */
    remove(item:T):Array<T>;

    /**
     * 通过数组索引移除对象
     */
    remove(index:number):Array<T>;

    /**
     * 通过表达式移除对象
     */
    deleteWhere(callback:(a:T)=>void):Array<T>;

    /**
     * 计算某表达式的和
     */
    sum(callback:(a:T)=>number):number;

    /**
     * 计算某表达式的乘积
     */
    multiplied(callback:(a:T)=>number):number;

    /**
     * 存入一个数组
     */
    pushList(array:Array<T>):Array<T>;

    /**
     * 当所有元素都满足条件，返回true，否则返回false
     */
    and(callback:(a:T)=>boolean):boolean

    /**
     * 当有一个元素满足条件，返回true，否则返回false
     */
    or(callback:(a:T)=>boolean):boolean


    /**
     * 查找出最大的值
     */
    max(callback:(a:T)=>number):T

    /**
     * 查找出最小的值
     */
    min(callback:(a:T)=>number):T

    /**
     * 将二维数组降为一唯数组
     * 例:[[1,2,3],[4,5,6]]=>[1,2,3,4,5,6]
     */
    unpack():T;
}
