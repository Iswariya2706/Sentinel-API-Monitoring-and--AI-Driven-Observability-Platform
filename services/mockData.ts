import { ApiLog, DashboardStats, HttpMethod, IssueStatus, ServiceName, Developer, Alert } from '../types';

// Mock Developers
export const MOCK_DEVELOPERS: Developer[] = [
  { id: 'dev1', name: 'Alice Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'dev2', name: 'Bob DevOps', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: 'dev3', name: 'Charlie SRE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
];

// Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

const endpoints: Record<ServiceName, string[]> = {
  [ServiceName.ORDER_SERVICE]: ['/api/v1/orders', '/api/v1/orders/detail', '/api/v1/checkout'],
  [ServiceName.PAYMENT_SERVICE]: ['/api/v1/payments/charge', '/api/v1/payments/refund'],
  [ServiceName.USER_SERVICE]: ['/api/v1/users/profile', '/api/v1/users/login', '/api/v1/users/register'],
  [ServiceName.INVENTORY_SERVICE]: ['/api/v1/inventory/check', '/api/v1/inventory/update'],
  [ServiceName.NOTIFICATION_SERVICE]: ['/api/v1/notifications/email', '/api/v1/notifications/sms'],
};

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- State Management for Simulation ---

// Keep last 500 logs
let LIVE_LOGS: ApiLog[] = [];
// Keep last 20 chart data points (approx 20 seconds of history for live view)
let LIVE_CHART_DATA: { time: string; success: number; error: number; slow: number }[] = [];

// Initialize data
const initData = () => {
  const now = Date.now();
  // Pre-fill logs
  for (let i = 0; i < 50; i++) {
    LIVE_LOGS.push(generateSingleLog(new Date(now - i * 10000).toISOString()));
  }
  LIVE_LOGS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pre-fill chart
  for (let i = 20; i >= 0; i--) {
    LIVE_CHART_DATA.push({
      time: new Date(now - i * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      success: Math.floor(Math.random() * 20) + 5,
      error: 0,
      slow: Math.floor(Math.random() * 2)
    });
  }
};

function generateSingleLog(timestamp: string = new Date().toISOString()): ApiLog {
  const service = getRandomElement(Object.values(ServiceName));
  const endpoint = getRandomElement(endpoints[service]);
  const method = getRandomElement([HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT]);
  
  const rand = Math.random();
  let statusCode = 200;
  let isRateLimitHit = false;

  // Simulation logic: Random bursts of errors
  const isErrorBurst = Math.random() > 0.95; 

  if (isErrorBurst || rand > 0.97) statusCode = 500;
  else if (rand > 0.95) statusCode = 503;
  else if (rand > 0.92) { statusCode = 429; isRateLimitHit = true; }
  else if (rand > 0.88) statusCode = 400;
  
  let latencyMs = Math.floor(Math.random() * 150) + 20;
  if (statusCode >= 500) latencyMs += 800;
  if (Math.random() > 0.9) latencyMs += 400; // Random latency spike

  return {
    id: generateId(),
    serviceName: service,
    endpoint,
    method,
    statusCode,
    latencyMs,
    timestamp,
    requestSize: Math.floor(Math.random() * 1000) + 100,
    responseSize: Math.floor(Math.random() * 5000) + 100,
    status: (statusCode >= 500 || latencyMs > 500) ? IssueStatus.OPEN : IssueStatus.RESOLVED,
    isRateLimitHit,
  };
}

initData();

// --- Real-time Simulation Engine ---

type UpdatePayload = {
  newLog?: ApiLog;
  newAlert?: Alert;
  stats: DashboardStats;
};

type Listener = (data: UpdatePayload) => void;
const listeners: Listener[] = [];

export const subscribeToRealtimeUpdates = (callback: Listener) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

let simulationInterval: any = null;

export const startSimulation = () => {
  if (simulationInterval) return;
  
  // Update every 1 second
  simulationInterval = setInterval(() => {
    // 1. Generate 1-3 new logs per tick
    const logsCount = Math.floor(Math.random() * 3) + 1;
    let tickError = 0;
    let tickSuccess = 0;
    let tickSlow = 0;
    let latestLog: ApiLog | undefined;
    let latestAlert: Alert | undefined;

    for (let i = 0; i < logsCount; i++) {
      const newLog = generateSingleLog();
      LIVE_LOGS.unshift(newLog);
      latestLog = newLog;

      // Stats aggregation for this tick
      if (newLog.statusCode >= 500 || newLog.statusCode === 429) tickError++;
      else tickSuccess++;
      if (newLog.latencyMs > 500) tickSlow++;

      // Alert Generation
      if (newLog.statusCode >= 500) {
        latestAlert = {
          id: generateId(),
          type: 'CRITICAL',
          message: `5xx Error: ${newLog.serviceName}`,
          timestamp: newLog.timestamp
        };
      } else if (newLog.latencyMs > 800) {
        latestAlert = {
          id: generateId(),
          type: 'WARNING',
          message: `High Latency: ${newLog.endpoint} (${newLog.latencyMs}ms)`,
          timestamp: newLog.timestamp
        };
      } else if (newLog.isRateLimitHit) {
        latestAlert = {
          id: generateId(),
          type: 'INFO',
          message: `Rate Limit: ${newLog.serviceName}`,
          timestamp: newLog.timestamp
        };
      }
    }

    // Trim logs
    if (LIVE_LOGS.length > 500) LIVE_LOGS = LIVE_LOGS.slice(0, 500);

    // 2. Update Chart Data (Sliding Window)
    LIVE_CHART_DATA.shift(); // Remove oldest
    LIVE_CHART_DATA.push({
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      success: tickSuccess * (Math.floor(Math.random() * 5) + 1), // Scale up for visual chart
      error: tickError * 5,
      slow: tickSlow
    });

    // 3. Recalculate Stats
    const stats = calculateStats();

    // 4. Broadcast
    listeners.forEach(l => l({ newLog: latestLog, newAlert: latestAlert, stats }));

  }, 1000);
};

export const stopSimulation = () => {
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = null;
};

// --- Helper: Stats Calculation ---
const calculateStats = (): DashboardStats => {
  const totalRequests = LIVE_LOGS.length;
  const slowRequestCount = LIVE_LOGS.filter(l => l.latencyMs > 500).length;
  const brokenRequestCount = LIVE_LOGS.filter(l => l.statusCode >= 500).length;
  const rateLimitCount = LIVE_LOGS.filter(l => l.isRateLimitHit).length;
  const totalLatency = LIVE_LOGS.reduce((acc, curr) => acc + curr.latencyMs, 0);
  
  // Top Slow Endpoints
  const endpointMap = new Map<string, { total: number, count: number, service: string }>();
  LIVE_LOGS.forEach(l => {
    const key = `${l.serviceName}::${l.endpoint}`;
    const entry = endpointMap.get(key) || { total: 0, count: 0, service: l.serviceName };
    entry.total += l.latencyMs;
    entry.count += 1;
    endpointMap.set(key, entry);
  });

  const topSlowEndpoints = Array.from(endpointMap.entries())
    .map(([key, val]) => ({
      endpoint: key.split('::')[1],
      service: val.service,
      avgLatency: Math.round(val.total / val.count),
    }))
    .sort((a, b) => b.avgLatency - a.avgLatency)
    .slice(0, 5);

  return {
    totalRequests,
    slowRequestCount,
    brokenRequestCount,
    rateLimitCount,
    avgLatency: totalRequests ? Math.round(totalLatency / totalRequests) : 0,
    topSlowEndpoints,
    requestsOverTime: [...LIVE_CHART_DATA], // Copy to prevent mutation issues
  };
};

// --- API Methods ---

export const fetchLogs = async (filters: any): Promise<ApiLog[]> => {
  let filtered = [...LIVE_LOGS];
  
  if (filters.service) {
    filtered = filtered.filter(l => l.serviceName === filters.service);
  }
  if (filters.status === 'SLOW') {
    filtered = filtered.filter(l => l.latencyMs > 500);
  }
  if (filters.status === 'BROKEN') {
    filtered = filtered.filter(l => l.statusCode >= 500);
  }
  if (filters.status === 'RATE_LIMIT') {
    filtered = filtered.filter(l => l.isRateLimitHit || l.statusCode === 429);
  }

  return filtered;
};

export const fetchStats = async (): Promise<DashboardStats> => {
  return calculateStats();
};

export const resolveIssue = async (logId: string): Promise<void> => {
  const index = LIVE_LOGS.findIndex(l => l.id === logId);
  if (index !== -1) {
    LIVE_LOGS[index] = { ...LIVE_LOGS[index], status: IssueStatus.RESOLVED };
  }
};

export const assignIssue = async (logId: string, devId: string): Promise<void> => {
  const index = LIVE_LOGS.findIndex(l => l.id === logId);
  if (index !== -1) {
    LIVE_LOGS[index] = { ...LIVE_LOGS[index], assignedTo: devId };
  }
};