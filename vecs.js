var vecs = (function() {

  var multOV = function(o, v) {
    var multV = _.partial(vecs.mult, _, v);
    return _.mapObject(o, multV);
  }

  var multON = function(o, n) {
    var multN = _.partial(vecs.multN, _, n);
    return _.mapObject(o, multN);
  }

  var addOV = function(o, v) {
    var addV = _.partial(vecs.add, _, v);
    return _.mapObject(o, addV);
  }

  var addON = function(o, n) {
    var addN = _.partial(vecs.addN, _, n);
    return _.mapObject(o, addN);
  }

  function v(x, y) {
    return { x: x, y: y}
  }

  function rgb(r, g, b) {
    return { r: r, g: g, b: b }
  }

  function field(vec, cb) {
    _.times(vec.x, function(x) {
      _.times(vec.y, function(y) {
        cb(v(x, y));
      })
    })
  }

  function add(v1, v2) {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y
    }
  }

  function addN(v1, n) {
    return {
      x: v1.x + n,
      y: v1.y + n
    }
  }

  function sub(v1, v2) {
    return {
      x: v1.x - v2.x,
      y: v1.y - v2.y
    }
  }

  function mult(v1, v2) {
    return {
      x: v1.x * v2.x,
      y: v1.y * v2.y
    }
  }

  function multN(v1, n) {
    return {
      x: v1.x * n,
      y: v1.y * n
    }
  }

  function divN(v1, n) {
    return {
      x: v1.x / n,
      y: v1.y / n
    }
  }

  function toRgbString(rgb) {
    return 'rgb(' + _.values(rgb).join(',') + ')';
  }

  function reduce2d(xs2d, cb, accum) {
    _.each(xs2d, function(row, x) {
      _.each(row, function(field, y) {
        accum = cb(accum, field, { x: x, y: y });
      });
    });
    return accum;
  }

  function mapField(field, mapper_fn) {
    return _.map($.newArray(field.x), function() {
      return _.map($.newArray(field.y), mapper_fn )
    });
  }

  return {
    v: v,
    rgb: rgb,
    add: add,
    addN: addN,
    sub: sub,
    mult: mult,
    multN: multN,
    multOV: multOV,
    multON: multON,
    addOV: addOV,
    addON: addON,
    divN: divN,
    field: field,
    toRgbString: toRgbString,
    reduce2d: reduce2d,
    mapField: mapField
  }
})();
