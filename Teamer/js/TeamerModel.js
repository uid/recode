// Generated by CoffeeScript 1.7.1
(function() {
  var Function, FunctionFamily, Implementation, Module, Player, ProblemRound, ProblemState, ProblemSuite, _,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Module = {};

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Module;
    _ = require("./utils.coffee");
  } else {
    window.DebuggerModel = Module;
    _ = window.Utils;
  }

  Module.Function = Function = (function() {
    function Function(name, family, description) {
      this.name = name;
      this.family = family;
      this.description = description;
      this.phase = family.phase;
    }

    return Function;

  })();

  Module.FunctionFamily = FunctionFamily = (function() {
    function FunctionFamily(name, phase, description) {
      this.name = name;
      this.phase = phase;
      this.description = description;
    }

    return FunctionFamily;

  })();

  Module.ProblemSuite = ProblemSuite = (function() {
    function ProblemSuite(name, functions) {
      this.name = name;
      this.functions = functions != null ? functions : {};
      this.functions = {};
    }

    ProblemSuite.prototype.addFunctions = function() {
      var func, functions, _i, _len, _results;
      functions = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = functions.length; _i < _len; _i++) {
        func = functions[_i];
        _results.push(this.functions[func.name] = func);
      }
      return _results;
    };

    return ProblemSuite;

  })();

  Module.Implementation = Implementation = (function() {
    function Implementation(_function, user, code) {
      this["function"] = _function;
      this.user = user;
      this.code = code;
    }

    return Implementation;

  })();

  Module.ProblemRound = ProblemRound = (function() {
    function ProblemRound(problem, id) {
      this.problem = problem;
      this.id = id;
      this.players = {};
    }

    ProblemRound.prototype.addPlayer = function(player) {
      var _ref;
      if (_ref = player.name, __indexOf.call(this.players, _ref) < 0) {
        return this.players[player.name] = player;
      } else {
        throw new Error("Player already added to round!");
      }
    };

    return ProblemRound;

  })();

  Module.ProblemState = ProblemState = (function() {
    function ProblemState(problem, starttime) {
      this.problem = problem;
      this.starttime = starttime;
      this.implementations = {};
      this.feedback = {};
    }

    ProblemState.prototype.addImplementation = function(implementation) {};

    return ProblemState;

  })();

  Module.Player = Player = (function() {
    function Player(id, name) {
      this.id = id;
      this.name = name;
    }

    return Player;

  })();

}).call(this);

//# sourceMappingURL=TeamerModel.map
