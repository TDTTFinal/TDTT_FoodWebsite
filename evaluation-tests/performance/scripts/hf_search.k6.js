/**
 * HuggingFace API Performance Test
 * 
 * Test HuggingFace Food Tour Suggestion API
 * Target metrics:
 *   - p95 response time < 3s
 *   - Error rate < 5%
 * 
 * Usage:
 *   k6 run performance/scripts/hf_search.k6.js --summary-export=performance/results/hf_summary.json
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('hf_errors');
const hfDuration = new Trend('hf_duration');

// Configuration
const HF_BASE_URL = __ENV.HF_BASE_URL || 'https://nemo-chewz.hf.space/api/v1/search/';

// Test queries - Natural language (combo queries - 2+ món ăn)
// HF API được thiết kế cho Food Tour combos, không phải single dish
const TEST_QUERIES = [
  'cơm tấm rồi cà phê',
  'bún bò huế sau đó ăn chè',
  'ăn sáng bánh mì rồi uống sinh tố',
  'phở bò xong đi cafe',
  'lẩu hải sản rồi ăn kem',
  'cơm văn phòng sau đó trà sữa',
  'buffet nướng rồi massage',
  'ăn tối quán nhậu rồi café',
  'món ăn vặt rồi xem phim',
  'cơm tấm sau đó bún bò',
];

export const options = {
  scenarios: {
    hf_load_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 1 },   // Warmup
        { duration: '30s', target: 5 },   // Ramp up
        { duration: '60s', target: 5 },   // Hold
        { duration: '30s', target: 1 },   // Ramp down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.05'],      // Error rate < 5%
    'http_req_duration': ['p(95)<3000'],   // p95 < 3s
    'hf_errors': ['rate<0.05'],
    'hf_duration': ['p(95)<3000'],
  },
};

export default function () {
  // Random query
  const query = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
  
  // Build query params
  const params = {
    q: query,
    lat: __ENV.DEFAULT_LAT || '10.7769',
    lon: __ENV.DEFAULT_LON || '106.7009',
    radius: __ENV.DEFAULT_RADIUS || '5',
    alpha: __ENV.DEFAULT_ALPHA || '0.6',
    top_k: __ENV.DEFAULT_TOP_K || '5',
  };
  
  // Build query string manually (k6 compatible)
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  const url = `${HF_BASE_URL}?${queryString}`;
  
  // Make request
  const startTime = Date.now();
  const res = http.get(url, {
    timeout: '15s', // HF có thể chậm hơn
    tags: { name: 'HuggingFaceSearch' },
  });
  const duration = Date.now() - startTime;
  
  // Record metrics
  hfDuration.add(duration);
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
    'has valid response data': (r) => {
      try {
        const body = JSON.parse(r.body);
        // HF API trả về array trực tiếp: [{...}, {...}]
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  // Log response structure for debugging
  if (checkResult && Math.random() < 0.1) { // Log 10% of successful requests
    try {
      const body = JSON.parse(res.body);
      const count = Array.isArray(body) ? body.length : 0;
      console.log(`✅ HF Response for "${query}": ${count} restaurants`);
    } catch (e) {
      // ignore
    }
  }
  
  if (!checkResult) {
    console.log(`❌ Failed HF request for query: "${query}" (${res.status})`);
  }
  
  // Think time
  sleep(Math.random() * 2 + 1); // 1-3s
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('🤗 HUGGINGFACE API PERFORMANCE TEST');
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
