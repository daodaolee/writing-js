/**
 * 1. 创建一个新对象
 * 2. 构造函数的作用域赋值给新对象(也就是绑定对象的this)
 * 3. 执行构造函数里的代码
 * 4. 返回值是一个对象就返回对象，否则返回创建的新对象
 */
function defineNew() {
  // 新建一个对象
  let obj = Object.create(null);
  // 取得外部传入的构造器(这里也就是构造函数)
  let Constructor = [].shift.call(arguments);
  // 新对象的__proto__指向构造器的原型，这样新对象就可以访问原型中的属性了
  obj.__proto__ = Constructor.prototype;
  // 执行构造函数，绑定this，为新对象添加属性
  let result = Constructor.apply(obj, arguments);
  // 判断有可能返回的不是一个对象，该返回什么就返回什么
  return typeof result === "object" ? result : obj;
}
