/**
 * apply 和 call 目的是改变 this 的指向
 * 二者用法基本相同，只有后面带的参数不一样
 * apply传数组，call把参数全列出来
 *
 * 网上一个通俗易懂的说法：
 * << 猫吃鱼，狗吃肉，奥特曼打小怪兽 >>
 * -> 狗吃鱼：猫.吃鱼.call(狗, 鱼)
 * -> 猫打小怪兽： 奥特曼.打小怪兽.call(猫, 小怪兽)
 *
 * 可以看出来 .call 的前面一定是一个 Function
 */

/**
 * 以下是各自的属性和方法
 */
let cat = {
  name: "猫",
  eatFish() {
    console.log(`${this.name} 吃鱼中！`);
  },
};
let dog = {
  name: "狗",
  eatMeat() {
    console.log(`${this.name} 吃肉中！`);
  },
};
let ultraman = {
  name: "迪迦",
  fight() {
    console.log(`${this.name} 打小怪兽中！`);
  },
};

/**
 * 现在狗要吃鱼，按照这个逻辑
 * 猫.吃鱼.call(狗, 鱼)
 */
cat.eatFish.call(dog, "狗");
cat.eatFish.apply(dog, ["狗"]);

/**
 * 现在猫要打奥特曼，按照这个逻辑
 * 奥特曼.打小怪兽.call(猫, 小怪兽)
 */
ultraman.fight.call(cat, "猫");
ultraman.fight.apply(cat, ["猫"]);

/**
 * 手写call
 * 以狗吃鱼为例
 * 1. 猫的吃鱼方法要赋值给狗
 * 2. 执行狗吃鱼
 * 3. 狗吃完鱼要删掉会吃鱼这个方法
 *
 * @param {any} context 传进来的上下文，也就是狗
 */
Function.prototype.defineCall = function (context, ...args) {
  // 不传狗，默认是window
  var context = context || window;
  // 狗添加一个方法，指向猫的吃鱼方法，也就是this
  context.fn = this;
  // 狗可以吃各种鱼，也就是可能有多个参数
  let result = context.fn(...args);
  // 删除狗会吃鱼
  delete context.fn;
  return result;
};
//把鱼的种类加进去
let cat = {
  name: "猫",
  eatFish(...args) {
    console.log(`${this.name} 吃鱼中！吃的是：${args}`);
  },
};
cat.eatFish.defineCall(dog, "三文鱼", "金枪鱼", "鲨鱼");

/**
 * 手写apply
 * apply和call类似， 只不过最后一个参数是数组
 */
Function.prototype.defineApply = function (context, arr) {
  var context = context || window;
  let result;
  context.fn = this;
  if (!arr) {
    // 如果没传参数，就直接执行
    result = context.fn();
  } else {
    //如果有参数就执行
    result = context.fn(...arr);
  }
  delete context.fn;
  return result;
};
cat.eatFish.defineApply(dog, ["三文鱼", "金枪鱼", "鲨鱼"]);

/**
 * 手写bind
 * 利用之前的apply特性
 * bind和上面两个不一样的地方是可以柯里化传参，并且会返回一个新的函数
 * 注意返回的函数有一点特殊：
 * 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。
 * 所以当返回函数作为构造函数时，this默认指向该实例，就可以让实例获得来自绑定函数的值，如果实例是null这种特殊情况，实例就指向this
 * 而当返回函数作为普通函数时，this默认指向window，我们就将它指向上下文context
 */
 Function.prototype.defineBind = function (obj) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  };
  let args = Array.prototype.slice.call(arguments, 1);
  let fn = this;
  //创建中介函数
  let fn_ = function () {};
  // 上面说的Fn2就是这里的bound
  let bound = function () {
    let params = Array.prototype.slice.call(arguments);
    //通过constructor判断调用方式，为true this指向实例，否则为obj
    fn.apply(this.constructor === fn ? this : obj, args.concat(params));
  };
  fn_.prototype = fn.prototype;
  bound.prototype = new fn_();
  return bound;
};

// es6的bind实现
Function.prototype.defineBind = function (context, ...rest) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }
  var self = this;
  return function F(...args) {
    if (this instanceof F) {
      return new self(...rest, ...args);
    }
    return self.apply(context, rest.concat(args));
  };
};