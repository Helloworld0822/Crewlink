defmodule SiteBackend.Auth do
  @moduledoc false
  alias Joken.Signer

  @secret System.get_env("JWT_SECRET") || "dev_jwt_secret"

  def generate_jwt(claims) when is_map(claims) do
    signer = Signer.create("HS256", @secret)
    token = Joken.generate_and_sign!(claims, signer)
    {:ok, token, claims}
  end

  def verify_jwt(token) do
    signer = Signer.create("HS256", @secret)
    Joken.verify_and_validate(token, signer)
  end
end
