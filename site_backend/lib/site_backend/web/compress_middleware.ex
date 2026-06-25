defmodule SiteBackend.Web.CompressMiddleware do
  @moduledoc """
  Negotiates response compression based on the request's
  `Accept-Encoding` header.

  Plug.Cowboy does not enable compression by default. We wrap the
  response body for `text/*`, `application/json`, and
  `application/javascript` payloads, gzip-encoding them when the
  client offers it. Compression is skipped for small payloads
  (< 1 KB) where the CPU cost outweighs the bandwidth saving.

  Brotli is intentionally not used here because it requires a
  NIF (`:brotli`) and the public-facing nginx in front of us
  already handles brotli when the upstream can serve it. Putting
  brotli in the BEAM as well would double-encode.
  """

  @behaviour Plug

  import Plug.Conn

  @min_size 1024

  @content_types ~w(
    text/plain
    text/html
    text/css
    text/javascript
    text/xml
    application/json
    application/javascript
    application/xml
    application/xml+rss
    image/svg+xml
  )

  def init(opts), do: opts

  def call(conn, _opts) do
    register_before_send(conn, fn conn ->
      conn
      |> compress_response()
      |> apply_compressed_body()
    end)
  end

  defp apply_compressed_body(conn) do
    case conn.assigns[:__compressed_body] do
      body when is_binary(body) ->
        %{conn | resp_body: body}

      _ ->
        conn
    end
  end

  defp compress_response(conn) do
    cond do
      not eligible?(conn) -> conn
      true ->
        case pick_encoding(get_req_header(conn, "accept-encoding")) do
          nil ->
            conn

          "gzip" ->
            maybe_compress(conn, :gzip)

          "identity" ->
            conn

          _ ->
            conn
        end
    end
  end

  # ── helpers ────────────────────────────────────────────────

  defp eligible?(conn) do
    conn.state == :sent and
      response_content_type(conn) in @content_types and
      not chunked?(conn) and
      get_resp_header(conn, "content-encoding") == []
  end

  defp chunked?(conn), do: get_resp_header(conn, "transfer-encoding") == ["chunked"]

  defp response_content_type(conn) do
    case get_resp_header(conn, "content-type") do
      [value | _] -> value |> String.split(";", parts: 2) |> List.first() |> String.trim()
      _ -> nil
    end
  end

  defp response_body(conn) do
    case conn.assigns[:__compressed_body] do
      compressed when is_binary(compressed) -> compressed
      _ ->
        case conn.resp_body do
          %Plug.Conn.Unfetched{} -> nil
          body when is_binary(body) -> body
          _ -> nil
        end
    end
  end

  defp pick_encoding(headers) do
    cond do
      Enum.any?(headers, &String.contains?(&1, "gzip")) -> "gzip"
      Enum.any?(headers, &(&1 == "identity")) -> "identity"
      true -> nil
    end
  end

  defp maybe_compress(conn, encoding) do
    body = response_body(conn)
    size = byte_size(body || "")

    if is_nil(body) or size < @min_size do
      conn
    else
      compressed = gzip(body)

      if byte_size(compressed) < size do
        # Mutate resp_body + headers in place. Do NOT call send_resp
        # here – the outer send_resp call will run our other
        # before_send hooks (CacheMiddleware) exactly once.
        conn
        |> put_resp_header("content-encoding", encoding)
        |> put_resp_header("vary", "Accept, Accept-Encoding")
        |> put_resp_header("content-length", Integer.to_string(byte_size(compressed)))
        |> Plug.Conn.assign(:__compressed_body, compressed)
      else
        conn
      end
    end
  end

  defp gzip(body), do: :zlib.gzip(body)
end
