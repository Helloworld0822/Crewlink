FROM elixir:1.14

# install build deps
RUN apt-get update && apt-get install -y build-essential git npm nodejs yarn libpq-dev openssl

WORKDIR /app

COPY mix.exs mix.lock ./
COPY config ./config

RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get --only prod

COPY . .

RUN mix compile

EXPOSE 4000

CMD ["sh", "-c", "mix ecto.create && mix ecto.migrate && MIX_ENV=prod mix run --no-halt"]
