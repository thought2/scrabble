var APP = (function() {
  var canvas = document.querySelector("canvas"),
      ctx = canvas.getContext("2d");
  original = null;
  function main() {
    onresize = _.throttle(resize, 100);
    onclick = function() {
      structure.next();
    }
    //ondblclick = structure.fullRun;

	 ctx.canvas.width = settings.field_quantities.x * settings.field_size.x;
	 ctx.canvas.height = settings.field_quantities.y * settings.field_size.y;

    resize();

    tools.getWordList(settings.wordlist_path, function(original){
      var ordered_word_lists = {
        original: original,
        grouped: _.groupBy(original, 'length')
      }
      original = ordered_word_lists.original;
      structure.setGroupedWordList(ordered_word_lists.grouped);
      structure.onStateChange(function(field) {
        /*var pos = animation_stack.length;
        animation_stack[pos]((function(start_time) {
          var duration = 1000,
              opacity = 0;
          return function(time) {
            var local_time = time-start_time,
                proc = local_time / duration;
            field.draw.opacity = proc * 1;
            (local_time > duration) && animation_stack.slice(pos, 1);
        }}})(now);*/
      });
      structure.start();
    });
    animation(0);
  }

  function resize() {
    //_.extend(ctx.canvas, {width: innerWidth, height: innerHeight} );
    draw.globalDrawSettings(ctx);
  }

  function animation(time) {
    requestAnimationFrame(animation);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.beginPath();
    draw.renderState(ctx, structure.state_grid);
  }

  return {
    main: main
  }
})();
