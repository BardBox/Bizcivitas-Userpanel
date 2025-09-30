const STORAGE_KEY = 'bizcivitas_form_state';
const EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const loadState = () => {
  try {
    if (typeof window === 'undefined') {
      return undefined; // Server-side rendering
    }
    
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    
    const dataWithTimestamp = JSON.parse(serializedState);
    
    // Check if data has timestamp and expiration logic
    if (dataWithTimestamp.timestamp && dataWithTimestamp.data) {
      const currentTime = Date.now();
      const dataAge = currentTime - dataWithTimestamp.timestamp;
      
      // If data is older than 5 minutes, clear it and return undefined
      if (dataAge > EXPIRATION_TIME) {
        console.log('Form data expired (5 minutes), clearing localStorage');
        localStorage.removeItem(STORAGE_KEY);
        return undefined;
      }
      
      // Data is still valid, return it
      return dataWithTimestamp.data;
    }
    
    // Legacy data without timestamp - treat as expired
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
    
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    // Save data with timestamp for expiration checking
    const dataWithTimestamp = {
      data: state,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRATION_TIME
    };
    
    const serializedState = JSON.stringify(dataWithTimestamp);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
};

export const clearState = () => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear state from localStorage:', err);
  }
};

// Utility function to check if stored data is expired (for debugging)
export const isDataExpired = () => {
  try {
    if (typeof window === 'undefined') {
      return true;
    }
    
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return true;
    }
    
    const dataWithTimestamp = JSON.parse(serializedState);
    if (!dataWithTimestamp.timestamp) {
      return true;
    }
    
    const currentTime = Date.now();
    const dataAge = currentTime - dataWithTimestamp.timestamp;
    return dataAge > EXPIRATION_TIME;
  } catch (err) {
    return true;
  }
};

// Utility function to get remaining time (for debugging)
export const getRemainingTime = () => {
  try {
    if (typeof window === 'undefined') {
      return 0;
    }
    
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return 0;
    }
    
    const dataWithTimestamp = JSON.parse(serializedState);
    if (!dataWithTimestamp.timestamp) {
      return 0;
    }
    
    const currentTime = Date.now();
    const expiresAt = dataWithTimestamp.timestamp + EXPIRATION_TIME;
    const remainingTime = Math.max(0, expiresAt - currentTime);
    
    return Math.ceil(remainingTime / 1000); // Return seconds
  } catch (err) {
    return 0;
  }
};
