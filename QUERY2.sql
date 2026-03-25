SELECT
    f.Person_ID,
    p.First_name,
    p.Last_name,
    p.role,
    COUNT(f.Fine_ID) AS unpaid_fee_count,
    SUM(f.fee_amount) AS unpaid_total
FROM feeowed f
JOIN person p
    ON f.Person_ID = p.Person_ID
LEFT JOIN feepayment fp
    ON f.Fine_ID = fp.Fine_ID
WHERE fp.Fine_ID IS NULL
GROUP BY
    f.Person_ID,
    p.First_name,
    p.Last_name,
    p.role
ORDER BY
    unpaid_total DESC,
    unpaid_fee_count DESC;