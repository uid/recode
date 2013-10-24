Module = {}
window.PuzzleSpecs = Module

# --------------Puzzle Specs-------------------

Module.simpleRace =
  name: "Simple Race"
  description: "A simple race condition to make sure this works"
  shared:
    balance: 100
  processes:
    A:
      memory: {}
      commands: [
        { type: "Get", local: "atemp", shared: "balance" },
        { type: "Increment", variable: "atemp", increment: 3 },
        { type: "Set", local: "atemp", shared: "balance" }
      ]
    B:
      memory: {}
      commands: [
        { type: "Get", local: "btemp", shared: "balance" },
        { type: "Increment", variable: "btemp", increment: -7 },
        { type: "Set", local: "btemp", shared: "balance" }
      ]
  finish:
    shared:
      balance: 96
