
// Load saved key logic
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lcHelperApiKey', 'lcHelperBackendUrl'], (result) => {
        if (result.lcHelperApiKey) {
            document.getElementById('apiKey').value = result.lcHelperApiKey;
            updateStatus(true);
        } else {
            updateStatus(false);
        }

        if (result.lcHelperBackendUrl) {
            document.getElementById('backendUrl').value = result.lcHelperBackendUrl;
        }
    });

    // Save key
    document.getElementById('saveKeyBtn').addEventListener('click', () => {
        const key = document.getElementById('apiKey').value;
        const backendUrl = document.getElementById('backendUrl').value;

        // Remove trailing slash from URL if present
        const cleanUrl = backendUrl.replace(/\/$/, '');

        chrome.storage.local.set({
            lcHelperApiKey: key,
            lcHelperBackendUrl: cleanUrl
        }, () => {
            const btn = document.getElementById('saveKeyBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Saved!';
            setTimeout(() => btn.textContent = originalText, 2000);
            updateStatus(!!key);
        });
    });

    // Open Dashboard
    // Open Dashboard
    document.querySelector('.dashboard-btn').addEventListener('click', () => {
        chrome.storage.local.get(['lcHelperBackendUrl'], (result) => {
            const url = result.lcHelperBackendUrl || 'http://localhost:3000';
            chrome.tabs.create({ url });
        });
    });
});

function updateStatus(hasKey) {
    const indicator = document.querySelector('.status-indicator');
    const text = document.getElementById('statusText');

    if (hasKey) {
        indicator.style.background = '#10b981';
        text.textContent = 'Extension Active';
    } else {
        indicator.style.background = '#fbbf24';
        text.textContent = 'Setup Required';
    }
}
