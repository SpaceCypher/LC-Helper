/**
 * Background Service Worker for LC Helper
 * Handles communication between content script and backend
 */

const BACKEND_URL = 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

console.log('LC Helper: Background service worker initialized');

/**
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SYNC_SUBMISSION') {
        handleSubmissionSync(message.data)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        // Return true to indicate async response
        return true;
    }
});

/**
 * Sync submission data to backend with retry logic
 */
async function handleSubmissionSync(data, retryCount = 0) {
    try {
        console.log('LC Helper: Sending submission to backend:', data);

        const response = await fetch(`${BACKEND_URL}/api/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('LC Helper: Backend sync successful:', result);

        // Show success notification
        chrome.notifications?.create?.({
            type: 'basic',
            title: 'LC Helper',
            message: `Synced: ${data.title}`,
            priority: 1
        });

        return result;
    } catch (error) {
        console.error('LC Helper: Sync error:', error);

        // Retry logic
        if (retryCount < MAX_RETRIES) {
            console.log(`LC Helper: Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
            await sleep(RETRY_DELAY);
            return handleSubmissionSync(data, retryCount + 1);
        }

        // All retries failed
        chrome.notifications?.create?.({
            type: 'basic',
            title: 'LC Helper - Sync Failed',
            message: 'Could not sync to backend. Is the server running?',
            priority: 2
        });

        throw error;
    }
}

/**
 * Helper: Sleep function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle extension icon click
 */
chrome.action?.onClicked?.addListener(() => {
    chrome.tabs.create({ url: BACKEND_URL });
});
