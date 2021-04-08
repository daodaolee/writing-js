const resolvePromise = (newPromise, x, resolve, reject) => {
  // 2.3. 如果返回的 promise1 和 x 是指向同一个引用（循环引用），则抛出错误
  if (newPromise === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }

  // 2.3.3.3.3 resolvePromise 和 rejectPromise 已经被
  //调用或以相同的参数多次调用的话吗，优先第一次的调用，并且之后的调用全部被忽略（避免多次调用）
  let called;
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 2.3.3 x是个函数类型或者对象类型
    try {
      // 2.3.3.1 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候)
      let then = x.then;
      if (typeof then === "function") {
        // 2.3.3.3 根据 promise 的状态决定是成功还是失败
        then.call(
          x,
          (y) => {
            // 是不是第一次
            if (called) return;
            called = true;
            // 2.3.3.3.1 递归解析，因为可能promise里还有promise
            resolvePromise(newPromise, y, resolve, reject);
          },
          (r) => {
            // 2.3.3.3.2 有一个失败就失败
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 2.3.3.4 如果 then 不是函数类型，直接 resolve x（resolve(x)）
        resolve(x);
      }
    } catch (err) {
      // 2.3.3.2
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    // 2.3.4 x是个普通值，直接resolve(x)
    resolve(x);
  }
};
class Promise {
  constructor(executor) {
    /**
     * 规范 1
     * value：一个值，除了正常的值之外，还可以是 undefined，thenable，promise
     * reason：一个表明 promise 失败的原因的值
     */
    this.value = undefined;
    this.reason = undefined;

    /**
     * 规范 2.1
     * promise 只会是以下三种状态之一
     * 1. pending：可能会变成 fulfilled 或者 rejected
     * 2. fulfilled：必须有一个 value，并且状态不能是 `===`，状态可以被改变
     * 3. rejected：必须有一个 reason，并且状态不能是 `===`，状态可以被改变
     */
    this.status = "pending";

    /**
     * 放置两个等待执行的队列
     * 因为如果executor是同步代码还好，如果是定时器等宏任务的话，
     * status就一直是pending，而且then会自己走完，什么也拿不到
     * 所以放置队列，等executor执行完毕再执行then的逻辑
     */
    this.onFulfilledTasks = [];
    this.onRejectedTasks = [];

    /**
     * 状态为 fulfilled 之后的回调
     */
    let resolve = (value) => {
      if (this.status === "pending") {
        //状态为 pending 时才可以更新状态，防止 executor 中调用了两次 resovle/reject 方法
        this.status = "fulfilled";
        this.value = value;

        // 队列里的任务开始执行
        this.onFulfilledTasks.forEach((fn) => fn());
      }
    };

    /**
     * 状态为 rejected 之后的回调
     */
    let reject = (reason) => {
      if (this.status === "pending") {
        //状态为 pending 时才可以更新状态，防止 executor 中调用了两次 resovle/reject 方法
        this.status = "rejected";
        this.reason = reason;

        // 队列里的任务开始执行
        this.onRejectedTasks.forEach((fn) => fn());
      }
    };

    /**
     * 开始正式执行代码，报错就执行失败逻辑
     */
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  /**
   * 规范 2.2
   * 包含一个 then 方法，接收连个参数：onFulfilled，onRejected
   */
  then(onFulfilled, onRejected) {
    // 规范 2.2.1 / 2.2.5/ 2.2.7.3 / 2.2.7.4
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    //规范 2.2.7，每次调用then都会返回一个新的promise
    let newPromise = new Promise((resolve, reject) => {
      // 成功状态
      if (this.status === "fulfilled") {
        // 2.2.4 使用setTimeout
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            // x可能是一个promsise
            resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            // 规范 2.2.7.2
            reject(err);
          }
        }, 0);
      }

      // 失败状态
      if (this.status === "rejected") {
        // 2.2.3
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      }

      // 等待状态，可能executor是同步的没执行完，也可能executor是异步的还没执行
      // 所以要将onFulfilled 和 onRejected 函数存起来，等executor完毕（也就是状态确定后）再执行它们
      if (this.status === "pending") {
        this.onFulfilledTasks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(newPromise, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
        this.onRejectedTasks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(newPromise, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      }
    });
    return newPromise;
  }
}

// 测试时打开
// Promise.defer = Promise.deferred = function () {
//   let dfd = {};
//   dfd.promise = new Promise((resolve, reject) => {
//     dfd.resolve = resolve;
//     dfd.reject = reject;
//   });
//   return dfd;
// };
// module.exports = Promise;
