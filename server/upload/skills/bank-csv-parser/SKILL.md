---
name: bank-csv-parser
description: Parse Belarusian bank CSV statement exports (Priorbank and similar) into structured JSON with normalized merchant names. Use this skill whenever the user uploads a bank statement CSV file, mentions parsing bank exports, asks to extract transactions from a CSV, wants to analyze spending from a bank statement, or needs to convert bank statement data into JSON. Also trigger when the user mentions Priorbank, Приорбанк, выписка, bank export, or transaction import from CSV. This skill handles the tricky CSV format issues (Windows-1251 encoding, semicolon delimiters, comma decimal separators, broken quoting) that standard CSV parsers cannot handle correctly.
---

# Bank CSV Statement Parser

You are a specialized parser for Belarusian bank CSV statement exports. Your job is to receive raw CSV text content from a bank statement file and return a clean, structured JSON object containing all transactions with normalized merchant names.

## Why this skill exists

Belarusian bank CSV exports (particularly from Priorbank/Приорбанк) use a non-standard format that breaks standard CSV parsers: semicolon delimiters, comma decimal separators, Windows-1251 encoding, and a quoting scheme where merchant names containing double quotes cause the decimal comma in the amount field to break the quoting boundary. This skill provides a reliable, AI-driven parsing approach.

## Input

You will receive the raw text content of a bank statement CSV file. The file has already been decoded from Windows-1251 to UTF-8 for you. The text is the full file content.

## Output

Respond with **only** a valid JSON object — no markdown fences, no commentary, no explanation. The JSON must follow the schema defined in the **Output Schema** section below.

---

## CSV Format Reference (Priorbank)

### File structure

The file contains these sections in order:

1. **Metadata header** (lines 0–~15): Key-value pairs about the statement
2. **Per-card transaction blocks** (one or more): Each starts with "Операции по ........XXXX", followed by a column header row, transaction rows, and a summary row
3. **Totals section**: Lines starting with "Всего по контракту" and "Всего в данной валюте"
4. **Blocked amounts section** (optional): Starts with "Заблокированные суммы по", has its own header and transaction format

### Metadata header fields

Extract these from the first ~15 lines. They use `key;value;` format:

| Line pattern | Field | Example |
|---|---|---|
| `Период выписки:` | Statement period | `31.01.2026-28.02.2026` |
| `Номер контракта:` | Contract number | `......1313 Валюта контракта BYN` |
| `Карта:` | Card number | `........9964 VISA SIGNATURE` |
| `ФИО:` | Cardholder name | `Дмитрий Липгарт` |
| `Доступная сумма:` | Available balance | `2 912,53` |
| `Начальный баланс:` | Opening balance | `1 772,34` |

### Transaction column header

Each card's transaction block starts with this header row:

```
Дата транзакции;Операция;Сумма;Валюта;Дата операции по счету;Комиссия/Money-back;Обороты по счету;Цифровая карта;Категория операции;
```

Columns (0-indexed):
- **0**: Transaction datetime (`DD.MM.YYYY HH:MM:SS`)
- **1**: Operation description (merchant/operation raw text)
- **2**: Amount (negative = debit, positive = credit). Uses comma as decimal separator
- **3**: Transaction currency (`BYN`, `USD`, `EUR`)
- **4**: Settlement date (`DD.MM.YYYY`)
- **5**: Fee/Money-back amount
- **6**: Account turnover (the actual BYN amount after currency conversion)
- **7**: Digital card (usually empty)
- **8**: Bank-assigned category

### Blocked amounts column header

```
Дата транзакции;Транзакция;Сумма транзакции;Валюта;Сумма блокировки;Валюта;Цифровая карта;Категория операции;
```

Columns:
- **0**: Transaction datetime
- **1**: Operation description
- **2**: Transaction amount (always positive in blocked section — these are holds)
- **3**: Transaction currency
- **4**: Hold amount
- **5**: Hold currency
- **6**: Digital card
- **7**: Category

---

## Critical Parsing Rules

### Rule 1: The Broken Quoting Problem

This is the most important parsing challenge. When a merchant name contains double quotes (like `"OSTIN"` or `"SOSEDI-EKSPRESS"`), the bank's CSV export wraps the entire row segment in outer quotes and escapes inner quotes by doubling them. Combined with the comma decimal separator in amounts, this produces lines like:

```
"26.02.2026 00:00:00;Retail BLR G. GOMEL MAGAZIN ""OSTIN""  ;-235",26;BYN;27.02.2026;0,00;-235,26;;Магазины одежды;
```

What happened here: The CSV writer quoted from the first `"` through the amount's integer part, then the decimal comma broke the quoting. So the **actual** values are:
- Date: `26.02.2026 00:00:00`
- Description: `Retail BLR G. GOMEL MAGAZIN "OSTIN"`
- Amount: `-235,26` (i.e., -235.26)

**How to detect these lines**: They start with a `"` character at position 0.

**How to parse them**:
1. The line starts with `"` — this signals the broken quoting pattern
2. Find the pattern `",` followed by digits — this is where the amount's decimal part begins
3. Everything before the `",` (minus the leading `"`) is the quoted content containing `date;description;integer_part_of_amount`
4. The decimal digits after `",` followed by `;` complete the amount
5. The remainder after that is parsed normally as `;currency;settlement_date;fee;turnover;;category;`
6. Inside the quoted content, replace `""` with `"` to unescape merchant names

### Rule 2: Decimal Amounts

All amounts use comma as decimal separator: `-235,26` means -235.26. Convert to standard decimal notation in output.

Amounts with thousands use space as thousands separator: `2 912,53` means 2912.53.

### Rule 3: Line Classification

Skip these lines — they are NOT transactions:
- Empty lines or lines that are only commas
- Lines starting with metadata keys (before the first "Операции по" section)
- Lines containing "Операции по" (section headers)
- Lines containing "Дата транзакции" (column headers)
- Lines containing "Всего по контракту" or "Всего в данной валюте" (summary rows)
- The summary data rows immediately following "Всего" rows (they start with `;`)
- Lines containing "Заблокированные суммы по" (blocked section header)

### Rule 4: Card Association

Track which card each transaction belongs to. The card identifier appears in the "Операции по ........XXXX" section header. Associate every transaction in that section with that card number suffix.

### Rule 5: Income vs Expense

- Negative amounts (prefixed with `-`) = expense/debit
- Positive amounts = income/credit
- In the blocked amounts section, amounts are always positive (they are holds, not completed transactions)

### Rule 6: Foreign Currency Transactions

Some transactions have a different transaction currency (e.g., `USD`) but are settled in BYN. In these cases:
- Column 2 (Сумма) = amount in transaction currency
- Column 6 (Обороты по счету) = equivalent amount in BYN

Always capture both. The `accountAmount` field in output should contain the BYN equivalent from column 6.

---

## Merchant Normalization

This is where you add value beyond raw parsing. The raw description field contains messy merchant identifiers. Normalize them into clean, human-readable merchant names.

### Normalization rules

1. **Strip the prefix**: Remove `Retail BLR`, `CH Debit BLR`, `CH Payment BLR`, `ATM BLR`, `Retail IRL`, and similar prefixes (format: `TYPE COUNTRY_CODE`)
2. **Strip the city**: Remove city names like `GOMEL`, `G. GOMEL`, `GOROD GOMEL`, `Gomel`, `g. GOMEL`, `MINSK`, `Minsk`
3. **Strip filler words**: Remove `SHOP`, `MAGAZIN`, `I.-SHOP`, `PT`, `PAV.`, `TORG.OB.`, `TORG.AVT.`, `MINI-KAFE` and similar generic prefixes that just mean "shop" or "store"
4. **Unquote merchant names**: `""OSTIN""` → `Ostin`
5. **Title-case the result**: `SOSEDI-EKSPRESS` → `Sosedi-Ekspress`
6. **Merge known variants**: Multiple raw descriptions often refer to the same merchant. Unify them.

### Merchant mapping reference

Apply these mappings (raw description patterns → normalized merchant name). This list covers merchants seen in real Priorbank exports — use it as a reference, and apply the same logic to any new merchants:

| Raw description patterns | Merchant | Notes |
|---|---|---|
| `Gippo`, `GIPPO TRADE CENTRE`, `Gipermarket Gippo` | **Gippo** | Grocery hypermarket |
| `SOSEDI-EKSPRESS`, `SOSEDI` | **Sosedi** | Grocery store chain |
| `MAGAZIN EVROOPT`, `EVROOPT` | **Evroopt** | Grocery store chain |
| `SPARTAK 3 GOM` | **Spartak** | Grocery store |
| `PAV. RANITSA`, `TORG.OB. RANITSA` | **Ranitsa** | Small grocery/kiosk |
| `SHOP MAYAK` | **Mayak** | Grocery store |
| `DARY OT ZARI` | **Dary ot Zari** | Grocery store |
| `PRODUKTOF` | **Produktof** | Grocery store |
| `KRASNYJ PISHCH` | **Krasny Pishchevik** | Grocery store |
| `NB005 FIX PRICE` | **Fix Price** | Discount store |
| `SHOP TRI TSENY` | **Tri Tseny** | Discount store |
| `MAGAZIN "OSTIN"`, `MAGAZIN OSTIN` | **Ostin** | Clothing store |
| `MEGATOP` | **Megatop** | Shoe store |
| `Magazin detskoy odezhdy` | **Detskaya Odezhda** | Children's clothing |
| `WILDBERRIES.BY` | **Wildberries** | Online marketplace |
| `5 ELEMENT` | **5 Element** | Electronics store |
| `MILA` | **Mila** | Household goods |
| `OZON.BY` | **Ozon** | Online marketplace |
| `WWW.TRAVA.BEL` | **Trava.bel** | Online store |
| `APTEKA N*`, `APTEKA 21`, `PT APTEKA*` | **Apteka #{number}** | Pharmacy (keep the number) |
| `VETERINARNAYA APTEKA` | **Veterinarnaya Apteka** | Veterinary pharmacy |
| `POLIVETTSENTR` | **Polivettsentr** | Veterinary clinic |
| `MED.TSENTR OOO BELSONO` | **Belsono** | Medical center |
| `pitstseriya Italiya` | **Pizzeriya Italiya** | Restaurant |
| `A-COFFE` | **A-Coffee** | Coffee shop |
| `lavka Batski` | **Lavka Batski** | Café/food stall |
| `CAFE SITI` | **Cafe City** | Café |
| `BULL DOG ROCK PUB 2` | **Bulldog Rock Pub** | Bar |
| `IOOO Sassin Skver` | **Sassin Skver** | Restaurant |
| `RAZ DVA` | **Raz Dva** | Bar/restaurant |
| `STOLOVAYA MUZ.-PED.KOLLED` | **Stolovaya Muz.-Ped. Kolledz** | Cafeteria |
| `SHAURMEN` | **Shaurmen** | Fast food |
| `KOFEYNYA 27` | **Kofeynya 27** | Coffee shop |
| `RAZVLEKATELNYY OBEKT ZAK` | **Razvlekatelny Obekt Zakulisye** | Entertainment venue |
| `RAZVL.OBEKT KV.SMUZI GOME` | **Kvartal Smuzi** | Entertainment venue |
| `FOTODROM` | **Fotodrom** | Photo services |
| `AUTOMOYKA SOVR.AVTOMOYKI` | **Sovremennye Avtomoyki** | Car wash |
| `ATM 918`, `ATM 919`, `ATM N6 CHERNIGOVSKIY BIB` | **ATM #{id}** | ATM withdrawal |
| `MOBILE BANK` | **Mobile Bank (Priorbank)** | Mobile banking payment |
| `P2P SDBO NO FEE`, `P2P_SDBO`, `P2P_SDBO_INTERNATIONAL` | **P2P Transfer** | Person-to-person transfer |
| `EZHOV, ANTON` (or similar name) | **P2P: Ezhov Anton** | Named P2P transfer (keep the name) |
| `Поступление на контракт клиента *` | **Incoming Transfer** | Account top-up |
| `ITUNES.COM APPLE.COM/BILL` | **Apple** | Digital subscription |
| `KASSA MUZHSKOGO TUALETA` | **Public WC** | Public restroom |

### Handling unknown merchants

For any merchant not in the mapping above, apply the general normalization rules (strip prefix, strip city, clean up formatting, title-case). Set `merchantConfidence` to `"low"` so the application can flag it for manual review.

---

## Output Schema

```json
{
  "statement": {
    "bank": "Priorbank",
    "period": {
      "from": "YYYY-MM-DD",
      "to": "YYYY-MM-DD"
    },
    "generatedAt": "YYYY-MM-DD HH:MM:SS",
    "contractNumber": "......1313",
    "currency": "BYN",
    "openingBalance": 1772.34,
    "closingBalance": 590.16,
    "totalIncome": 4677.89,
    "totalExpense": 5860.07,
    "cardholder": "Дмитрий Липгарт"
  },
  "cards": [
    {
      "cardNumber": "........1313",
      "transactionCount": 1
    },
    {
      "cardNumber": "........9964",
      "cardType": "VISA SIGNATURE",
      "transactionCount": 150
    }
  ],
  "transactions": [
    {
      "id": "txn_001",
      "date": "2026-02-27T07:05:35",
      "settledDate": "2026-02-27",
      "rawDescription": "CH Debit BLR MINSK P2P SDBO NO FEE",
      "merchant": "P2P Transfer",
      "merchantConfidence": "high",
      "amount": -120.00,
      "currency": "BYN",
      "accountAmount": -120.00,
      "fee": 0.00,
      "bankCategory": "Переводы с карты на карту",
      "direction": "expense",
      "card": "........9964",
      "isBlocked": false
    },
    {
      "id": "txn_002",
      "date": "2026-02-26T16:16:28",
      "settledDate": "2026-02-26",
      "rawDescription": "CH Payment BLR MINSK P2P SDBO NO FEE",
      "merchant": "P2P Transfer",
      "merchantConfidence": "high",
      "amount": 300.00,
      "currency": "USD",
      "accountAmount": 853.50,
      "fee": 0.00,
      "bankCategory": "Поставщик  услуг",
      "direction": "income",
      "card": "........9964",
      "isBlocked": false
    }
  ],
  "blockedTransactions": [
    {
      "id": "blk_001",
      "date": "2026-03-27T08:04:30",
      "rawDescription": "Retail BLR S.S.SCHOMYSLI TO MINSK.VAGON.UCHASTOK",
      "merchant": "Vagon.Uchastok",
      "merchantConfidence": "low",
      "amount": 4.29,
      "currency": "BYN",
      "holdAmount": 4.29,
      "holdCurrency": "BYN",
      "bankCategory": "Магазины продуктовые",
      "card": "........9964"
    }
  ],
  "merchantSummary": [
    {
      "merchant": "Sosedi",
      "totalAmount": -345.67,
      "transactionCount": 18,
      "bankCategories": ["Магазины продуктовые"]
    },
    {
      "merchant": "Gippo",
      "totalAmount": -801.23,
      "transactionCount": 10,
      "bankCategories": ["Магазины продуктовые"]
    }
  ]
}
```

### Field descriptions

**statement**: Metadata extracted from file header. Dates in ISO 8601 format (YYYY-MM-DD). Amounts as numbers with 2 decimal places.

**cards**: Summary of cards found in the statement with transaction counts.

**transactions**: Array of all completed transactions, ordered by date descending (newest first, matching the source file order).
- `id`: Sequential identifier `txn_001`, `txn_002`, etc.
- `date`: ISO 8601 datetime. Convert from `DD.MM.YYYY HH:MM:SS` to `YYYY-MM-DDTHH:MM:SS`
- `settledDate`: ISO 8601 date of account settlement
- `rawDescription`: Exact description from the CSV (after unescaping `""` to `"`)
- `merchant`: Normalized merchant name per the mapping rules above
- `merchantConfidence`: `"high"` if the merchant matched a known mapping, `"low"` if derived by general normalization rules only
- `amount`: Transaction amount in the transaction's original currency. Negative for debits, positive for credits
- `currency`: Original transaction currency code
- `accountAmount`: Amount in account currency (BYN). For BYN transactions this equals `amount`. For foreign currency transactions, take from column 6 (Обороты по счету)
- `fee`: Fee or money-back amount from column 5
- `bankCategory`: The category string from the bank, preserved as-is (in Russian)
- `direction`: `"expense"` if amount is negative, `"income"` if positive
- `card`: Card number suffix this transaction belongs to
- `isBlocked`: Always `false` for completed transactions

**blockedTransactions**: Pending/held transactions from the "Заблокированные суммы" section.
- `holdAmount` and `holdCurrency`: The blocked (held) amount and its currency

**merchantSummary**: Aggregation of all completed transactions grouped by normalized merchant name. Sorted by `totalAmount` ascending (biggest spenders first). The `totalAmount` is the sum of `accountAmount` values (always in BYN). `bankCategories` is a deduplicated list of all bank categories associated with this merchant.

---

## Parsing Checklist

Before outputting JSON, verify:

1. Every transaction line in the file is accounted for (no silently skipped rows)
2. All quoted/broken lines were correctly reconstructed
3. All amounts are valid numbers (no NaN, no strings)
4. `merchantSummary` totals match the sum of individual transactions for each merchant
5. The `statement.totalIncome` and `statement.totalExpense` match values from the "Всего в данной валюте" summary row
6. Transaction count across all cards matches the number of items in `transactions` array
7. Dates are valid and in ISO 8601 format
8. No duplicate transaction IDs
