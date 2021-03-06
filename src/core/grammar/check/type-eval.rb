
require 'core/grammar/check/gfold'
require 'core/grammar/check/types'
require 'core/grammar/check/deref-type'

# TODO: produces error messages when things are not found in schema.

class TypeEval < GrammarFold
  include GrammarTypes

  def initialize(schema, root_class, ctx)
    super(:+, :*, VOID, VOID)
    @schema = schema
    @root_class = root_class
    @ctx = ctx # owner class of field we're computing the type for
  end

  def Value(this, _);
    key = this.kind == 'sym' ? 'str' : this.kind
    Primitive.new(@schema.primitives[key])
  end

  def Ref(this, _)
    Klass.new(DerefType.deref(@schema, @root_class, @ctx, this.path))
  end

  def Create(this, _)
    #puts "Create: #{this.name}"
    Klass.new(@schema.classes[this.name])
  end

  def Lit(this, in_field)
    in_field ? Primitive.new(@schema.primitives['str']) : VOID
  end
end


if __FILE__ == $0 then
  if !ARGV[0] || !ARGV[1] || !ARGV[2] then
    puts "use type-eval.rb <name>.grammar <name>.schema <rootclass>"
    exit!(1)
  end


  require 'core/system/load/load'
  require 'core/grammar/check/reach-eval'
  require 'core/grammar/check/combine'
  require 'core/schema/tools/print'
  require 'pp'

  g = Load::load(ARGV[0])
  s = Load::load(ARGV[1])
  start = ARGV[2]

  #Print.print(s)


  tbl = ReachEval.reachable_fields(g)

  root_class = s.classes[start]

  result = combine(tbl, GrammarTypes::VOID) do |cr, f|
    te = TypeEval.new(s, root_class, s.classes[cr.name])
    te.eval(f.arg, true)
  end
  
  result.each do |c, fs|
    fs.each do |f, m|
      puts "#{c}.#{f}: #{m}"
    end
  end
end
