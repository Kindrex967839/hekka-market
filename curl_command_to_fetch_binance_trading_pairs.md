
 curl -X GET "https://api.binance.us/api/v3/exchangeInfo" | jq '.symbols[] | .symbol'


