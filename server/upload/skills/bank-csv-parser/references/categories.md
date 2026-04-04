# Bank Category Taxonomy

This reference maps the bank-provided Russian category strings to a standardized English taxonomy for use in analytics.

## Category Mapping

| Bank Category (Russian) | English Category | Group |
|---|---|---|
| Магазины продуктовые | Groceries | Food & Essentials |
| Ресторация / бары / кафе | Restaurants & Cafes | Food & Essentials |
| Аптеки | Pharmacy | Health |
| Медицинский сервис | Medical Services | Health |
| Ветеринарный сервис | Veterinary | Health |
| Магазины одежды | Clothing | Shopping |
| Магазины обуви | Footwear | Shopping |
| Магазины хозтоваров | Household Goods | Shopping |
| Различные магазины | General Retail | Shopping |
| Интернет-магазины | Online Shopping | Shopping |
| Цифровые товары | Digital Goods | Shopping |
| Денежные переводы | Money Transfers | Transfers |
| Переводы с карты на карту | Card-to-Card Transfers | Transfers |
| Поставщик  услуг | Payment Services | Transfers |
| Снятие наличных | Cash Withdrawal | Cash |
| Развлечения | Entertainment | Lifestyle |
| Бизнес услуги | Business Services | Services |
| Автозапчасти / ремонт авто | Auto Services | Transport |
| Индивидуальные сервис провайдеры | Individual Services | Services |
| Прочее | Other | Other |

## Notes

- The bank category "Поставщик  услуг" (note the double space) is used for incoming P2P transfers, typically currency exchange operations
- "Денежные переводы" via MOBILE BANK are usually bill payments (utilities, services) not person-to-person transfers
- "Переводы с карты на карту" are true P2P transfers between card accounts
- New categories may appear in future exports — treat any unrecognized category as "Other" and flag it
