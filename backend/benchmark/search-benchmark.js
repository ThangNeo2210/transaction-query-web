import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '20s', target: 0 },
      ],
    },
    high_load: {
      executor: 'constant-vus',
      vus: 30,
      duration: '20s',
      startTime: '1m30s',
    },
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 50 },
        { duration: '10s', target: 50 },
        { duration: '5s', target: 0 },
      ],
      startTime: '2m30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const searchTerms = [
    'TAM UNG',
    'Tam Ung',
    'tam ung',
    'tạm ứng',
    'LƯƠNG',
    'Luong',
    'THANH TOAN',
    'Thanh Toán',
];

export default function () {
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const response = http.get(`http://localhost:3001/query?q=${encodeURIComponent(searchTerm)}`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'has total field': (r) => JSON.parse(r.body).total !== undefined,
    'has data array': (r) => Array.isArray(JSON.parse(r.body).data),
  });

  sleep(1.5); 
} 