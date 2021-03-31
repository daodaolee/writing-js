// Function.prototype.bind1 = function (context, ...rest) {
//   if (typeof this !== "function") {
//     throw new TypeError("invalid invoked!");
//   }
//   var self = this;
//   return function F(...args) {
//     if (this instanceof F) {
//       return new self(...rest, ...args);
//     }
//     return self.apply(context, rest.concat(args));
//   };
// };
Function.prototype.bind_ = function (obj) {
  var args = Array.prototype.slice.call(arguments, 1);
  var fn = this;
  //创建中介函数
  var fn_ = function () {};
  var bound = function () {
    var params = Array.prototype.slice.call(arguments);
    //通过constructor判断调用方式，为true this指向实例，否则为obj
    fn.apply(this.constructor === fn ? this : obj, args.concat(params));
    console.log(this);
  };
  fn_.prototype = fn.prototype;
  bound.prototype = new fn_();
  return bound;
};
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

cat.eatFish.bind1(dog)("123");
