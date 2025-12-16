/**
 * OSRM Routing Performance Test
 * 
 * Test OSRM /route and /trip endpoints
 * Target metrics:
 *   - p95 response time < 5s (routing có thể chậm hơn search)
 *   - Error rate < 5%
 * 
 * Usage:
 *   k6 run performance/scripts/osrm_routing.k6.js --summary-export=performance/results/osrm_summary.json
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const routeErrorRate = new Rate('route_errors');
const tripErrorRate = new Rate('trip_errors');
const routeDuration = new Trend('route_duration');
const tripDuration = new Trend('trip_duration');

// Configuration
const OSRM_BASE_URL = __ENV.OSRM_BASE_URL || 'https://router.project-osrm.org';

// Sample coordinates in HCMC for testing
const SAMPLE_LOCATIONS = [
  [106.7009, 10.7769], // District 1
  [106.7050, 10.7800], // Near Ben Thanh
  [106.6964, 10.7723], // District 3
  [106.6842, 10.7626], // District 5
  [106.7100, 10.7900], // Binh Thanh
  [106.6750, 10.7550], // District 10
];

// Generate random route (2-5 stops)
function generateRandomRoute() {
  const numStops = Math.floor(Math.random() * 4) + 2; // 2-5 stops
  const shuffled = [...SAMPLE_LOCATIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numStops);
}

export const options = {
  scenarios: {
    osrm_load_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 1 },
        { duration: '30s', target: 2 },   // Reduced from 3 to 2 VUs
        { duration: '60s', target: 2 },
        { duration: '30s', target: 1 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.1'],       // Increased to 10% for public server
    'http_req_duration': ['p(95)<10000'],  // Increased to 10s
    'route_errors': ['rate<0.1'],
    'trip_errors': ['rate<0.1'],
    'route_duration': ['p(95)<10000'],
    'trip_duration': ['p(95)<10000'],
  },
};

export default function () {
  const coords = generateRandomRoute();
  
  // Test 1: Regular Route (sequential)
  if (Math.random() < 0.5) {
    testRoute(coords);
  } else {
    // Test 2: Optimized Trip (TSP)
    testTrip(coords);
  }
  
  sleep(Math.random() * 2 + 1);
}

function testRoute(coords) {
  const coordString = coords.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordString}?overview=full&geometries=polyline6`;
  
  const startTime = Date.now();
  const res = http.get(url, {
    timeout: '30s',  // Increased timeout for public server
    tags: { name: 'OSRMRoute' },
  });
  const duration = Date.now() - startTime;
  
  routeDuration.add(duration);
  routeErrorRate.add(res.status !== 200);
  
  check(res, {
    'route: status 200': (r) => r.status === 200,
    'route: code Ok': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.code === 'Ok';
      } catch {
        return false;
      }
    },
    'route: has routes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.routes && body.routes.length > 0;
      } catch {
        return false;
      }
    },
    'route: has geometry': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.routes[0].geometry !== undefined;
      } catch {
        return false;
      }
    },
  });
}

function testTrip(coords) {
  const coordString = coords.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM_BASE_URL}/trip/v1/driving/${coordString}?overview=full&geometries=polyline6&source=first&destination=last`;
  
  const startTime = Date.now();
  const res = http.get(url, {
    timeout: '30s',  // Increased timeout for public server
    tags: { name: 'OSRMTrip' },
  });
  const duration = Date.now() - startTime;
  
  tripDuration.add(duration);
  tripErrorRate.add(res.status !== 200);
  
  check(res, {
    'trip: status 200': (r) => r.status === 200,
    'trip: code Ok': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.code === 'Ok';
      } catch {
        return false;
      }
    },
    'trip: has trips': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.trips && body.trips.length > 0;
      } catch {
        return false;
      }
    },
    'trip: has waypoint order': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.waypoints !== undefined;
      } catch {
        return false;
      }
    },
  });
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('🗺️  OSRM ROUTING PERFORMANCE TEST');
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
    'stdout': '',
  };
}
