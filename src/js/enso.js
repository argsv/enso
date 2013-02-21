
define (function() {

  fs = require("fs");
  ARGV = process.argv.slice(1);
  
  S = function() {
   return  Array.prototype.slice.call(arguments).join("");
  }
    
  puts = function(obj) {
    console.log("" + obj);
  }
  
  EnsoHash = function(init) {
    var data = init;
    this.has_key_P = function(key) { return data.hasOwnProperty(key); };
    this._get = function(key) { 
      return data[key]; 
    };
    this.size = function() { 
      var count = 0;
      for (k in data) {
        if (data.hasOwnProperty(k))
          count++;
      }
      return count;
    };
    this._set = function(key, value) {
      data[key] = value;
    };
    this.each = function(fun) {
      for (k in data) {
        if (data.hasOwnProperty(k))
          fun(k, data[k]);
      }
    };
    this.each_value = function(fun) {
      for (k in data) {
        if (data.hasOwnProperty(k))
          fun(data[k]);
      }
    };
    this.keys = function() { 
      var keys = [];
      for (k in data) {
        if (data.hasOwnProperty(k))
          keys.push(k);
      }
      return keys;
    }
  }
  
  TrueClass = Boolean;
  FalseClass = Boolean;
  Proc = { new: function(p) { return p; } };
  
  System = {
    readJSON: function(path) {
      return JSON.parse(fs.readFileSync(path));
    },
    test_type: function(obj, type) {
      if (obj == null)
        return false;
      if (typeof type != "function")
        type = type.new;
      return obj.is_a_P(type); // TODO: why does this work, but "obj instanceof type" does not?
    }
  }
  
  Object.prototype.raise = function(msg) { puts(msg); return ERROR; }
  
  compute_rest_arguments = function(args, num) { 
    var x = new Array;
    while (num < args.length)
      x.push(args[num++]);
    return x;
  }

  Function.prototype.call_rest_args$ = function(obj, fun, args, rest) {
    var len = arguments.length;
    var newargs = [];
    var i;
    for (i = 1; i < len-2; i++) 
      newargs.push(arguments[i]);
    newargs = newargs.concat(arguments[len-1]); 
    return this.apply(a, newargs);
  }
  
  Array.prototype.any_P = Array.prototype.some;
  Object.prototype.has_key_P = Object.prototype.hasOwnProperty
  Array.prototype.each = function(fun) {  // Array.prototype.forEach;
    var i;
    for (i = 0; i < this.length; i++) {
      fun(this[i], i);
    }
  };
  Array.prototype.max = function() {
    var max;
    this.each(function(n) {
      if (max == undefined || n > max)
        max = n;
    });
    return max; 
  };
  Array.prototype.clone = function(fun) {  // Array.prototype.forEach;
    var i;
    var result = new Array;
    for (i = 0; i < this.length; i++) {
      result.push(this[i]);
    }
    return result;
  };
  Array.prototype.zip = function(other) {  // Array.prototype.forEach;
    var i;
    var result = new Array;
    for (i = 0; i < this.length; i++) {
      result.push([this[i], other[i]]);
    }
    return result;
  };
  
  Array.prototype.each_with_index = Array.prototype.each;
  
  Array.prototype.map = function(fun) {  // Array.prototype.forEach;
    var i;
    var result = new Array;
    for (i = 0; i < this.length; i++) {
      result.push(fun(this[i]));
    }
    return result;
  };
 
  Object.prototype.include_P =  function(obj) {  // Array.prototype.filter;
    var i;
    for (i = 0; i < this.length; i++) {
      if (this[i] == obj)
        return true;
    }
    return false;
  };  
  Array.prototype.select =  function(fun) {  // Array.prototype.filter;
    var i;
    var result = new Array;
    for (i = 0; i < this.length; i++) {
      if (fun(this[i]))
        result.push(this[i]);
    }
    return result;
  };
  Array.prototype.flat_map = function(fun) { 
    var x = new Array; 
    this.each(function(obj) { 
      x = x.concat(fun(obj));
    }); 
    return x; 
  };
  Array.prototype.concat = function(other) {
    var x = new Array; 
    var hasA, hasB;
    this.each(function(obj) { 
      x.push(obj);
      hasA = true;
    }); 
    other.each(function(obj) { 
      x.push(obj);
      hasb = true;
    }); 
    return x; 
  };
  Array.prototype.union = function(other) {
    var x = new Array; 
    this.each(function(obj) { 
      x.push(obj);
    }); 
    other.each(function(obj) {
      if (!x.contains(obj))
        x.push(obj);
    }); 
    return x; 
  };
  
    
  
  
  Object.prototype.each = function (cmd) {
    for (var i in this) {
      if (this.hasOwnProperty(i)) {
        var a = this[i];
        cmd.call(a, i, a)
      }
    }
  }

  _fixup_method_name = function(name) { 
    if (name.slice(-1) == "?") { 
      name = name.slice(0,-1) + "_P";
    } 
    return name; 
  }
  Object.prototype.find = function(pred) { 
    var result = null;
    this.each( function(a) {
      if (pred(a)) {
        result = a; 
      }
    });
    return result;
  }
  Object.prototype.find_first = Object.prototype.find;
  
  Object.prototype.is_a_P = function(type) { return this instanceof type; }
  Object.prototype.define_singleton_value = function(name, val) { this[_fixup_method_name(name)] = function() { return val;} }
  Object.prototype.define_singleton_method = function(proc, name) { this[_fixup_method_name(name)] = proc }
  String.prototype.to_s = function() { return this }
  Object.prototype.to_s = function() { return "" + this }
  Object.prototype._get = function(k) { return this[k] }
  String.prototype._get = function(k) { if (k >= 0) { return this[k] } else { return this[this.length+k] } }
  Object.prototype._set = function(k, v) { this[k] = v; return v; }
  String.prototype.gsub = String.prototype.replace;
  String.prototype.index = String.prototype.indexOf;
  String.prototype.to_sym = function() { return this; }
  string$split = String.prototype.split;
  String.prototype.split = function(sep, lim) {
    return string$split.call(this, sep, lim).filter(function(x) { return x != ""; });
  }
  string$slice = String.prototype.slice;
  String.prototype.slice = function(start, len) {
    if (len != undefined)
      len = start + len;
    return string$slice.call(this, start, len);
  }
  
  EnsoBaseClass = {
  }
  // put enso global methods here
  EnsoBaseClass._instance_spec_ = {  
    send: function(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      var val = this[method.replace("?", "_P")].apply(this, args);
      return val;
    },
    define_getter: function(name, prop) {
      this[name] = function() { return prop.get() }    // have to get "self" right
    },
    define_setter: function(name, prop) {
      this["set_" + name] = function(val) { 
        prop.set(val)
      }  // have to get "self" right
    },
    _get: function(k) { return this[k].call(this); },
    _set: function(k, v) { 
      return this["set_" + k].call(this, v);
    },
    method: function(m) { var self = this; 
      return function() { 
        return self[m].apply(self, arguments); 
    }},
    respond_to_P: function(method) { return this[method.replace("?", "_P")]; },
  }

  MakeClass = function(name, base_class, includes, meta_fun, instance_fun) {
      // NewClass = MakeClass(ParentClass, function(super) { return { 
      //    _class_: { 
      //         class_var1: init-value,            // @@var
      //         class_method: function(...) {...}  // def self.class_method(...) ...
      //         // the "new" method gets added here
      //     },
      //     initialize: function(..) {             // def intialize(..) 
      //        this.$.instance_var = init-value;   //    @instance_vaf = ...
      //     },
      //     instance_method: function(a, b) {    // def instance_method(a, b, *args)
      //        var self = this;                  // default preamble
      //        args = get_rest_arguments(arguments, 2)  // autogenerated call to set up rest args
      //        self.$.var                          // @var
      //        self._class_.var                    // @@var
      //        self.super$.foo.apply(self, arguments);    // super
      //        self.super$.foo.call(self, arg1, arg2...); // super(arg1, arg2)  # in foo method
      //        o.foo(a,b,*c)                       // o.foo.call_method(a, b, c)  # where call_method is in the library
      //     }
      //  }})
      // return value: the value of _class_ is the return value (or a synthetic new _class_ is added for you)
          
      // base_class is the *class* object of the base class
      // instance_fun returns the record containing fields for this object, given super
      //    which can contain a "_class_" field to specify its class data

      // create a class structure if there isn't one (for example, when inheriting Array)
      var parent_proto;
      if (typeof base_class === "function") {
        parent_proto = base_class.prototype;
        var temp = new Object(EnsoBaseClass);
        temp.new = base_class;
        base_class = temp;
      } else {
        if (base_class == null)
          base_class = EnsoBaseClass;
        parent_proto = base_class._instance_spec_;
      }

      // get the prototype of the base constructor function      
      // if there are mixins, then a clone of the mixin's prototype is inserted between object and base
      if (includes.length > 0) {
        var eigen = Object.create({});
    		for (var i = 0, len = includes.length; i < len; i++) {
    			var methods = includes[i];
    			for (var m in methods) {
    				if (methods.hasOwnProperty(m)) {
    				  eigen[m] = methods[m] 
    			  }
    			}
  	    }
        eigen.__proto__ = parent_proto;
        parent_proto = eigen;
      }
      else {
        // connect this instance_spec bindings to inherit the parent's instance_spec 
      }

      var instance_spec = new instance_fun(parent_proto);
      instance_spec.__classname__ = name;
      instance_spec.__proto__ = parent_proto;

      // make sure there is a class object 
      instance_spec._class_ = new Object({});
      instance_spec._class_.$ = base_class.$ || new Object({});
      meta_fun.call(instance_spec._class_);
      
      // connect this object's class data to the base class data 
      instance_spec._class_.__proto__ = base_class;
      // remember the instance_spec for each class
      instance_spec._class_._instance_spec_ = instance_spec;
      // make sure there is an initializer function
      instance_spec.initialize = instance_spec.initialize || function() {
          if (parent_proto.hasOwnProperty("initialize")) {
              parent_proto.initialize.apply(this, arguments);
          }
      };

      // create the constructor function      
      var constructor = function() {
         var obj = Object.create(instance_spec);
         obj.$ = {};

    obj.inspect = function() { 
       var kind = this.__classname__;
       if (this.schema_class)
         kind = this.schema_class().name();
       var info = "";
       if (typeof this.name == "function")
         info = this.name();
       else if (this._id)
         info = this._id();
       return "<[" + kind + " " + info + "]>";
    }
    obj.toString = obj.inspect;
    
         instance_spec.initialize.apply(obj, arguments);
         return obj;
      }
      // set its prototype, even thought it is not actually used view "new"
      // it is accessed above
      // fill in the "new" function of the class
      instance_spec._class_.new = constructor;
      // return the new class
      return instance_spec._class_;
  }  

  EnsoProxyObject = EnsoBaseClass;
  
  MakeMixin = function(includes, instance_fun) {
      var instance_spec = new instance_fun();
      // get all methods defined in this mixin and its parents
      	var methods = {};
      	if (includes.length > 0) {
    			for (var i = 0, len = includes.length; i < len; i++) {
    				var incld = includes[i];
            for (var attr in incld) {
              if (incld.hasOwnProperty(attr)) { 
                methods[attr] = incld[attr]
               }
            }
    			}
      	}
      	for (var attr in instance_spec) {
      		if (instance_spec.hasOwnProperty(attr)) { 
      		  methods[attr] = instance_spec[attr]
      		 }
      	}
      	return methods
   }

    Range = MakeClass("Range", null, [], 
    function() {},
    function(super$) { return {
      intialize: function(a, b) {
        this.$.a = a;
        this.$.b = b;
      },
      each: function(proc) {
        var i;
        for (i = this.$.a; i <= this.$.a; i++)
          proc(i);
      }       
    }});   
   Enumerable = MakeMixin([], function() {
     this.all_P= function(pred) { var x = true; this.each(function(obj) { x = x && pred(obj) }); return x; };
     this.any_P= function(pred) { var x = false; this.each(function(obj) { x = x || pred(obj) }); return x; };
   });

})
