const db = require('../db');

// query 1: 
// implement: within past 5 years, column for rate of borrowing?
async function getPopularityReport(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT i.Item_ID, i.Item_name, i.Item_type, COUNT(*) AS times_checked_out
            FROM BorrowedItem bi 
            LEFT JOIN Copy c ON bi.Copy_ID = c.Copy_ID 
            LEFT JOIN Item i ON c.Item_ID = i.Item_ID
            GROUP BY i.Item_ID, i.Item_name
            ORDER BY times_checked_out DESC`
        );

        res.writeHead(200);
        res.end(JSON.stringify(rows));
    } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to generate report', details: err.message }));
    }
}

module.exports = { getPopularityReport };