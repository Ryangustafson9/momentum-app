
let cache = {
  members: null,
  staffRoles: null,
  permissions: null,
  membershipTypes: null,
  classes: null,
  notifications: null, 
  generalSettings: null,
  notificationSettings: null,
  adminPanelSettings: null,
  layoutSettings: null,
  securitySettings: null,
  billingSettings: null,
  attendance: null,
  appInitialized: null,
  lastFetchTime: {}
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const createCache = () => {
  return {
    members: null,
    staffRoles: null,
    permissions: null,
    membershipTypes: null,
    classes: null,
    notifications: null,
    generalSettings: null,
    notificationSettings: null,
    adminPanelSettings: null,
    layoutSettings: null,
    securitySettings: null,
    billingSettings: null,
    attendance: null,
    appInitialized: null,
    lastFetchTime: {}
  };
};

export const isCacheValid = (currentCache, key) => {
  const cacheToUse = currentCache || cache;
  return cacheToUse[key] && cacheToUse.lastFetchTime[key] && (Date.now() - cacheToUse.lastFetchTime[key] < CACHE_DURATION);
};

export const updateCache = (currentCache, key, data, duration = CACHE_DURATION) => {
  const cacheToUse = currentCache || cache;
  cacheToUse[key] = data;
  cacheToUse.lastFetchTime[key] = Date.now();
};

export const invalidateCache = (currentCache, key) => {
  const cacheToUse = currentCache || cache;
  cacheToUse[key] = null;
  delete cacheToUse.lastFetchTime[key];
  window.dispatchEvent(new CustomEvent(`storageUpdate_${key}`));
  window.dispatchEvent(new CustomEvent('appDataChanged', { detail: { key } }));
};

export const getCache = (currentCache, key) => {
  const cacheToUse = currentCache || cache;
  return cacheToUse[key];
};

export const clearAllCaches = (currentCache) => {
  const cacheToUse = currentCache || cache;
  const initialCacheState = createCache();
  for (const key in cacheToUse) {
    if (Object.prototype.hasOwnProperty.call(cacheToUse, key)) {
      cacheToUse[key] = initialCacheState[key];
    }
  }
  cacheToUse.lastFetchTime = {};
  window.dispatchEvent(new CustomEvent('appDataChanged', { detail: { key: 'all' } }));
};


