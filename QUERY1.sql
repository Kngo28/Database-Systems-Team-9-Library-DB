SELECT
    i.Item_ID,
    i.Item_name, 
    i.Item_type, -- map Item_type to book, cd, device in output
    COUNT(*) AS times_checked_out
-- count num of times borrowed
FROM BorrowedItem bi 
JOIN Copy c
    ON bi.Copy_ID = c.Copy_ID -- join borroweditem FK to Copy PK
JOIN Item i
    ON c.Item_ID = i.Item_ID -- join resulting table Copy FK to Item PK
-- group by item_ID and then order by which item was checked out the most
GROUP BY i.Item_ID
ORDER BY times_checked_out DESC;