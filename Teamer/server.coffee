Module = {}
module.exports = Module

express = require "express"
http = require "http"
fs = require "fs"
assert = require "assert"
serialize = require "node-serialize"
Model = require "./TeamerModel.coffee"
Utils = require "./utils.coffee"

# URL model:
# /teamer/login
# /teamer/admin
# /teamer/lobby
# /teamer/problem/sql/start
# /teamer/problem/sql/phase1
# /teamer/problem/sql/phase2
# /teamer/problem/sql/phase3
# /teamer/problem/sql/results
#
# API model:
# login(user):token  -- (split into password system later)
#   All Stages
# getProblems():string[]
# getProblemInfo(problem):problemInfo
# //get the state of the implementation
# getProblemStatus(problem):problemStatus
# //Stage 1:
# submitFunction(token, function, impl)
# //Stage 2:
# getImplementations(token, problem)
# 

# ------------- Model ----------------

problems = {}
problems.sql = require("./problems/sql.coffee").suite

FUNCS_PER_PLAYER = 3
IMPLS_PER_FUNC = 3
STAGE_TIMES = [0
               #1000 * 60 * 21,
               1000 * 60 * 21,
               1000 * 60 * 16,
               1000 * 60 * 21]

saveState = (label) ->
  saveJson = (obj, label) ->
    #console.log obj
    fs.writeFileSync 'state-' + Date.now() + '-' + label + '.json',  obj

  saveJson serialize.serialize({
    game: game
    gameList: gameList
    playerRegistry: playerRegistry
    getPlayerAndGame: getPlayerAndGame
  }), label


class PlayerRegistry
  constructor: () ->
    @players = {} # id -> player
  getNextUnusedId: () ->
    loop
      newId = Math.floor Math.random()*1000000
      unless newId in @players
        return newId
  createNewPlayer: (name) ->
    for id, player of @players
      if player.name == name
        return false
    newId = @getNextUnusedId()
    newPlayer = new Model.Player newId, name
    @players[newId] = newPlayer
    return newId

playerRegistry = new PlayerRegistry()

class Game
  constructor: (@problem) ->
    @players = {} # id -> Player
    @playerViews = {} # id -> PlayerView
    @playerView2s = {} # id -> PlayerView2
    @impls = {} # func -> player -> implementation
    @reviews = {} # func -> player -> implementation
    for name, func of @problem.functions
      @impls[name] = {}
      @reviews[name] = {}
    @stage = 0
    @nextStageSetup = @setupStageOne
    @startNextStage()

  startNextStage: () ->
    @stage += 1
    @nextStageSetup()
    @stageEndTime = Date.now() + STAGE_TIMES[@stage]
    if @stageTimeout?
      clearTimeout @stageTimeout
    @stageTimeout = setTimeout (() => @startNextStage()), @stageEndTime - Date.now()

  setupStageOne: () ->
    @stageOneAssigner = new FairAssigner (value for i, value of @problem.functions when value.stage == 1)
    @nextStageSetup = @setupStageTwo

  setupStageTwo: () ->
    saveState "endStageOne"
    @stageTwoAssigners = {}
    #initialize assigners
    for name, func of @problem.functions
      if func.stage == 1
        @stageTwoAssigners[name] = new FairAssigner (impl for i, impl of @impls[name])
    #for each player, convert view1 to view2
    for pid, playerView of @playerViews
      @convertPlayerViewToStage2 playerView
    saveState "startStageTwo"

  joinPlayer: (player) ->
    if player.id of @players
      return @playerViews[player.id]
    newPlayerView = new Model.PlayerView player, @
    newPlayerView.functions = newPlayerView.functions.concat @stageOneAssigner.assign FUNCS_PER_PLAYER
    @players[player.id] = player
    @playerViews[player.id] = newPlayerView
    if @stage > 1
      @convertPlayerViewToStage2 newPlayerView

  convertPlayerViewToStage2: (playerView) ->
    pid = playerView.player.id
    newPlayerView = new Model.PlayerView2 playerView
    console.log "player " + pid
    for fid, func of newPlayerView.functions
      console.log "  function " + fid
      impls = @stageTwoAssigners[fid].assign IMPLS_PER_FUNC
      implMap = {}
      reviewMap = {}
      for impl in impls
        pid = impl.player.id
        implMap[pid] = impl
        reviewMap[pid] = @reviews[fid][pid]
      newPlayerView.impls[fid] = implMap
      newPlayerView.reviews[fid] = reviewMap
    @playerView2s[pid] = newPlayerView

  getStatus: () ->
    return new Model.GameStatus @stage, @stageEndTime
  getInfo: () ->
    return new Model.GameInfo @problem.name, @getStatus(), @problem.families, @players

  setImpl: (newImpl) ->
    if newImpl.function.stage != @stage
      return "Server is currently at stage " + @stage + ", and can not accept that implementation"

    # see if newImpl is already in views/game, and if so, merge it in
    pid = newImpl.player.id
    fid = newImpl.function.name
    impls = @playerViews[pid].impls
    for impl, i in impls
      if impl.function.name == fid
        impls[i].code = newImpl.code
        return
    impls.push(newImpl)
    @impls[fid][pid] = newImpl
    @reviews[fid][pid] = new Model.ImplReviewSet newImpl
    return

class FairAssigner
  constructor: (@items) ->
    if @items.length <= 0
      console.warn "WARNING: Need at least one item to assign!"
    @itemsLeft = @items.slice 0
  assign: (count) ->
    assignment = []
    for i in [0...count]
      if @itemsLeft.length == 0
        @itemsLeft = @items.slice 0
      tryCount = 0
      n = Utils.randInt 0, @itemsLeft.length
      while @itemsLeft[n] in assignment and tryCount < 10
        n = Utils.randInt 0, @itemsLeft.length
        tryCount++
      if tryCount >= 10
        return assignment
      assignment.push @itemsLeft.splice(n, 1)[0]
    return assignment

game = new Game problems.sql
gameList = { sql: game}

# ------------- Server ---------------

getPlayerAndGame = (req, res) ->
  id = req.query.id
  game = req.params.game
  unless game of gameList
    res.send 404, "Requested game " + game + " not found on this server"
    return [null, null]
  unless id of playerRegistry.players
    res.send 403, "Your player ID was not recognized"
    return [null, null]
  return [playerRegistry.players[id], gameList[game]]

Module.useExpressServer = (app) ->
  app.use "/teamer/js", express.static(__dirname + "/js")
  app.use "/teamer/less", express.static(__dirname + "/less")
  app.use "/teamer/images", express.static(__dirname + "/images")
  app.use "/teamer/views", express.static(__dirname + "/views")

  app.get "/teamer", (req, res) ->
    res.sendfile __dirname + "/index.html"

  app.get "/teamerapi/game/:game/joinGame", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    game.joinPlayer player
    res.send 200, game.getInfo()

  app.get "/teamerapi/game/:game/getGameInfo", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    res.send 200, game.getInfo()

  app.get "/teamerapi/game/:game/getView", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    res.json game.playerViews[player.id].toJson()

  app.get "/teamerapi/game/:game/getView2", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    res.json game.playerView2s[player.id].toJson()

  app.post "/teamerapi/game/:game/submitImpl", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    console.log req.body
    error = game.setImpl Model.Implementation.fromJson req.body, game.problem.functions, game.players
    if error?
      res.send 403, error
    else
      res.send 200

  app.get "/teamerapi/game/:game/getFunctions", (req, res) ->
    [player, game] = getPlayerAndGame req, res
    unless player? then return
    res.json game.playerViews[player.id].functions

  app.get "/teamerapi/getProblems", (req, res) ->
    res.json Object.keys problems

  app.get "/teamerapi/login", (req, res) ->
    name = req.query.name
    id = playerRegistry.createNewPlayer name
    if id
      console.log id + "!!!!!!!!!!"
      res.send 200, id + ""
    else
      console.log id + "??????????"
      res.send 409, "User name " + name + " already taken, please try another."
