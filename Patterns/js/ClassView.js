// Generated by CoffeeScript 1.6.3
(function() {
  var ClassModel, Module, copy, extend, newElement;

  Module = {};

  window.ClassView = Module;

  ClassModel = window.ClassModel;

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

  newElement = function(tag) {
    return $(document.createElement(tag));
  };

}).call(this);