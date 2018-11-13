import Message from '../interface/Message'

export default class PriorityMQ<T extends Message> {
    private _queue: Array<T> = [null]
    private _fun: Function
    public constructor (fun: (m1: T, m2: T) => number) {  // 比较函数:返回值大于0表示m1优先级高于m2
        // this._queue[0] = null  // 空间换时间，减少坐标转换步骤
        this._fun = fun
    }
    public push(message: T) {
        if (message === null) {
            return false
        }
        this._queue.push(message)
        let index = this._queue.length - 1
        while (index > 1) {
            if (this._fun(this._queue[index], this._queue[index >> 1]) > 0) {
                this.swap(index,index >> 1)
                index >>= 1
            } else {
                break
            }
        }
        return true
    }
    public forEach(callBack: (value1: T) => void): void {
        this._queue.forEach(callBack)
    }
    public pop(): T {
        if (this._queue.length === 1) {
            return null
        }
        let value = this._queue[1]  // 获取队首元素
        if (this._queue.length > 2) {
            this.swap(1, this._queue.length - 1)  // 将最右端的叶子结点同队首元素调换
            this._queue.splice(this._queue.length - 1, 1)  // 将原来的队首元素从队列删除
            this.maxHeapify(1)  // 调整队列使其保持最大堆
        } else {
            this._queue.splice(1, 1)
        }
        return value
    }
    public front(): T {  // 便于执行消息失败回退
        return this._queue.length > 1 ? this._queue[1] : null
    }
    public size(): Number {
        return this._queue.length
    }
    // 用于判断消息队列是否为空
    public empty(): boolean {
        return this.size() === 1
    }
    // 清空
    public clear() {
        this._queue = [null]
    }
    // 交换两小标对应的元素
    private swap(i: number, j: number) {
        let temp = this._queue[i]
        this._queue[i] = this._queue[j]
        this._queue[j] = temp
    }
    /**
     * 堆排序
     */
    private maxHeapify(index: number) {
        while (index <= (this._queue.length - 1) >> 1) {
            let l = index << 1  // 左孩子坐标
            let r = (index << 1) + 1  // 右孩子坐标
            let larger: number  // 左右孩子优先级较高的下标
            if (r <= this._queue.length - 1) {  // 防止索引越界:避免比较函数写的不够鲁棒导致边界值不准确
                larger = this._fun(this._queue[l], this._queue[r]) > 0 ? l : r
            } else {
                larger = l
            }
            if (this._fun(this._queue[larger], this._queue[index]) > 0) {
                this.swap(index, larger)
                index = larger
            } else {
                break
            }
        }
    }
}
