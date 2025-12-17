# near-api-battle-test


In this repo you can test how NAT would handle 10k parallel transactions, 
sent by 1 account with 100 full access keys;

We have 10 different accounts, and send to them 
5k native transfer + 5k FT transfer calls transactions;

Average testnet results;

```
Start preparations...
User FT Balance (in units): 100000000
Preparations done:: 34.846s
Start adding keys...
Adding keys done:: 2.276s
nabt-receiver-0.eclipseer.testnet ft balance (units): 0
Run 10000 transactions...
10000 transactions done:: 3:48.278 (m:ss.mmm)
HTTP requests send: 10060
nabt-receiver-0.eclipseer.testnet ft balance (units): 1500000
Start cleanup...
End cleanup:: 2.665s
Total HTTP requests: 10119
Whole test took:: 4:37.327 (m:ss.mmm)
```
