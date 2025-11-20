# Обновление данных Solana ETF

После добавления новых полей (vanEck, fidelity, twentyOneShares) в таблицу sol_flow, нужно перепарсить данные, чтобы обновить существующие записи.

## Способ 1: Через API эндпоинт

```bash
# В контейнере backend или с хоста
curl -X POST http://localhost:3066/api/etf-flow/parse-solana
```

## Способ 2: Через общий эндпоинт обновления

```bash
curl -X POST http://localhost:3066/api/etf-flow/update-now
```

Это обновит все ETF данные (Ethereum, Bitcoin, Solana).

## Способ 3: Вручную в контейнере

```bash
docker exec -it etf_backend sh
# Затем в контейнере можно вызвать через curl или через Node
```

После парсинга все существующие записи в таблице sol_flow будут обновлены с новыми полями.

