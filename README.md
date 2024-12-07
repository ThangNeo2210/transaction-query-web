# Transaction Search Application


## Setup with Docker
### Prerequisites
- Docker installed on your machine
- Docker Compose installed on your machine
- CSV file containing transaction data

### Steps to run with Docker

1. Create a directory for your application:
```bash
mkdir saoke-app
cd saoke-app
```

2. Create data directory and add CSV file:
```bash
mkdir data
```
Then copy file `chuyen_khoan.csv` into the data directory

3. Create docker-compose.yml:
```yaml
version: '3.8'

services:
  backend:
    image: thanghub2210/saoke-backend:latest
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    container_name: saoke-backend

  frontend:
    image: thanghub2210/saoke-frontend:latest
    ports:
      - "3000:3000"
    depends_on:
      - backend
    container_name: saoke-frontend
```

4. Pull and run the application:
```bash
docker-compose up
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Important Notes for Docker Setup
- Ensure your CSV file is named `chuyen_khoan.csv` and placed in the `data` directory
- The data directory must be in the same directory as your docker-compose.yml

## Setup without Docker (For Development)
### Clone this repository
```bash
git clone https://github.com/ThangNeo2210/transaction-query-web.git
```
### Backend Setup
1. Navigate to backend folder: 
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
``` 
3. Start server:
```bash
npm start
```
Server will run on http://localhost:3001

### Frontend Setup
1. Navigate to frontend folder:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start server:
If you want to run in development mode:
```bash
npm run dev
```
If you want to run in production mode:
```bash
npm run build
npm run start
```
Frontend will run on http://localhost:3000
### Notes
- Ensure backend is running before starting frontend
- Place chuyen_khoan.csv file in the data directory `/backend/data/chuyen_khoan.csv`
## Benchmark
We use k6 to benchmark the API search.
1. Install k6:

2. Navigate to backend folder:
```bash
cd backend
```
3. Run benchmark:
- Server backend is running on localhost:3001 so host in benchmark is localhost:3001
```bash
k6 run benchmark/search-benchmark.js
```

## Important Notes
- CSV file should have columns: date_time, trans_id, credit, detail
- API endpoint is http://localhost:3001/query?q=searchTerm. 
    - Example: http://localhost:3001/query?q=tạm ứng&startDate=2024-01-01&endDate=2024-01-31&minCredit=1000000&maxCredit=5000000
    - key q is search by detail
- Format response:
```json
{
    "success": true,
    "total": 100,
    "data": list of records
}
```
 Example: 
```json
{
    "success": true,
    "total": 1,
    "data": [
        {
            "date_time": "2024-01-01",
            "trans_id": "1234567890",
            "credit": 1000000,
            "detail": "Chuyen khoan 1000000"
        }
    ]
}
```
