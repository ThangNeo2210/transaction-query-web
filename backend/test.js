const { loadData, searchByCriteria} = require('./utils/search');

async function main() {
    try {
        console.log('Đang tải dữ liệu...');
        await loadData();
        console.log('Dữ liệu đã được tải.');
        
        // Test tìm theo số tiền
        console.log('Test tìm theo số tiền:');
        let results = searchByCriteria('10000', null, null);
        console.log(results);

        // Test tìm theo tên người gửi
        console.log('Test tìm theo tên người gửi:');
        results = searchByCriteria(null, 'NGUYEN HOAI PHUONG', null);
        console.log(results);
        
        console.log('Test tìm theo tên viết thường "nguyen thi mao":');
        results = searchByCriteria(null, 'nguyen thi mao', null);
        console.log(results);

        // Test tìm theo cả hai tiêu chí
        console.log('Test tìm theo số tiền và tên người gửi:');
        results = searchByCriteria('500000', 'NGUYEN HOAI PHUONG', null);
        console.log(results);

        // Test tìm theo nội dung
        console.log('Test tìm theo nội dung:');
        results = searchByCriteria(null, null, 'MBVCB.6990951848.NGUYEN HOAI PHUONG chuyen tien.CT tu 9923999937 NGUYEN HOAI PHUONG toi 0011001932418 MAT TRAN TO QUOC VN - BAN CUU TRO TW');
        console.log(results);

        // Test tìm theo cả ba tiêu chí
        console.log('Test tìm theo số tiền, tên người gửi và nội dung:');
        results = searchByCriteria('500000', 'NGUYEN HOAI PHUONG', 'MBVCB.6990951848.NGUYEN HOAI PHUONG chuyen tien.CT tu 9923999937 NGUYEN HOAI PHUONG toi 0011001932418 MAT TRAN TO QUOC VN - BAN CUU TRO TW');
        console.log(results);
        
    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
    }
}

main();
