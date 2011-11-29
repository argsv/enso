
require 'core/system/library/schema'
require 'core/system/load/load'
require 'core/grammar/code/typeof'


## TODO: check for (possible) multiplicity violations

class CheckGrammar

  def self.check(grammar, schema)
    self.new(schema).check(grammar.start)
  end

  def initialize(schema)
    @schema = schema
    @typeof = TypeOf.new(schema)
    @memo = {}
  end

  def check(this, klass = nil, errors = [])
    if respond_to?(this.schema_class.name)
      send(this.schema_class.name, this, klass, errors)
    end
    errors
  end


  def Sequence(this, klass, errors)
    this.elements.each do |elt|
      check(elt, klass, errors)
    end
  end
  
  def Call(this, klass, errors)
    # NB: it essential we memoize on calls
    # *not* on rules, because we have to 
    # traverse rules multiple times for
    # different call sites
    return if @memo[this]
    @memo[this] = true
    check(this.rule, klass, errors)
  end

  def Rule(this, klass, errors)
    return unless this.arg
    check(this.arg, klass, errors)
  end

  def Create(this, _, errors)
    klass = @schema.classes[this.name]
    if !klass then
      errors << undef_class_error(this.name, this._origin)
    end
    check(this.arg, klass, errors)
  end

  def Field(this, klass, errors)
    if klass then

      # Memoize on field/klass combo
      @memo[this] ||= []
      return if @memo[this].include?(klass)
      @memo[this] << klass


      field = klass.fields[this.name]
      if field then
        # a set of types to deal with alternatives
        ts = @typeof.typeof(this.arg) 
        if ts.empty? then
          errors << field_error("no type available", field, this._origin)
        else
          t1 = field.type
          ts.each do |t2|
            if t2.nil? then
              errors << field_error("untypable symbol", field, this._origin)
            elsif t1.Primitive? && t2.Primitive? && t1 != t2 then
              errors << field_error("primitive mismatch #{t2.name} vs #{t1.name}", field, this._origin)
            elsif t1.Primitive? != t2.Primitive? then
              errors << field_error("type mismatch #{t2.name} vs #{t1.name}", field, this._origin)
            elsif !Subclass?(t2, t1) then
              # it now gives an error for each concrete class (mentioned in the grammar)
              # could do a lub if all types in ts are classes and the lub exists.
              errors << field_error("class mismatch #{t2.name} vs #{t1.name}", field, this._origin)
            end
          end
        end
      else
        errors << undef_field_error(this.name, klass, this._origin)
      end
    end

    # continue checking the argument
    check(this.arg, klass, errors)
  end

  def Alt(this, klass, errors)
    this.alts.each do |alt|
      check(alt, klass, errors)
    end
  end

  def Ref(this, _, errors)
    klass = @schema.classes[this.name]
    unless klass then
      errors << undef_class_error(this.name, this._origin)
    end
  end

  def Regular(this, klass, errors)
    check(this.arg, klass, errors)
  end

  private

  def undef_class_error(name, org)
    Error.new("undefined class #{name}", org)
  end

  def undef_field_error(name, klass, org)
    Error.new("undefined field #{klass.name}.#{name}", org)
  end

  def field_error(msg, fld, org)
    Error.new("#{msg} for #{fld.owner.name}.#{fld.name}", org)
  end

  class Error
    attr_reader :msg, :loc
    def initialize(msg, loc)
      @msg = msg
      @loc = loc
    end

    def to_s
      "#{msg}#{loc && (': ' + loc.to_s)}"
    end
  end



end



if __FILE__ == $0 then
  gg = Loader.load('grammar.grammar')
  gs = Loader.load('grammar.schema')
  check = CheckGrammar.new(gs)
  errs = check.check(gg.start)

  puts "Errors for grammar.grammar"
  errs.each do |err|
    puts err
  end

  sg = Loader.load('schema.grammar')
  ss = Loader.load('schema.schema')
  check = CheckGrammar.new(ss)
  errs = check.check(sg.start)

  puts "Errors for schema.grammar"
  errs.each do |err|
    puts err
  end


  wg = Loader.load('todo.grammar')
  ws = Loader.load('todo.schema')
  check = CheckGrammar.new(ws)
  errs = check.check(wg.start)

  puts "Errors for todo.grammar"
  errs.each do |err|
    puts err
  end


  wg = Loader.load('web.grammar')
  ws = Loader.load('web.schema')
  check = CheckGrammar.new(ws)
  errs = check.check(wg.start)

  puts "Errors for web.grammar"
  errs.each do |err|
    puts err
  end

end

