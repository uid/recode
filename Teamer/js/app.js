// Generated by CoffeeScript 1.7.1
(function() {
  var Model, PlayerAuth, ProblemServer;

  Model = window.TeamerModel;

  PlayerAuth = (function() {
    PlayerAuth.$inject = ['$http', '$location'];

    function PlayerAuth($http, $location) {
      this.http = $http;
      this.location = $location;
    }

    PlayerAuth.prototype.submitLogin = function(name, callback) {
      return this.http({
        method: 'GET',
        url: '/teamerapi/login',
        params: {
          name: name
        }
      }).success((function(_this) {
        return function(data, status) {
          _this.player = new Model.Player(data, name);
          return callback(_this.player, null);
        };
      })(this)).error(function(data, status) {
        return callback(null, data);
      });
    };

    PlayerAuth.prototype.assertLoggedIn = function() {
      if (this.player == null) {
        console.log("AUTH: no player found, redirecting to login");
        this.location.path("/login");
        return false;
      } else {
        return this.player;
      }
    };

    return PlayerAuth;

  })();

  ProblemServer = (function() {
    ProblemServer.$inject = ['$http', '$location', 'playerAuth'];

    function ProblemServer($http, $location, playerAuth) {
      this.playerAuth = playerAuth;
      this.http = $http;
      this.location = $location;
    }

    ProblemServer.prototype.updateConfig = function() {
      var _ref;
      this.problem = this.location.path().split("/")[2];
      return this.id = (_ref = this.playerAuth.player) != null ? _ref.id : void 0;
    };

    ProblemServer.prototype.getFunctions = function() {
      this.updateConfig();
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/getFunctions',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.getView = function() {
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/getView',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.getView2 = function() {
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/getView2',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.getView3 = function() {
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/getView3',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.getGameInfo = function() {
      this.updateConfig();
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/getGameInfo',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.joinGame = function() {
      this.updateConfig();
      return this.http({
        method: 'GET',
        url: '/teamerapi/game/' + this.problem + '/joinGame',
        params: {
          id: this.id
        }
      });
    };

    ProblemServer.prototype.submitImpl = function(impl) {
      return this.http({
        method: 'POST',
        url: '/teamerapi/game/' + this.problem + '/submitImpl',
        params: {
          id: this.id
        },
        data: impl.toJson()
      });
    };

    ProblemServer.prototype.submitReview = function(review) {
      return this.http({
        method: 'POST',
        url: '/teamerapi/game/' + this.problem + '/submitReview',
        params: {
          id: this.id
        },
        data: review.toJson()
      });
    };

    return ProblemServer;

  })();

  angular.module('teamer', ['ngRoute']).config(function($routeProvider, $locationProvider) {
    return $routeProvider.when('/login', {
      templateUrl: '/teamer/views/login.html',
      controller: 'LoginController'
    }).when('/problem/:problem', {
      templateUrl: '/teamer/views/problem.html',
      controller: 'ProblemController'
    }).otherwise({
      templateUrl: '/teamer/views/null.html',
      controller: 'InitController'
    });
  }).controller('LoginController', [
    '$scope', '$location', 'playerAuth', function($scope, $location, playerAuth) {
      return $scope.submitName = function() {
        $scope.loginError = false;
        return $scope.id = playerAuth.submitLogin($scope.loginname, function(player, error) {
          if (player) {
            return $location.path("");
          } else {
            return $scope.loginError = error;
          }
        });
      };
    }
  ]).controller('InitController', [
    '$location', 'playerAuth', function($location, playerAuth) {
      if (playerAuth.assertLoggedIn()) {
        console.log("INIT: player detected, redirecting to problem");
        return $location.path("/problem/sql/");
      }
    }
  ]).controller('Prototype', [
    '$scope', function($scope) {
      $scope.activeImpl = {
        code: "public static String[] anagrams(String word, String[] WORDLIST) {\n" + "    return ff3_filter(f3b_deduplicate(f4a_permute(word)), WORDLIST);\n" + "}"
      };
      $scope.activeReview = {
        code: "// find all permutations of str and add the given prefix (use \"\")\n" + "public static void permute(String str, String prefix) {\n" + "    int n = str.length();\n" + "    if (n == 0) {\n" + "        System.out.println(prefix);\n" + "    } else {\n" + "        for (int i = 0; i < n; i++) {\n" + "            permute(str.substring(0, i) + str.substring(i+1, n), prefix + str.charAt(i));\n" + "        }\n" + "    }\n" + "}"
      };
      return $scope.codeEditor = {};
    }
  ]).controller('ProblemController', [
    '$scope', 'playerAuth', 'problemServer', '$timeout', function($scope, playerAuth, server, $timeout) {
      var endStageOne, endStageTwo, startStageThree, startStageTwo;
      if (!playerAuth.assertLoggedIn()) {
        return;
      }
      $scope.stage = 0;
      $scope.player = playerAuth.player;
      console.log("PROBCTL: start stage one");
      server.joinGame().then(function(data) {
        $scope.game = Model.GameInfo.fromJson(data.data);
        return server.getView();
      }).then(function(data) {
        $scope.view = Model.PlayerView.fromJson(data.data, $scope.game);
        $scope.view.createImplsForStage(1);
        $scope.stage = 1;
        if ($scope.game.status.stage === 1) {
          return $scope.stageEndTimer = $timeout((function() {
            return endStageOne();
          }), $scope.game.status.endTime - Date.now());
        } else {
          return endStageOne();
        }
      })["catch"](function(error) {
        return $scope.error = error;
      });
      endStageOne = function() {
        var $stageEndTimer;
        console.log("PROBCTL: end stage one");
        $scope.stage = 1.5;
        $stageEndTimer = $timeout((function() {
          return startStageTwo();
        }), 5000);
        return $scope.game.status.endTime = Date.now() + 5000;
      };
      startStageTwo = function() {
        console.log("PROBCTL: start stage two");
        return server.getGameInfo().then(function(data) {
          $scope.game.mergeJson(data.data);
          return server.getView2();
        }).then(function(data) {
          $scope.view2 = Model.PlayerView2.fromJson(data.data, $scope.view);
          $scope.stage = 2;
          if ($scope.game.status.stage === 2) {
            return $scope.stageEndTimer = $timeout((function() {
              return endStageTwo();
            }), $scope.game.status.endTime - Date.now());
          } else {
            return endStageTwo();
          }
        })["catch"](function(error) {
          return $scope.error = error;
        });
      };
      endStageTwo = function() {
        var $stageEndTimer;
        console.log("PROBCTL: end stage two");
        $scope.stage = 2.5;
        $stageEndTimer = $timeout((function() {
          return startStageThree();
        }), 5000);
        return $scope.game.status.endTime = Date.now() + 5000;
      };
      startStageThree = function() {
        console.log("PROBCTL: start stage three");
        return server.getGameInfo().then(function(data) {
          $scope.game.mergeJson(data.data);
          return server.getView3();
        }).then(function(data) {
          $scope.view3 = Model.PlayerView3.fromJson(data.data, $scope.view2);
          $scope.view3.createImplsForProgram();
          $scope.stage = 3;
          $scope.activeImpl = null;
          return $scope.activeReview = null;
        })["catch"](function(error) {
          return $scope.error = error;
        });
      };
      $scope.openImpl = function(impl) {
        console.log("PROBCTL: changing function to " + impl["function"].name);
        return $scope.activeImpl = impl;
      };
      $scope.openReview = function(reviewSet) {
        var found, review, _i, _len, _ref;
        console.log("PROBCTL: changing reviewSet to " + reviewSet.impl["function"].name);
        $scope.activeReviewSet = reviewSet;
        found = false;
        _ref = reviewSet.reviews;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          review = _ref[_i];
          if (review.player.id === $scope.player.id) {
            $scope.activeReview = review;
            console.log("Found previous review");
            found = true;
            break;
          }
        }
        if (!found) {
          console.log("Making new review");
          $scope.activeReview = new Model.ImplReview(reviewSet.impl, $scope.player);
          return reviewSet.reviews.push($scope.activeReview);
        }
      };
      $scope.codeEditor = {};
      $scope.submitImpl = function() {
        $scope.activeImpl.code = $scope.codeEditor.editor.getValue();
        console.log("PROBCTL: submitting implementation for " + $scope.activeImpl["function"].name);
        return server.submitImpl($scope.activeImpl).then(function(data) {
          $scope.info = data.data;
          return $scope.activeImpl._dirty = false;
        })["catch"](function(error) {
          return $scope.error = error;
        });
      };
      return $scope.submitReview = function() {
        console.log("PROBCTL: submitting review for " + $scope.activeReview.impl["function"].name);
        console.log($scope);
        return server.submitReview($scope.activeReview).then(function(data) {
          $scope.activeReview._dirty = false;
          $scope.activeReviewSet.mergeJson(data.data, $scope.view2.impls, $scope.game.players);
          return console.log($scope.activeReviewSet);
        })["catch"](function(error) {
          return $scope.error = error;
        });
      };
    }
  ]).directive('countdownTimer', [
    'dateFilter', '$interval', function(dateFilter, $interval) {
      var format;
      format = "m:ss 'Remaining'";
      return function(scope, element, attrs) {
        var stageEndTime, timer, updateTime;
        stageEndTime = 0;
        updateTime = function() {
          return element.text(dateFilter(stageEndTime - Date.now(), format));
        };
        scope.$watch(attrs.countdownTimer, function(value) {
          stageEndTime = value;
          return updateTime();
        });
        timer = $interval(updateTime, 1000);
        return element.bind('$destroy', function() {
          return $interval.cancel(timer);
        });
      };
    }
  ]).directive('functionEditor', function() {
    return {
      restrict: "E",
      link: function(scope, element, attrs) {
        var editor, readonly;
        readonly = attrs.readonly != null ? "nocursor" : false;
        editor = CodeMirror(element[0], {
          value: "use strict;",
          mode: "text/x-java",
          lineNumbers: true,
          readOnly: readonly
        });
        scope.codeEditor.editor = editor;
        scope.$watch(attrs["function"], function(value) {
          if (!value.code) {
            value.code = "//Add your implementation (and documentation) here!\n\n\n\n\n";
          }
          editor.setValue(value.code);
          return scope.activeImpl._dirty = true;
        });
        return editor.on("change", function() {
          return scope.activeImpl._dirty = true;
        });
      }
    };
  }).directive('reviewView', function() {
    return {
      link: function(scope, element, attrs) {
        return scope.$watch("review.rating", function(value) {
          if (value === "0") {
            return element.addClass("alert-info").removeClass("alert-success").removeClass("alert-danger");
          } else if (value === "1") {
            return element.addClass("alert-success").removeClass("alert-info").removeClass("alert-danger");
          } else if (value === "-1") {
            return element.addClass("alert-danger").removeClass("alert-info").removeClass("alert-success");
          }
        });
      }
    };
  }).service('playerAuth', PlayerAuth).service('problemServer', ProblemServer);

}).call(this);

//# sourceMappingURL=app.map
