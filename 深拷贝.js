/**
 *  一级拷贝
 */
function deepClone(array) {
  let newArray = [];
  for (let item of array) {
    newArray.push(item);
  }
  return newArray;
}

function deepClone(array) {
  // slice不改变原数组，截取的参数不传，就返回一个新数组
  return array.slice();
}

function deepClone(array) {
  // 相当于 array.concat([])
  return array.concat();
}

function deepClone(array) {
  return Object.assign({}, array);
}
function deepClone(array) {
  return Array.isArray(array) ? [...array] : { ...array };
}

/**
 * 多级拷贝
 */
function deepClone(array) {
  //缺点，遇到 函数，undefined 和 symbol 会自动忽略
  return JSON.parse(JSON.stringify(array));
}

function deepClone(obj) {
  const isObj = (o) => {
    return (typeof o === "object" || typeof o === "function") && o !== null;
  };
  if (!isObj) {
    return new Error("不是对象");
  }
  const isArr = Array.isArray(obj);
  let newObj = isArr ? [...obj] : { ...obj };
  Reflect.ownKeys(newObj).forEach((key) => {
    newObj[key] = isObj(obj[key]) ? deepClone(obj[key]) : obj[key];
  });
  return newObj;
}
