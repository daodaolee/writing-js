function instanceOf(A, B) {
  let o = B.prototype;
  let a = A.__proto__;
  while (true) {
    if (a === null) {
      return false;
    }
    if (o === a) {
      return true;
    }
    a = a.__proto__;
  }
}
