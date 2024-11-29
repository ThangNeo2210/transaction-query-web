const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { loadData, searchByCriteria } = require('./utils/search');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Tải dữ liệu vào bộ nhớ khi server khởi động
loadData().then(() => {
    console.log('Dữ liệu đã được tải vào bộ nhớ.');
}).catch((error) => {
    console.error('Lỗi khi tải dữ liệu:', error);
    process.exit(1);
});

// API tìm kiếm
app.get('/search', (req, res) => {
    const { startDate, endDate, minCredit, maxCredit, detail } = req.query;

    console.log(startDate, endDate, minCredit, maxCredit, detail)
    try {
        const results = searchByCriteria(startDate, endDate, minCredit, maxCredit, detail);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
