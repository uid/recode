Module = {}
module.exports = Module

express = require "express"
http = require "http"
fs = require "fs"
assert = require "assert"
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

FUNCS_PER_PLAYER = 1

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
    @players = {} # id -> GamePlayer
    @impls = {} # problem -> implementation
    @stage = 0
    @stageOneAssigner = new FairAssigner (value for i, value of @problem.functions)
  addPlayer: (player) ->
    if player.id of @players
      return @players[player.id]
    newPlayer = new GamePlayer player, @
    newPlayer.functions.concat @stageOneAssigner.assign FUNCS_PER_PLAYER
    @players[player.id] = newPlayer
  getStatus: () ->
    return new Model.GameStatus @stage, 10
  getInfo: () ->
    return new Model.GameInfo @problem.name, @getStatus(), @problem.families

class GamePlayer
  constructor: (@player, @game) ->
    @functions = []
    @impls = []

class FairAssigner
  constructor: (@items) ->
    assert @items.length > 0, "Need at least one item to assign!"
    @itemsLeft = @items.slice 0
  assign: (count) ->
    assignment = []
    for i in [0...count]
      if @itemsLeft.length == 0
        @itemsLeft = @items.slice 0
      n = Utils.randInt 0, @itemsLeft.length
      assignment.concat @itemsLeft.splice n, 1
    return assignment

game = new Game problems.sql
gameList = { sql: game}

# ------------- Server ---------------

Module.useExpressServer = (app) ->
  app.use "/teamer/js", express.static(__dirname + "/js")
  app.use "/teamer/less", express.static(__dirname + "/less")
  app.use "/teamer/images", express.static(__dirname + "/images")
  app.use "/teamer/views", express.static(__dirname + "/views")

  app.get "/teamer", (req, res) ->
    res.sendfile __dirname + "/index.html"

  app.get "/teamerapi/game/:game/joinGame", (req, res) ->
    id = req.query.id
    game = req.params.game
    unless game of gameList
      res.send 404, "Requested game " + game + " not found on this server"
    unless id of playerRegistry.players
      res.send 403, "Your player ID was not recognized"
    gameList[game].addPlayer playerRegistry.players[id]
    res.send 200, gameList[game].getInfo()

  app.get "/teamerapi/getProblems", (req, res) ->
    res.json Object.keys problems

  app.get "/teamerapi/problem/:problem/start", (req, res) ->
    
  app.get "/teamerapi/problem/:problem/getFunctions", (req, res) ->
    res.json problems[req.params.problem].functions

  app.get "/teamerapi/login", (req, res) ->
    name = req.query.name
    id = playerRegistry.createNewPlayer name
    if id
      console.log id + "!!!!!!!!!!"
      res.send 200, id + ""
    else
      console.log id + "??????????"
      res.send 409, "User name " + name + " already taken, please try another."
