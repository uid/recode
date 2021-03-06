// Generated by CoffeeScript 1.6.3
(function() {
  var EmptyLineBlock, LINE_NUM_WIDTH, Line, Module, ProgramView, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Module = {};

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Module;
    _ = require("./Utils.coffee");
  } else {
    window.DebuggerModel = Module;
    _ = window.Utils;
  }

  LINE_NUM_WIDTH = 3;

  Module.Line = Line = (function() {
    function Line(line, num) {
      this.line = line;
      this.num = num;
    }

    Line.prototype.isNum = function(num) {
      return num === this.num;
    };

    Line.prototype.toString = function() {
      return _.pad(this.num, LINE_NUM_WIDTH) + ": " + this.line;
    };

    Line.prototype.toJson = function() {
      return {
        line: this.line,
        num: this.num
      };
    };

    Line.fromJson = function(json) {
      return new Line(json.line, json.num);
    };

    return Line;

  })();

  Module.EmptyLineBlock = EmptyLineBlock = (function(_super) {
    __extends(EmptyLineBlock, _super);

    function EmptyLineBlock(num, endnum) {
      this.num = num;
      this.endnum = endnum;
      _.assert(this.num <= this.endnum, "Empty Line invariant: " + this.num + "-" + this.endnum);
    }

    EmptyLineBlock.prototype.isNum = function(num) {
      return (this.num <= num && num < this.endnum);
    };

    EmptyLineBlock.prototype.splitOn = function(line) {
      var num, ret;
      _.assert(this.isNum(line.num), "Split must get line between " + this.num + "-" + this.endnum);
      ret = [line];
      num = line.num;
      if (num + 1 < this.endnum) {
        ret.push(new EmptyLineBlock(this.num + 1, this.endnum));
      }
      if (this.num < num) {
        ret.push(new EmptyLineBlock(this.num, num));
      }
      return ret;
    };

    EmptyLineBlock.prototype.toString = function() {
      return "###" + ": Lines " + this.num + " to " + (this.endnum - 1) + " not yet known.";
    };

    EmptyLineBlock.prototype.toJson = function() {
      return {
        num: this.num,
        endnum: this.endnum
      };
    };

    EmptyLineBlock.fromJson = function(json) {
      return new EmptyLineBlock(json.num, json.endnum);
    };

    return EmptyLineBlock;

  })(Line);

  Module.ProgramView = ProgramView = (function() {
    function ProgramView(numLines, lines) {
      this.numLines = numLines;
      this.lines = lines;
      if (this.lines == null) {
        this.lines = [new EmptyLineBlock(0, this.numLines)];
      }
    }

    ProgramView.prototype.findLine = function(num) {
      var curLine, i, _i, _len, _ref;
      _ref = this.lines;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        curLine = _ref[i];
        if (curLine.isNum(num)) {
          return i;
        }
      }
      return -1;
    };

    ProgramView.prototype.getLine = function(num) {
      var index;
      index = this.findLine(num);
      if (index !== -1) {
        return this.lines[index];
      } else {
        return null;
      }
    };

    ProgramView.prototype.setLine = function(line) {
      var curLine, index, num, _ref;
      _.assert(line.num < this.numLines, "Line number specified is out of program bounds");
      num = line.num;
      index = this.findLine(num);
      if (index === -1) {
        this.lines.push(line);
      }
      curLine = this.lines[index];
      if (curLine instanceof EmptyLineBlock) {
        return ([].splice.apply(this.lines, [index, index - index + 1].concat(_ref = curLine.splitOn(line))), _ref);
      } else {
        return this.lines[index] = line;
      }
    };

    ProgramView.prototype.setLines = function(lines) {
      var line, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        _results.push(this.setLine(line));
      }
      return _results;
    };

    return ProgramView;

  })();

}).call(this);

/*
//@ sourceMappingURL=DebuggerModel.map
*/
