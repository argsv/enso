

require 'core/system/load/load'
require 'core/schema/tools/print'
require 'core/grammar/render/layout'
require 'core/query/code/eval'

if __FILE__ == $0 then

  g = Loader.load('oql.grammar')
  puts g.to_s

  s = Loader.load('oql.schema')
  puts s.to_s

  q = Loader.load('test.oql')
  puts q.to_s

  Print.print(q)

  ss = Loader.load('schema.schema')

  eval = EvalOQL.new(Factory.new(s))

  x = eval.run(q, s)
  puts x.to_s

  
  
end
