
class Nullable

  def initialize
    @memo = {}
  end

  def nullable?(this)
    if @memo[this] then
      @memo[this]
    else
      @memo[this] = true
      if respond_to?(this.schema_class.name) then
        @memo[this] = send(this.schema_class.name, this)
      else
        @memo[this] = nullable?(this.arg)
      end
    end
  end

  def Sequence(this)
    this.elements.inject(true) do |cur, elt|
      cur && nullable?(elt)
    end
  end

  def Alt(this)
    # NB: this.alts is never empty
    this.alts.inject(false) do |cur, alt|
      cur || nullable?(alt)
    end
  end

  def Call(this)
    nullable?(this.rule)
  end

  def Create(this)
    # this is essential because it will also
    # produce an object instance, hence non-nil
    false
  end

  def Lit(this)
    this.value == ''
  end

  def Value(this)
    false
  end

  def Ref(this)
    false
  end

  def Regular(this)
    this.optional
  end

end