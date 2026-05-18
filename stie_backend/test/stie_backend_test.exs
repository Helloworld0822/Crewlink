defmodule StieBackendTest do
  use ExUnit.Case
  doctest StieBackend

  test "greets the world" do
    assert StieBackend.hello() == :world
  end
end
