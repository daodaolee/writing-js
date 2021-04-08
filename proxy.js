let watch = (obj, setBind, getLog) => {
  let handler = {
    get(target, property, receiver) {
      getLog(target, property);
      return Reflect.get(target, property, receiver);
    },
    set(target, property, receiver) {
      setBind(target, property);
      return Reflect.set(target, property, receiver);
    },
  };

  return new Proxy(obj, handler);
};

let obj = { a: 1 };
let p = watch(
  obj,
  (v, property) => {
    console.log(`监听到${property} 变化：${v}`);
  },
  (target, property) => {
    console.log(`'${property}' = ${target[property]}`);
  }
);
p.a = 2;
p.a
