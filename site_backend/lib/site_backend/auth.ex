defmodule SiteBackend.Auth do
  @moduledoc false

  alias SiteBackend.Token

  def generate_jwt(claims) when is_map(claims) do
    full_claims = Map.merge(default_claims(), claims)
    Joken.encode_and_sign(full_claims, Token.signer(), [])
  end

  def verify_jwt(token) when is_binary(token) do
    with {:ok, claims} <- Joken.verify(token, Token.signer(), []),
         :ok <- check_exp(claims) do
      {:ok, claims}
    end
  end

  def verify_jwt(_), do: {:error, :invalid_token}

  defp check_exp(claims) do
    case Map.get(claims, "exp") do
      exp when is_integer(exp) ->
        if exp > Joken.current_time(), do: :ok, else: {:error, :expired}

      _ ->
        :ok
    end
  end

  defp default_claims do
    %{
      "iss" => "outsourcing_site",
      "aud" => "outsourcing_site",
      "exp" => Joken.current_time() + 3600
    }
  end
end
