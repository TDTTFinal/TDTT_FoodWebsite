/**
 * Smoke Test - Health Check cho tất cả APIs
 * 
 * Mục đích: Kiểm tra xem backend và external APIs có sống không
 * Chạy trước khi run các test chính để đảm bảo hệ thống OK
 * 
 * Usage:
 *   k6 run performance/scripts/smoke.k6.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình từ environment variables (hoặc default)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const HF_BASE_URL = __ENV.HF_BASE_URL || 'https://nemo-chewz.hf.space/api/v1/search/';
const OSRM_BASE_URL = __ENV.OSRM_BASE_URL || 'https://router.project-osrm.org';

export const options = {
  vus: 1, // 1 virtual user
  iterations: 10, // 10 lần thử
  thresholds: {
    'http_req_failed': ['rate<0.05'], // Error rate < 5%
    'http_req_duration': ['p(95)<5000'], // p95 < 5s (generous for smoke test)
  },
};

export default function () {
  // ===========================
  // 1. Check Backend Health
  // ===========================
  console.log('🔍 Checking Backend Health...');
  const backendRes = http.get(`${BASE_URL}/api/health`);
  
  check(backendRes, {
    'Backend: status 200': (r) => r.status === 200,
    'Backend: has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'ok';
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);

  // ===========================
  // 2. Check HuggingFace API
  // ===========================
  console.log('🤗 Checking HuggingFace API...');
  const hfParams = {
    q: 'cơm tấm',
    lat: '10.7769',
    lon: '106.7009',
    radius: '5',
    alpha: '0.6',
    top_k: '3',
  };
  
  // Build query string manually (k6 doesn't support URLSearchParams)
  const hfQueryString = Object.keys(hfParams)
    .map(key => `${key}=${encodeURIComponent(hfParams[key])}`)
    .join('&');
  const hfUrl = `${HF_BASE_URL}?${hfQueryString}`;
  const hfRes = http.get(hfUrl, { timeout: '10s' });
  
  check(hfRes, {
    'HuggingFace: status 200': (r) => r.status === 200,
    'HuggingFace: valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
    'HuggingFace: has steps or routes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.steps || body.suggested_routes;
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);

  // ===========================
  // 3. Check OSRM API
  // ===========================
  console.log('🗺️ Checking OSRM API...');
  // Simple route query: 2 points in HCMC
  const osrmUrl = `${OSRM_BASE_URL}/route/v1/driving/106.7009,10.7769;106.7050,10.7800?overview=false`;
  const osrmRes = http.get(osrmUrl, { timeout: '10s' });
  
  check(osrmRes, {
    'OSRM: status 200': (r) => r.status === 200,
    'OSRM: code Ok': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.code === 'Ok';
      } catch {
        return false;
      }
    },
    'OSRM: has routes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.routes && body.routes.length > 0;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('✅ SMOKE TEST COMPLETED');
  console.log('========================================');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}`);
  console.log(`Avg Duration: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log('========================================\n');
  
  return {
    'stdout': '', // k6 will print default summary
  };
}
