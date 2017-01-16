var tools = (function() {

  var parse10 = _.partial(parseInt, _, 10 );

  function getWordList(path, cb) {
    log('loading word list...');
    getRemoteTextFile(path, function(text_string) {
      var word_list = text_string.split('\n');
      log('word list loaded.');
      cb(word_list);
    })
  }

  function log(txt) {
    console.log(txt);
  }

  function getRemoteTextFile(path, cb) {
    var req = new XMLHttpRequest();
    req.open('GET', path, true);
    req.onload = function() {
      cb(req.responseText)
    }
    req.send();
  }

  return {
    getWordList: getWordList,
    log: log,
    parse10: parse10
  }
})();
