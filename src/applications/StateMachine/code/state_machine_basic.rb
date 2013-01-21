
require 'core/system/load/load'
require 'core/schema/tools/print'

def run_state_machine(sm)
  current = sm.start
  puts "#{current.name}"
  while $stdin.gets
    input = $_.strip
    trans = current.out.find do |trans|
      trans.event == input
    end
    current = trans.to
    puts "#{current.name}"
  end
end

if __FILE__ == $0
  sm = Loader.load(ARGV[0])
  run_state_machine(sm)
end

