# @mfe/cli

## Commands

```sh
npx @mfe/cli pull
```

Pulls `apps` actual state from their repositories using specified `branches`

```sh
npx @mfe/cli install
```

Runs `yarn install` for each of `apps`

```sh
npx @mfe/cli start
```

Runs `yarn prestart` and `yarn start` for each of `apps` in parallel

```sh
npx @mfe/cli start:prod
```

Runs `yarn prestart:prod` and `yarn start:prod` for each of `apps` in parallel