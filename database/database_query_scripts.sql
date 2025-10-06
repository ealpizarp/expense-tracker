SELECT
  t.transaction_id,
  t.transaction_date,
  t.amount,
  t.location,
  m.merchant_name,
  c.category_name,
  t.created_at
FROM
  transactions AS t
  INNER JOIN merchants AS m ON t.merchant_id = m.merchant_id
  LEFT JOIN categories AS c ON t.category_id = c.category_id
ORDER BY
  t.transaction_date DESC;
