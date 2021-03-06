require 'core/system/load/load'
require 'core/schema/tools/union'
require 'core/schema/tools/rename'
require 'core/grammar/tools/rename_binding'
#require 'core/feature/code/rename'
require 'core/diff/code/equals'

module BuildFeature

  #load the triumvirate of schema, grammar, stencil
  def self.load_feature(name)
    f = Loader.build_feature('#{name}.feature')
    #if f.nil?
      f={}
      begin f['schema'] = Load::load("#{name}.schema"); rescue EOFError; end
      begin f['grammar'] = Load::load("#{name}.grammar"); rescue EOFError; end
    #end
    f
  end

  def self.cache_feature(name, feature)
    feature.each do |type,obj|
      Load::load_cache("#{name}.#{type}", obj)
    end
  end

  def build_Feature(rules, args={})
    rules.each do |rule|
      build(rule, args + {:env=>{}, :rules=>rules}) if rule.save
    end
  end

  def build_Rule(lhs, rhs, save, args={})
    args[:env][lhs] = build(rhs, args)
    BuildFeature.cache_feature(lhs, args[:env][lhs]) if save
  end

  #note that building a feature as a var is different
  # from loading a feature as a file!
  def build_Var(name, args={})
    if args[:env][name].nil?
      if args[:rules][name].nil?
        args[:env][name] = BuildFeature.load_feature(name)
      else
      puts "dont be here"
        build(args[:rules][name], args)
      end
    end
    args[:env][name]
  end

  def build_File(path, as, args={})
    _ , type = path.split(".")
    obj = if !as.nil?
      g = Load::load("#{as}.grammar")
      s = Load::load("#{as}.schema")
      Load::load_with_models(path, g, s)
    elsif type!="rb"
      Load::load(path)
    else
      #load code
    end
    {type => obj}
  end

  # When A . B, anything in B overwrites A
  def build_Dot(e1, e2, args={})
    f = {}
    f1 = build(e1, args)
    f2 = build(e2, args)
    types = (f1.keys+f2.keys).uniq
    types.each do |type|
      f[type] = if f1[type].nil?
        f2[type]
      elsif f2[type].nil?
        f1[type]
      else
        a = f1[type]
        b = f2[type]
        case type
          when "schema"
            union(a, b)
          when "grammar"
            res = union(a, b)
            res.start = res.rules[a.start.name]
            res
          when "stencil"
            res = union(a, b)
            res.root = a.root
            res
          else
            union(a, b)
        end
      end
    end
    f
  end

  def build_Rename(e, from, to, args={})
    f1 = build(e, args)
    f1.merge(f1) do |type,obj|
      case type
        when "schema"
          rename(obj, {from => to})
        when "grammar"
          rename(obj, {from => to})
        when "stencil"
          #I have no idea how to do this
          #probably need to make something like rename binding
          obj
        else
          #ditto
          obj
      end
    end
  end
end
