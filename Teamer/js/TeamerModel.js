// Generated by CoffeeScript 1.6.3
(function() {
  var Implementation, Module, Player, Problem, ProblemFamily, ProblemRound, ProblemSuite, TestableProblem, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Module = {};

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Module;
    _ = require("./Utils.coffee");
  } else {
    window.DebuggerModel = Module;
    _ = window.Utils;
  }

  Module.Problem = Problem = (function() {
    function Problem(name, description) {
      this.name = name;
      this.description = description;
    }

    return Problem;

  })();

  Module.TestableProblem = TestableProblem = (function(_super) {
    __extends(TestableProblem, _super);

    function TestableProblem(name, descrption, tester) {
      this.name = name;
      this.descrption = descrption;
      this.tester = tester;
    }

    return TestableProblem;

  })(Problem);

  Module.ProblemFamily = ProblemFamily = (function() {
    function ProblemFamily(name, phase, description, problems) {
      this.name = name;
      this.phase = phase;
      this.description = description;
      this.problems = problems != null ? problems : {};
    }

    ProblemFamily.prototype.addProblems = function() {
      var problem, problems, _i, _len, _results;
      problems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = problems.length; _i < _len; _i++) {
        problem = problems[_i];
        _results.push(this.problems[problem.name] = problem);
      }
      return _results;
    };

    return ProblemFamily;

  })();

  Module.ProblemSuite = ProblemSuite = (function() {
    function ProblemSuite(name, families) {
      this.name = name;
      this.families = families != null ? families : {};
    }

    ProblemSuite.prototype.addFamilies = function() {
      var families, family, _i, _len, _results;
      families = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = families.length; _i < _len; _i++) {
        family = families[_i];
        _results.push(this.problems[family.name] = family);
      }
      return _results;
    };

    return ProblemSuite;

  })();

  Module.Implementation = Implementation = (function() {
    function Implementation(user, problem, dependencies) {
      this.user = user;
      this.problem = problem;
      this.dependencies = dependencies != null ? dependencies : [];
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

  Module.Player = Player = (function() {
    function Player(id, name) {
      this.id = id;
      this.name = name;
    }

    return Player;

  })();

}).call(this);

/*
//@ sourceMappingURL=TeamerModel.map
*/
