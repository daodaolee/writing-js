let orIds = 0;
let odIds = 0;

class Observer {
  constructor() {
    this.orIds++;
  }
  /**
   * 观察者只需要操作数据就可以了
   * @param  {...any} args 参数
   */
  update(...args) {
    console.log(`更新了：${args}`);
  }
}

class Observed {
  constructor() {
    this.odIds++;
    this.observers = [];
  }

  /**
   * 添加观察者
   * @param {any} obr 要观察的实例
   */
  add(obr) {
    this.observers.push(obr);
  }

  /**
   * 移除观察者
   * @param {any} obr 正在观察的实例
   */
  remove(obr) {
    this.observers = this.observers.filter((ob) => {
      return ob.id != obr.id;
    });
  }

  /**
   * 通知观察者
   * @param  {...any} args 通知的具体参数
   */
  notify(...args){
    this.observers.forEach(obr => {
      obr.update(...args);
    })
  }
}

let obd = new Observed();

let obr1 = new Observer();
let obr2 = new Observer();

obd.add(obr1);
obd.add(obr2);
// 通知所有观察者
obd.notify("通知了！");
