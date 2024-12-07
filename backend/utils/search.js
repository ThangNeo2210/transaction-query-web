const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// chuyển đổi chuỗi có dấu thành không dấu
const removeVietnameseTones = (str) => {
    if (!str) return str;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
};


let dataByAmount = new Map();
let dataByDetail = new Map();

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
                
                // Chuyển đổi detail thành không dấu trước khi lưu vào Map
                const normalizedDetail = detail ? removeVietnameseTones(detail.trim()) : '';
                if (!dataByDetail.has(normalizedDetail)) {
                    dataByDetail.set(normalizedDetail, []);
                }
                dataByDetail.get(normalizedDetail).push(row);
            })
            .on('end', () => {
                // Sắp xếp dataByAmount theo key (số tiền)
                dataByAmount = new Map(
                    [...dataByAmount].sort((a, b) => Number(a[0]) - Number(b[0]))
                );
                resolve();
            })
            .on('error', reject);
    });
};

const searchByCriteria = (startDate, endDate, minCredit, maxCredit, detail) => {
    let results = [];
    //lọc theo số tiền
    if (minCredit || maxCredit) {
        const min = minCredit ? Number(minCredit) : -Infinity;
        const max = maxCredit ? Number(maxCredit) : Infinity;
    
        for (let [key, value] of dataByAmount.entries()) {
            const credit = Number(key);
    
            if (credit > max) {
                break;
            }
    
            if (credit >= min) {
                results = results.concat(value);
            }
        }
    } else {
        results = Array.from(dataByDetail.values()).flat();
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
        const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
        const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

        results = results.filter(item => {
            try {
                const dateStr = item.date_time.split('_')[0];
                const [day, month, year] = dateStr.split('/');
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
    // Lọc theo nội dung
    if (detail) {
        const normalizedSearchDetail = removeVietnameseTones(detail);
        results = results.filter(item => 
            item.detail && removeVietnameseTones(item.detail.toLowerCase()).includes(normalizedSearchDetail)
        );
    }

    
    return {
        total: results.length,
        records: results
    };
};

module.exports = { loadData, searchByCriteria };
