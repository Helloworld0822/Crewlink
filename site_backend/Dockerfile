FROM elixir:latest

# install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg build-essential git libpq-dev openssl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY mix.exs mix.lock ./
COPY config ./config

RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get --only prod

COPY . .

RUN mix compile

EXPOSE 4000

CMD ["sh", "-c", "mix ecto.create && mix ecto.migrate && MIX_ENV=prod mix run --no-halt"]
