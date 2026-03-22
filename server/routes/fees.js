const db = require('../db');

async function getFees(req, res) {
    try {
        // extract person ID from URL — e.g. /api/fees/3
        const personId = req.url.split('/')[3];

        // patrons can only view their own fees, staff can view anyone's
        if (req.user.role === 2 && req.user.person_id !== parseInt(personId)) {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: 'Access denied' }));
        }

        // check the person exists
        const [personRows] = await db.query(`SELECT Person_ID FROM Person WHERE Person_ID = ?`, [personId]);
        if (personRows.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Person not found' }));
        }

        // get all fees for this person — join BorrowedItem and Item so we can show what item the fee is for
        const [rows] = await db.query(
            `SELECT
                f.Fine_ID, f.date_owed, f.status, f.late_fee,
                f.BorrowedItem_ID, bi.borrow_date, bi.returnBy_date,
                i.Item_name, i.Item_type
             FROM FeeOwed f
             JOIN BorrowedItem bi ON f.BorrowedItem_ID = bi.BorrowedItem_ID
             JOIN Copy cp ON bi.Copy_ID = cp.Copy_ID
             JOIN Item i ON cp.Item_ID = i.Item_ID
             WHERE f.Person_ID = ?
             ORDER BY f.date_owed DESC`,
            [personId]
        );

        res.writeHead(200);
        res.end(JSON.stringify(rows));
    } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch fees', details: err.message }));
    }
}

module.exports = { getFees };
