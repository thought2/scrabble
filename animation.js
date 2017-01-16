var animation = (function() {
  var tick_stack = [];

  function registerAnimations() {

    structure.onStateChange(function(field) {
      var pos = animation_stack.length;
      animation_stack[pos]((function(start_time) {
        var duration = 1000,
            opacity = 0;
        return function(time) {
          var local_time = time-start_time,
              proc = local_time / duration;
          field.draw.opacity = proc * 1;
          (local_time > duration) && animation_stack.slice(pos, 1);
      }}})(now);
    });

  }

})();
