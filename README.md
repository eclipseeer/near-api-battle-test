# NEAR API TS vs NEAR KIT Benchmark Comparison

## Key conclusions: 

> “Better” rules: **lower is better** for time/HTTP, **higher is better** for Success rate / TPS. `×` shows how many times the leader is better.

**In Sandbox**, NEAR KIT is ~1.8× faster overall and ~1.7× faster in the transaction phase, but that speed comes with a big reliability cost (~24% rejected transactions) and ~5–7× higher HTTP overhead per successful tx. 

**On INTEAR PRIVATE testnet**, NEAR API TS dominates hard: ~7–12× faster end-to-end depending on the scenario, with 2–6× fewer HTTP requests and near-perfect reliability. 

**On FASTNEAR PUBLIC testnet**, NEAR KIT can be faster on small loads (10/100) while NEAR API TS stays more network-efficient; at higher pressure (25/500) NEAR KIT collapses with 429 rate limits and a 14.4% success rate, while NEAR API TS remains 100% successful.



## SANDBOX — 100 keys / 10K tx / 10 receivers (avg of 3 runs)

| Metric                | NEAR API TS | NEAR KIT | Leader (×) |
|-----------------------|---:|---:|---|
| Preparations          | 13.267 s | 4.168 s | NEAR KIT (3.18× faster) |
| Adding keys           | 554.4 ms | 547.3 ms | NEAR KIT (1.01× faster) |
| 10K Transactions time | 1:42.268 | 58.918 s | NEAR KIT (1.74× faster) |
| Whole test            | 1:57.342 | 1:03.694 | NEAR KIT (1.84× faster) |
| Success rate          | 100.0% | 76.0% | NEAR API TS (1.32× better) |
| Rejected txs          | 0 | 2402 | NEAR API TS (∞× fewer) |
| HTTP sent             | 10009 | 52195 | NEAR API TS (5.21× fewer) |
| HTTP total            | 10063 | 52228 | NEAR API TS (5.19× fewer) |
| HTTP / successful tx  | 1.006 | 6.874 | NEAR API TS (6.83× fewer) |
| Successful TPS        | 97.8 | 129.0 | NEAR KIT (1.32× higher) |

**Quick takeaways (SANDBOX):**
- **NEAR KIT** is faster on total time (~**1.84×**) and transaction phase (~**1.74×**), but has **~24% rejected tx**.
- **NEAR API TS** delivers **100% success** and is much more network-efficient: **~5.2× fewer HTTP** per test and **~6.8× fewer HTTP per successful tx**.

---

## Testnet — INTEAR PRIVATE

### 5 keys / 50 tx / 5 receivers

| Metric               | NEAR API TS | NEAR KIT | Leader (×) |
|----------------------|---:|---:|---|
| Preparations         | 29.549 s | 3:04.534 | NEAR API TS (6.25× faster) |
| Adding keys          | 2.881 s | 3.098 s | NEAR API TS (1.08× faster) |
| 50 Transactions time | 34.638 s | 5:39.273 | NEAR API TS (9.79× faster) |
| Whole test           | 1:11.000 | 8:51.470 | NEAR API TS (7.49× faster) |
| Success rate         | 100.0% | 100.0% | ≈ equal |
| Rejected txs         | 0 | 0 | ≈ equal |
| HTTP sent            | 51 | 146 | NEAR API TS (2.86× fewer) |
| HTTP total           | 87 | 202 | NEAR API TS (2.32× fewer) |
| HTTP / successful tx | 1.740 | 4.040 | NEAR API TS (2.32× fewer) |
| Successful TPS       | 1.4 | 0.1 | NEAR API TS (9.79× higher) |

### 10 keys / 100 tx / 10 receivers

| Metric                | NEAR API TS | NEAR KIT | Leader (×) |
|-----------------------|---:|---:|---|
| Preparations          | 46.664 s | 3:04.879 | NEAR API TS (3.96× faster) |
| Adding keys           | 2.472 s | 3.697 s | NEAR API TS (1.50× faster) |
| 100 Transactions time | 36.751 s | 7:53.237 | NEAR API TS (12.86× faster) |
| Whole test            | 1:31.023 | 11:02.167 | NEAR API TS (7.28× faster) |
| Success rate          | 100.0% | 98.0% | NEAR API TS (1.02× better) |
| Rejected txs          | 0 | 2 | NEAR API TS (∞× fewer) |
| HTTP sent             | 101 | 568 | NEAR API TS (5.62× fewer) |
| HTTP total            | 156 | 614 | NEAR API TS (3.94× fewer) |
| HTTP / successful tx  | 1.560 | 6.265 | NEAR API TS (4.02× fewer) |
| Successful TPS        | 2.7 | 0.2 | NEAR API TS (13.11× higher) |

---

## Testnet — FASTNEAR PUBLIC

### 10 keys / 100 tx / 10 receivers

| Metric                | NEAR API TS | NEAR KIT | Leader (×) |
|-----------------------|---:|---:|---|
| Preparations          | 42.717 s | 14.424 s | NEAR KIT (2.96× faster) |
| Adding keys           | 2.778 s | 2.299 s | NEAR KIT (1.21× faster) |
| 100 Transactions time | 35.300 s | 21.091 s | NEAR KIT (1.67× faster) |
| Whole test            | 1:24.357 | 42.272 s | NEAR KIT (2.00× faster) |
| Success rate          | 100.0% | 100.0% | ≈ equal |
| Rejected txs          | 0 | 0 | ≈ equal |
| HTTP sent             | 101 | 224 | NEAR API TS (2.22× fewer) |
| HTTP total            | 156 | 292 | NEAR API TS (1.87× fewer) |
| HTTP / successful tx  | 1.560 | 2.920 | NEAR API TS (1.87× fewer) |
| Successful TPS        | 2.8 | 4.7 | NEAR KIT (1.67× higher) |

### 25 keys / 500 tx / 10 receivers

| Metric                | NEAR API TS | NEAR KIT | Leader (×) |
|-----------------------|---:|---:|---|
| Preparations          | 44.548 s | 14.971 s | NEAR KIT (2.98× faster) |
| Adding keys           | 2.790 s | 2.313 s | NEAR KIT (1.21× faster) |
| 500 Transactions time | 1:11.096 | 16.935 s | NEAR KIT (4.20× faster) |
| Whole test            | 2:01.976 | — | — |
| Success rate          | 100.0% | 14.4% | NEAR API TS (6.94× better) |
| Rejected txs          | 0 | 428 | NEAR API TS (∞× fewer) |
| HTTP sent             | 501 | 2711 | NEAR API TS (5.41× fewer) |
| HTTP total            | 558 | — | — |
| HTTP / successful tx  | 1.116 | — | — |
| Successful TPS        | 7.0 | 4.3 | NEAR API TS (1.65× higher) |

> Note (FASTNEAR 25/500): **NEAR KIT** hit `HTTP 429: Too Many Requests` after `2711` HTTP requests, so `HTTP total` and `Whole test` are unavailable for it.


