defmodule SiteBackend.Token do
  @moduledoc false

  @secret System.get_env("JWT_SECRET") || "dev_jwt_secret"

  def secret, do: @secret

  def signer do
    Joken.Signer.create("HS256", @secret)
  end
end
