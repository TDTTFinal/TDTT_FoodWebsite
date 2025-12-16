/**
 * Search Performance Test - Local Backend API
 * 
 * Test endpoint: GET /api/search/advanced
 * Target metrics:
 *   - p95 response time < 3s
 *   - Error rate < 5%
 * 
 * Usage:
 *   k6 run performance/scripts/search.k6.js --summary-export=performance/results/search_summary.json
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('search_errors');
const searchDuration = new Trend('search_duration');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const SEARCH_PATH = __ENV.SEARCH_PATH || '/api/search/advanced';

// Test queries (tiếng Việt)
const TEST_QUERIES = [
  'cơm tấm sườn',
  'bún bò huế',
  'phở bò',
  'bánh mì thịt',
  'cà phê sữa đá',
  'lẩu thái',
  'món ăn vặt',
  'quán ăn sáng',
  'quán nhậu',
  'buffet hải sản',
];

export const options = {
  scenarios: {
    search_load_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 1 },   // Warmup
        { duration: '30s', target: 5 },   // Ramp up to 5 VUs
        { duration: '60s', target: 5 },   // Hold 5 VUs
        { duration: '30s', target: 1 },   // Ramp down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.05'],        // Error rate < 5%
    'http_req_duration': ['p(95)<3000'],     // p95 < 3s
    'search_errors': ['rate<0.05'],
    'search_duration': ['p(95)<3000'],
  },
};

export default function () {
  // Random query từ danh sách
  const query = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
  
  // Build URL với query params
  const params = {
    q: query,
    lat: __ENV.DEFAULT_LAT || '10.7769',
    lon: __ENV.DEFAULT_LON || '106.7009',
    radius: __ENV.DEFAULT_RADIUS || '5',
    alpha: __ENV.DEFAULT_ALPHA || '0.6',
    top_k: __ENV.DEFAULT_TOP_K || '10',
  };
  
  // Build query string manually (k6 compatible)
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  const url = `${BASE_URL}${SEARCH_PATH}?${queryString}`;
  
  // Make request
  const startTime = Date.now();
  const res = http.get(url, {
    timeout: '10s',
    tags: { name: 'SearchAdvanced' },
  });
  const duration = Date.now() - startTime;
  
  // Record metrics
  searchDuration.add(duration);
  errorRate.add(res.status !== 200);
  
  // Checks
  const checkResult = check(res, {
    'status is 200': (r) => r.status === 200,
    'response is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
    'has data array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch {
        return false;
      }
    },
    'has metadata': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.metadata !== undefined;
      } catch {
        return false;
      }
    },
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  // Log failures
  if (!checkResult) {
    console.log(`❌ Failed request for query: "${query}" (${res.status})`);
  }
  
  // Think time
  sleep(Math.random() * 2 + 1); // 1-3s
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('📊 SEARCH API PERFORMANCE TEST RESULTS');
  console.log('========================================');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed: ${data.metrics.http_req_failed.values.passes || 0} (${((data.metrics.http_req_failed.values.rate || 0) * 100).toFixed(2)}%)`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`p95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  
  // Safely handle p99 (may be undefined for small sample sizes)
  const p99 = data.metrics.http_req_duration.values['p(99)'];
  if (p99 !== undefined && p99 !== null) {
    console.log(`p99 Response Time: ${p99.toFixed(2)}ms`);
  }
  
  console.log('========================================\n');
  
  return {
    'stdout': '', // k6 default summary
  };
}
