var $ = (function() {

  var deepclone = _.partial(_.mapObject, _, _.clone);

  function push(xs, v) {
    xs.push(v);
    return xs;
  }

  function newArray(nr) {
    return new Array(nr);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function concat(a, b) {
    return Array.prototype.concat(a, b);
  }

  function trampolin(f) {
    var result = f.apply(f, _.rest(arguments) );
    while (_.isFunction(result)) {
      result = result.apply(f);
    }
    return result;
  }

  function reduceTrampolin(xs, eachCall, breakCond, accum) {
    var last_index = xs.length-1;
    return trampolin(function(i) {
      var v = xs[i],
          here_ok = (i <= last_index) && !breakCond(accum, v, i),
          end = (i == last_index);
      if (here_ok) accum = eachCall(accum, v, i);
      return (end || !here_ok) ? accum : _.partial(this, ++i);
    }, 0);
  }

  function testBeforeCall(checker, funct) {
    var args = _.rest(_.rest(arguments));
    return (checker.apply(checker, args)) ? funct.apply(funct, args) : false;
  }

  function isTruthy(v) {
    return v == true;
  }

  function isFalsy(v) {
    return v == false;
  }

  function isNotFalsy(v) {
    return v != false;
  }

  return {
    newArray: newArray,
    push: push,
    deepClone: deepClone,
    concat: concat,
    trampolin: trampolin,
    reduceTrampolin: reduceTrampolin,
    testBeforeCall: testBeforeCall,
    isTruthy: isTruthy,
    isFalsy: isFalsy,
    isNotFalsy: isNotFalsy,
    deepclone: deepclone
  }
})();
