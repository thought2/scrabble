var structure = (function() {

  var grouped_word_list = null,
      onStateChange_funct = null;

  var direction_vecs = {
    'up':         vecs.v(0, -1),
    'right':      vecs.v(1, 0),
    'down':       vecs.v(0, 1),
    'left':       vecs.v(-1, 0)
  };

  var createStateGrid = (function() {
    var empty = {
        permission: { right: true, down: true },
        start_permission: true,
        end_permission: true,
        state: 'empty'
    };
    return function() {
      return vecs.mapField(settings.field_quantities, _.partial($.deepclone, empty));
    }
  })();


  var writing_directions = ['down', 'right'],
      state_grid = createStateGrid(),
      getDirectionVec = _.propertyOf(direction_vecs),
      secureDenyStartPermission = _.partial($.testBeforeCall, inGrid, denyStartPermission, _),
      secureDenyEndPermission = _.partial($.testBeforeCall, inGrid, denyEndPermission, _),
      secureDenyPermission = _.partial($.testBeforeCall, inGrid, denyPermission, _, _),
      secureRequestPermission = _.partial($.testBeforeCall, inGrid, requestPermission, _, _);

  function onStateChange(cb) {
    onStateChange_funct = cb;
  }

  /*function createStateGrid() {
    var empty = {
        permission: { right: true, down: true },
        start_permission: true,
        end_permission: true,
        state: 'empty'
    };
    return vecs.mapField(settings.field_quantities, _.partial(Object.create, empty));
  }*/



  function setGroupedWordList(list) {
    grouped_word_list = list;
  }

  function start() {
    findLongestPossibleWord({
      min_crossings: 0,
      max_rounds: 1
    });
  }

  function next() {
    findLongestPossibleWord({
      min_crossings: 1,
      max_rounds: 1
    });
  }

  function fullRun() {
    start();
    findLongestPossibleWord({
      min_crossings: 1,
      max_rounds: 20
    });
  }

  function findLongestPossibleWord(config) {
    var nr_found = $.trampolin(function(counter) {
      var possibilites = searchGridForPossibilites(config);
          grouped_possibilites = _.groupBy(possibilites, 'length' ),
          longest_possible_word = iterateGroups(_.shuffle(grouped_possibilites));
      longest_possible_word && setWord(longest_possible_word);
      return counter < config.max_rounds-1 && longest_possible_word != false ? _.partial(this, ++counter) : counter;
    }, 0)
  }

  function iterateGroups(grouped_possibilites) {
    var lengths_descending = _.sortBy(_.keys(grouped_possibilites),
        tools.parse10).reverse();
    return $.reduceTrampolin(lengths_descending, function(m, length, i) {
      var group = grouped_possibilites[length],
          shuffled_group = _.shuffle(group),
          result_in_group = iterateGroup(shuffled_group);
      return result_in_group;
    }, $.isNotFalsy, false);
  }

  function iterateGroup(shuffled_group) {
    return $.reduceTrampolin(shuffled_group, function(m, propose) {
      return searchWordList(propose);
    }, $.isNotFalsy, false);
  }

  function searchWordList(propose) {
    var words_of_right_length = _.shuffle(grouped_word_list[propose.length]);

    return $.reduceTrampolin(words_of_right_length, function(m, test_word) {
      var regex_obj = new RegExp('^' + propose.regex_string + '$', 'i');
      return regex_obj.test(test_word) ? extendPropose(propose, test_word) : false;
    }, $.isNotFalsy, false);
    function extendPropose(propose, result_word) {
      return _.extend(_.clone(propose), { result_word: result_word })
    }
  }

  function searchGridForPossibilites(config) {
    return vecs.reduce2d(state_grid, function(memo, field, pos) {
      return field.start_permission ? $.concat(memo, retrieveFromBothDirections(pos, config) ) : memo;
    }, []);
  }

  function retrieveFromBothDirections(pos, config) {
    return _.reduce(writing_directions, function(memo, direction) {
      return $.concat(memo, getPossibleFieldChains(pos, direction, config) );
    }, []);
  }

  function getPossibleFieldChains(pos, direction, config) {
    var start_pos = _.clone(pos),
        fieldChecker = createFieldChecker(start_pos, direction, config);
    return $.trampolin(fieldChecker, pos, []);
  }

  function createFieldChecker(start_pos, direction, config) {
    var direction_vec = getDirectionVec(direction);
    var scrabble_word = {
      start_pos: start_pos,
      regex_string: '',
      nr_crossings: 0,
      direction: direction,
      length: 0
    }
    var noticeCrossing = function(scrabble_word, letter) {
      scrabble_word.regex_string += letter;
      scrabble_word.nr_crossings++;
      return scrabble_word;
    }
    var noticeEmpty = function(scrabble_word) {
      scrabble_word.regex_string += '.';
      return scrabble_word;
    }
    var updateScrabbleWord = function(scrabble_word, field) {
      scrabble_word.length++;
      scrabble_word = (field.state == 'occupied') ? noticeCrossing(scrabble_word, field.letter) : noticeEmpty(scrabble_word);
      return scrabble_word;
    }
    return function(pos, memo) {
      var goAhead = function() {
        var field = accessGrid(pos);
        scrabble_word = updateScrabbleWord(scrabble_word, field);
        if (scrabble_word.nr_crossings >= config.min_crossings && scrabble_word.length > 1 && field.end_permission) {
            memo = $.concat(memo, _.clone(scrabble_word));
        }
        pos = vecs.add(pos, direction_vec);
        return _.partial(this, pos, memo);
      };
      return secureRequestPermission(pos, direction) ? goAhead : memo;
    }
  }

  function requestPermission(pos, direction) {
    var field = accessGrid(pos);
    return field.permission[direction];
  }

  function setWord(scrabble_word) {
    var direction_vec = getDirectionVec(scrabble_word.direction),
        before = vecs.sub(scrabble_word.start_pos, direction_vec);
    var after = _.reduce(scrabble_word.result_word, function(pos, letter) {
      setLetter(letter, pos, scrabble_word.direction);
      return vecs.add(pos, direction_vec);
    }, scrabble_word.start_pos);
    _.each([before, after], _.partial(secureDenyPermission, _, undefined) );
    grouped_word_list[scrabble_word.length] =
        _.without(grouped_word_list[scrabble_word.length], scrabble_word.result_word);
  }

  function setLetter(letter, pos, direction) {
    var field = accessGrid(pos);
    _.extend(field, { state: 'occupied', letter: letter } );
    secureDenyPermission(pos, direction);
    denyNeigbours(pos, direction);
    onStateChange_funct && onStateChange_funct(field);
    console.log(onStateChange)

    function denyNeigbours(pos, direction) {
      var direction_vec = direction == 'right' ? direction_vecs['down'] : direction_vecs['right'],
          first_pos = vecs.add(pos, direction_vec),
          second_pos = vecs.sub(pos, direction_vec);
      secureDenyPermission(first_pos, direction);
      secureDenyPermission(second_pos, direction);
      secureDenyStartPermission(first_pos);
      secureDenyEndPermission(second_pos);
    }
  }

  function denyPermission(pos, direction) {
    var permission = accessGrid(pos).permission;
    if (direction !== undefined) {
      permission[direction] = false;
    } else {
      accessGrid(pos).permission = _.mapObject(permission, _.constant(false) );
    }
  }

  function denyStartPermission(pos) {
    accessGrid(pos).start_permission = false;;
  }

  function denyEndPermission(pos) {
    accessGrid(pos).end_permission = false;;
  }

  function accessGrid(v) {
    return state_grid[v.x][v.y];
  }

  function inGrid(v) {
    return inAxis(v, 'x') && inAxis(v, 'y');
  }

  function inAxis(v, axis) {
    return (v[axis] >= 0 && v[axis] < settings.field_quantities[axis])
  }

  return {
    setGroupedWordList: setGroupedWordList,
    state_grid: state_grid,
    start: start,
    next: next,
    fullRun: fullRun,
    onStateChange: onStateChange
  }
})();
