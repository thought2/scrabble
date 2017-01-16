var draw = (function() {
  var fillRect = _.partial(drawRect, _, _, 'fillRect');
  var strokeRect = _.partial(drawRect, _, _, 'strokeRect');

  var fillColor = _.partial(color, _, 'fillStyle', _);
  var strokeColor = _.partial(color, _, 'strokeStyle', _);


  var drawPermissionSymbol = (function(){

    var add = _.partial(vecs.addON, _, (1 - 0.7) / 2 ),
        mult = _.partial(vecs.multON, _, 0.7),
        transform = _.compose(add, mult);

    var horizontal_line_proto = transform({
      start: vecs.v(0, 0.5),
      end: vecs.v(1, 0.5)
    });

    var vertical_line_proto = transform({
      start: vecs.v(0.5, 0),
      end: vecs.v(0.5, 1)
    });

    var horizontal_line = vecs.multOV(horizontal_line_proto, settings.field_size);
    var vertical_line = vecs.multOV(vertical_line_proto, settings.field_size);

    return function(ctx, px_pos, permission) {
      var addPxPos = _.partial(vecs.add, _, px_pos);

      if (permission.right) {
        var local_horizontal_line = vecs.addOV(horizontal_line, px_pos);
        line(ctx, local_horizontal_line);
      }
      if (permission.down) {
        var local_vertical_line = vecs.addOV(vertical_line, px_pos);
        line(ctx, local_vertical_line);
      }

    }
  })();

  function drawStartPermissionSymbol(ctx, rect) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    fillRect(ctx, rect);
  }

  function drawEndPermissionSymbol(ctx, rect) {
    ctx.fillStyle = "rgba(219, 0, 255, 0.3)";
    fillRect(ctx, rect);
  }

  function writeWord(ctx, word, start, direction) {
    _.each(word, function(letter) {

    });
  }

  function drawRect(ctx, rect, mode) {
    ctx[mode].apply(ctx, rectToArray(rect));
  }

  function rectToArray(rect) {
    return [rect.pos.x, rect.pos.y, rect.size.x, rect.size.y];
  }

  function letterToGrid(ctx, letter, pos) {
    var half_field_size = vecs.divN(settings.field_size, 2);
    var px_pos = vecs.mult(pos, settings.field_size),
        px_pos = vecs.add(px_pos, half_field_size);
    drawLetterCenter(ctx, letter, px_pos);
  }

  function drawLetterCenter(ctx, letter, px_pos) {
    var half_field_size = vecs.divN(settings.field_size, 2);
    px_pos = vecs.add(px_pos, half_field_size);
    ctx.fillText(letter.toUpperCase(), px_pos.x, px_pos.y);
  }

  function globalDrawSettings(ctx) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = (settings.field_size.y * 0.9) + 'px ' + settings.font;
  }


  function color(ctx, type, mode_name) {
    var mode = settings.colors[mode_name];
    ctx[type] = typeof mode == 'object' ? vecs.toRgbString(mode) : mode;
  }


  function renderState(ctx, state_grid) {
    var field_rect = {
      size: settings.field_size
    }
    vecs.field(settings.field_quantities, function(pos) {
      var field = state_grid[pos.x][pos.y],
          px_pos = vecs.mult(pos, settings.field_size),
          rect = _.extend(field_rect, { pos: px_pos });

      fillColor(ctx, field.state);
      fillRect(ctx, rect);



      if (settings.debug_mode) {
        strokeColor(ctx, 'permission_symbol');
        !field.start_permission && drawStartPermissionSymbol(ctx, rect);
        !field.end_permission && drawEndPermissionSymbol(ctx, rect);
        drawPermissionSymbol(ctx, px_pos, field.permission);
      }

      if (field.state == 'occupied') {
        strokeColor(ctx, 'border');
        strokeRect(ctx, rect);
        fillColor(ctx, 'font');
        drawLetterCenter(ctx, field.letter, px_pos);
      }
    });
  }

  function line(ctx, line) {
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
  }

  return {
    letterToGrid: letterToGrid,
    writeWord: writeWord,
    globalDrawSettings: globalDrawSettings,
    fillColor: fillColor,
    renderState: renderState
  }
})();
