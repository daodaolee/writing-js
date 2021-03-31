class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * 绑定订阅
   * @param {String} eventType 事件类型
   * @param {Function} cb 回调函数
   * 1. 如果没有监听者，就初始化一个数组
   * 2. 如果有监听者，数组就push
   */
  on(eventType, cb) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(cb);
  }
  /**
   * 移除订阅
   * @param {String} eventType 事件类型
   * @param {Function} cb 回调函数
   * 1. 如果当前事件存在监听者，就移除它
   * 2. 如果没有监听了，就删除该事件类型
   */
  off(eventType, cb) {
    let index = this.listeners[eventType].findIndex((fn) => fn == cb);
    if (index !== -1) {
      this.listeners[eventType].splice(index, 1);
    }
    if (!cb || !this.listeners[eventType].length) {
      delete this.listeners[eventType];
    }
  }

  /**
   * 绑定事件监听
   * @param {String} eventType 事件类型
   * @param {arg} args 参数
   * 如果当前事件有监听者，就执行
   */
  emit(eventType, ...args) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach((cb) => {
        cb(...args);
      });
    }
  }
}

let ee = new EventEmitter();
ee.on("eat", () => {
  console.log("开饭了！")
})
ee.emit("eat");
ee.off("eat")
