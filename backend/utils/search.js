const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Khởi tạo Map lưu trữ dữ liệu
const dataByAmount = new Map();
const dataByDetail = new Map();

// Hàm tải dữ liệu từ file CSV vào bộ nhớ
const loadData = () => {
    const filePath = path.join(__dirname, '../data/chuyen_khoan.csv');

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ header }) => header.replace(/"/g, '').trim(), // Loại bỏ dấu ngoặc kép và khoảng trắng
                skipLines: 0, // Không bỏ qua dòng nào
                bom: true    // Xử lý BOM character
            }))
            .on('data', (row) => {
                const amount = row.credit;
                const detail = row.detail;
                if (!dataByAmount.has(amount)) {
                    dataByAmount.set(amount, []);
                }
                dataByAmount.get(amount).push(row);
                
                const normalizedDetail = detail ? detail.trim().toLowerCase() : '';
                if (!dataByDetail.has(normalizedDetail)) {
                    dataByDetail.set(normalizedDetail, []);
                }
                dataByDetail.get(normalizedDetail).push(row);
            })
            .on('end', resolve)
            .on('error', reject);
    });
};

const searchByCriteria = (startDate, endDate, minCredit, maxCredit, detail) => {
    let results = Array.from(dataByDetail.values()).flat();

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
        const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
        const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

        results = results.filter(item => {
            try {
                // Chỉ lấy phần ngày tháng (trước dấu _)
                const dateStr = item.date_time.split('_')[0];  // Lấy "01/09/2024"
                const [day, month, year] = dateStr.split('/');
                
                // Chuyển đổi sang Date object để so sánh
                const transDate = new Date(`${year}-${month}-${day}T00:00:00`);

                if (startDateObj && transDate < startDateObj) return false;
                if (endDateObj && transDate > endDateObj) return false;
                return true;
            } catch (error) {
                console.error('Error processing date:', dateStr);
                return false;
            }
        });
    }

    // Lọc theo khoảng số tiền
    if (minCredit || maxCredit) {
        results = results.filter(item => {
            const credit = Number(item.credit);
            if (minCredit && credit < Number(minCredit)) return false;
            if (maxCredit && credit > Number(maxCredit)) return false;
            return true;
        });
    }

    // Lọc theo nội dung
    if (detail) {
        const lowerDetail = detail.toLowerCase();
        results = results.filter(item => 
            item.detail && item.detail.toLowerCase().includes(lowerDetail)
        );
    }

    return results;
};

module.exports = { loadData, searchByCriteria };
