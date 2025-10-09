/**
 * Performance Helper - Paste this in browser console
 * 
 * How to use:
 * 1. Press F12 (open console)
 * 2. Copy this entire file content
 * 3. Paste in console
 * 4. Press Enter
 * 5. Run: checkPerformance()
 */

// Check overall performance
function checkPerformance() {
    console.clear();
    console.log('%c🔍 PERFORMANCE CHECK', 'background: #4CAF50; color: white; padding: 10px; font-size: 20px; font-weight: bold;');
    console.log('\n');

    // Check 1: Memory Usage
    if (performance.memory) {
        const memory = performance.memory;
        const usedMemoryMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMemoryMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
        const memoryPercent = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1);

        console.log('%c📊 MEMORY USAGE', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');
        console.log(`Used: ${usedMemoryMB} MB / ${totalMemoryMB} MB (${memoryPercent}%)`);

        if (parseFloat(usedMemoryMB) > 500) {
            console.warn('⚠️ WARNING: High memory usage! Consider restarting.');
        } else {
            console.log('✅ Memory usage is OK');
        }
        console.log('\n');
    }

    // Check 2: Component Re-renders
    console.log('%c🔄 RE-RENDER CHECK', 'background: #FF9800; color: white; padding: 5px; font-weight: bold;');
    console.log('To check re-renders:');
    console.log('1. Open React DevTools');
    console.log('2. Go to Profiler tab');
    console.log('3. Click record and navigate');
    console.log('4. Stop recording');
    console.log('5. Look for components with many renders');
    console.log('\n');

    // Check 3: Network Performance
    console.log('%c🌐 NETWORK CHECK', 'background: #9C27B0; color: white; padding: 5px; font-weight: bold;');

    const resources = performance.getEntriesByType('resource');
    const apiCalls = resources.filter(r => r.name.includes('/api/'));

    console.log(`Total API Calls: ${apiCalls.length}`);

    const slowCalls = apiCalls.filter(r => r.duration > 1000);
    console.log(`Slow API Calls (>1s): ${slowCalls.length}`);

    if (slowCalls.length > 0) {
        console.warn('⚠️ SLOW API CALLS DETECTED:');
        slowCalls.forEach(call => {
            console.log(`🐌 ${call.duration.toFixed(0)}ms: ${call.name}`);
        });
    } else {
        console.log('✅ All API calls are fast');
    }
    console.log('\n');

    // Check 4: Page Load Performance
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
        console.log('%c⚡ PAGE LOAD TIME', 'background: #F44336; color: white; padding: 5px; font-weight: bold;');
        console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd.toFixed(0)}ms`);
        console.log(`Page Fully Loaded: ${navigation.loadEventEnd.toFixed(0)}ms`);

        if (navigation.loadEventEnd > 3000) {
            console.warn('⚠️ Page load is slow (>3s)');
        } else {
            console.log('✅ Page load time is good');
        }
        console.log('\n');
    }

    // Summary
    console.log('%c📋 SUMMARY', 'background: #607D8B; color: white; padding: 5px; font-weight: bold;');
    const issues = [];

    if (performance.memory && (performance.memory.usedJSHeapSize / 1048576) > 500) {
        issues.push('High memory usage');
    }
    if (slowCalls.length > 0) {
        issues.push(`${slowCalls.length} slow API calls`);
    }
    if (navigation && navigation.loadEventEnd > 3000) {
        issues.push('Slow page load');
    }

    if (issues.length === 0) {
        console.log('%c✅ NO ISSUES FOUND!', 'background: #4CAF50; color: white; padding: 5px; font-weight: bold;');
        console.log('Your app performance is good! 🎉');
    } else {
        console.log('%c⚠️ ISSUES FOUND:', 'background: #F44336; color: white; padding: 5px; font-weight: bold;');
        issues.forEach(issue => console.log(`• ${issue}`));
    }
    console.log('\n');

    console.log('%c💡 TIPS', 'background: #00BCD4; color: white; padding: 5px; font-weight: bold;');
    console.log('• Run this command after navigating to see performance');
    console.log('• Check the Performance Monitor widget (bottom-right)');
    console.log('• Open Network tab (F12 → Network) to see API calls');
    console.log('• Run: clearCache() to clear and restart');
}

// Clear cache and reload
function clearCache() {
    console.log('🔄 Clearing cache and reloading...');
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
}

// Monitor API calls in real-time
function monitorAPICalls() {
    console.log('%c🎯 API CALL MONITOR STARTED', 'background: #3F51B5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('All API calls will be logged below...\n');

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0]?.toString() || 'Unknown';

        console.log(`🌐 Starting: ${url}`);

        try {
            const response = await originalFetch(...args);
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (duration > 1000) {
                console.warn(`🐌 Slow (${duration.toFixed(0)}ms): ${url}`);
            } else {
                console.log(`✅ Fast (${duration.toFixed(0)}ms): ${url}`);
            }

            return response;
        } catch (error) {
            console.error(`❌ Failed: ${url}`, error);
            throw error;
        }
    };

    console.log('✅ Monitoring active. Navigate to see API calls.');
    console.log('💡 Refresh page to stop monitoring.\n');
}

// Show all commands
function help() {
    console.log('%c📖 AVAILABLE COMMANDS', 'background: #673AB7; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('\n');
    console.log('%ccheckPerformance()', 'color: #4CAF50; font-weight: bold;');
    console.log('  → Check overall app performance\n');

    console.log('%cmonitorAPICalls()', 'color: #2196F3; font-weight: bold;');
    console.log('  → Monitor all API calls in real-time\n');

    console.log('%cclearCache()', 'color: #FF9800; font-weight: bold;');
    console.log('  → Clear cache and reload\n');

    console.log('%chelp()', 'color: #9C27B0; font-weight: bold;');
    console.log('  → Show this help message\n');
}

// Auto-run help on load
console.log('%c🚀 PERFORMANCE HELPER LOADED!', 'background: #4CAF50; color: white; padding: 10px; font-size: 20px; font-weight: bold;');
console.log('\n');
console.log('Available commands:');
console.log('• checkPerformance() - Check app performance');
console.log('• monitorAPICalls() - Monitor API calls');
console.log('• clearCache() - Clear cache and reload');
console.log('• help() - Show all commands');
console.log('\n');
console.log('%c💡 TIP: Run checkPerformance() to start!', 'background: #00BCD4; color: white; padding: 5px;');
