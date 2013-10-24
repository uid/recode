// Generated by CoffeeScript 1.6.3
(function() {
  var Module, PuzzleSpecs, RacerCode, copy, createElement, createPuzzleOutput, createPuzzleTable, executePuzzle, extend, fillInCommandsColumn, finishExecution, getProcessToCssNumMapping, initPuzzle, printMemoryState;

  Module = {};

  window.RacerView = Module;

  PuzzleSpecs = window.PuzzleSpecs;

  RacerCode = window.RacerCode;

  extend = function(obj, mixin) {
    var method, name;
    for (name in mixin) {
      method = mixin[name];
      obj[name] = method;
    }
    return obj;
  };

  copy = function(obj) {
    return extend({}, obj);
  };

  createElement = function(tag) {
    return $(document.createElement(tag));
  };

  getProcessToCssNumMapping = function(processes) {
    var count, cssMapping, name, process;
    cssMapping = {};
    count = 0;
    for (name in processes) {
      process = processes[name];
      cssMapping[name] = count;
      count++;
    }
    return cssMapping;
  };

  Module.initPuzzle = initPuzzle = function(root) {
    var cssMapping, ordering, puzzleSet, puzzleSpec;
    puzzleSpec = PuzzleSpecs[root.attr("data-puzzleset")];
    if (puzzleSpec == null) {
      throw new Error("Could not find puzzle " + (root.attr("data-puzzleset")));
    }
    puzzleSet = new RacerCode.PuzzleSet(puzzleSpec);
    ordering = new RacerCode.ExecutionOrder(puzzleSet);
    cssMapping = getProcessToCssNumMapping(puzzleSet.processes);
    root.data("puzzleSet", puzzleSet).data("ordering", ordering).data("cssMapping", cssMapping);
    createPuzzleTable(root, puzzleSet, ordering.ordering, cssMapping);
    root.append(createElement("div").attr("data-role", "executionResult"));
    if (puzzleSpec.finish != null) {
      createPuzzleOutput(root, puzzleSet.finish, cssMapping);
    }
    fillInCommandsColumn(root, puzzleSet.processes, ordering.ordering, cssMapping);
    return root.append(createElement("button").attr("type", "button").addClass("btn").addClass("btn-primary").text("Execute!").click((function() {
      return function() {
        return executePuzzle(root, puzzleSet, ordering, cssMapping);
      };
    })()));
  };

  printMemoryState = function(element, name, num, values) {
    var field, value;
    if (name !== "shared") {
      element.addClass("process" + num);
    }
    for (field in values) {
      value = values[field];
      element.append(createElement("div").text(field + ": " + value));
    }
    return element;
  };

  Module.executePuzzle = executePuzzle = function(root, puzzleSet, ordering, cssMapping) {
    var cells, cssNum, error, processName, processes, row, rows, _i, _len;
    puzzleSet.reset();
    processes = puzzleSet.processes;
    rows = root.find("tbody tr");
    for (_i = 0, _len = rows.length; _i < _len; _i++) {
      row = rows[_i];
      cells = $(row).children();
      processName = cells.first().children().first().data("processName");
      try {
        processes[processName].step();
      } catch (_error) {
        error = _error;
        if (error instanceof RacerCode.ExecutionError) {
          cells.eq(1 + cssMapping[processName]).text("HALT: " + error.message);
          break;
        } else {
          throw error;
        }
      }
      for (processName in cssMapping) {
        cssNum = cssMapping[processName];
        printMemoryState(cells.eq(1 + cssNum), processName, cssNum, processes[processName].getState());
      }
      printMemoryState(cells.eq(-1), "shared", -1, puzzleSet.memories["shared"].state.values);
    }
    if (puzzleSet.finish != null) {
      return finishExecution(root, puzzleSet);
    }
  };

  finishExecution = function(root, puzzleSet) {
    var diff;
    diff = puzzleSet.checkFinish();
    if (diff.length > 0) {
      return root.find("[data-role='executionResult']").empty().append(createElement("div").addClass("alert").addClass("alert-success").text("Congratulations! You found an execution order which breaks the program!"));
    } else {
      return root.find("[data-role='executionResult']").empty().append(createElement("div").addClass("alert").addClass("alert-danger").text("This execution order comes out correct. Try ordering them differently!"));
    }
  };

  createPuzzleTable = function(root, puzzleSet, ordering, cssMapping) {
    var alignedProcessLabels, cssNum, processName, processStartStates, processStateLabels, rowTemplate, table, tbody, thead, _i, _len;
    alignedProcessLabels = [];
    processStateLabels = [];
    processStartStates = [];
    rowTemplate = createElement("tr").append(createElement("td").addClass("alignedCode"));
    for (processName in cssMapping) {
      cssNum = cssMapping[processName];
      alignedProcessLabels[cssNum] = createElement("div").addClass("process" + cssNum).text("Process " + processName);
      processStateLabels[cssNum] = createElement("th").addClass("process" + cssNum).text(processName + " Memory State");
      processStartStates[cssNum] = printMemoryState(createElement("td").addClass("process" + cssNum), processName, cssNum, puzzleSet.memories[processName].state.values);
      rowTemplate.append(createElement("td").addClass("process" + cssNum));
    }
    rowTemplate.append(createElement("td"));
    thead = createElement("thead").append(createElement("tr").append(createElement("th").addClass("alignedCode").append(alignedProcessLabels)).append(processStateLabels).append(createElement("th").text("Shared Memory State"))).append(createElement("tr").append(createElement("td").text("---initial state---").addClass("codeDesc")).append(processStartStates).append(printMemoryState(createElement("td"), "shared", -1, puzzleSet.memories["shared"].state.values)));
    tbody = createElement("tbody");
    for (_i = 0, _len = ordering.length; _i < _len; _i++) {
      processName = ordering[_i];
      tbody.append(rowTemplate.clone());
    }
    return table = createElement("table").addClass("puzzleTable").append(thead).append(tbody).appendTo(root);
  };

  createPuzzleOutput = function(root, finish, cssMapping) {
    var area, box, data, name, _results;
    root.append(createElement("h4").text("Processes should complete with following memory state:"));
    box = createElement("div").addClass("code").appendTo(root);
    _results = [];
    for (name in finish) {
      data = finish[name];
      area = createElement("div").text(name + ":").appendTo(box);
      printMemoryState(area, name, cssMapping[name], data);
      _results.push(area.children().addClass("indentleft"));
    }
    return _results;
  };

  fillInCommandsColumn = function(root, processes, ordering, cssMapping) {
    var cell, command, commandCells, commands, process, processName, _i, _len, _results;
    commandCells = root.find("tbody td:first-child");
    commands = {};
    ordering = ordering.slice(0);
    for (processName in processes) {
      process = processes[processName];
      commands[processName] = process.commands.slice(0);
    }
    _results = [];
    for (_i = 0, _len = commandCells.length; _i < _len; _i++) {
      cell = commandCells[_i];
      processName = ordering.shift();
      command = commands[processName].shift();
      _results.push($(cell).empty().append(createElement("div").addClass("process" + cssMapping[processName]).text(command.label).data("processName", processName)));
    }
    return _results;
  };

}).call(this);

/*
//@ sourceMappingURL=RacerView.map
*/