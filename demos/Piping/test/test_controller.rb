require 'test/unit'

require 'core/system/load/load'
require '../demos/Piping/code/controller'

class PipingControllerTest < Test::Unit::TestCase

  def test_controller
    name = 'boiler'

    grammar = Load::load('piping.grammar')
    schema = Load::load('piping-sim.schema')
    control = Load::load("#{name}.controller")
    pipes = Load::load_with_models("#{name}.piping", grammar, schema)
    controller = Controller.new(control, pipes)

    #just make sure it runs 100 cycles
    for i in 0..100
      controller.run
    end
  end

end
