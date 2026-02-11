/**
 * Content Script for LC Helper
 * Runs on leetcode.com/problems/* pages
 * Detects successful submissions and extracts code + metadata
 */

console.log('LC Helper: Content script loaded');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const CHECK_INTERVAL = 2000; // Check every 2 seconds

// State
let lastSubmissionId = null;
let isProcessing = false;
let cachedCode = null; // Cache the code to handle when editor is hidden after submission
let hasAutoSynced = false; // Track if we've auto-synced on this page
let currentPageUrl = window.location.href; // Track current page

/**
 * Extract problem slug from URL
 */
function getProblemSlug() {
    const path = window.location.pathname;
    const match = path.match(/\/problems\/([^/]+)/);
    return match ? match[1] : null;
}

/**
 * Extract problem title from page
 */
function getProblemTitle() {
    // Primary selector: link with problem URL
    const titleElement = document.querySelector('a[href*="/problems/"][class*="whitespace-normal"]');
    if (titleElement) {
        const fullText = titleElement.textContent.trim();
        // Extract title without the number (e.g., "1. Two Sum" -> "Two Sum")
        const match = fullText.match(/^\d+\.\s*(.+)$/);
        return match ? match[1] : fullText;
    }

    // Fallback: try old selector
    const altTitle = document.querySelector('[data-cy="question-title"]');
    return altTitle ? altTitle.textContent.trim() : 'Unknown Problem';
}

/**
 * Extract difficulty from page
 */
function getDifficulty() {
    // Look for div with exact text matching difficulty levels
    const difficultyElement = Array.from(document.querySelectorAll('div')).find(el => {
        const text = el.textContent.trim();
        return text === 'Easy' || text === 'Medium' || text === 'Hard';
    });

    if (difficultyElement) {
        return difficultyElement.textContent.trim();
    }

    // Fallback: try old selector
    const oldDifficulty = document.querySelector('div[diff]');
    if (oldDifficulty) {
        return oldDifficulty.getAttribute('diff');
    }

    return 'Medium'; // Default
}

/**
 * Extract problem number from URL or title
 */
function getProblemNumber() {
    // Get from title element (e.g., "1. Two Sum")
    const titleElement = document.querySelector('a[href*="/problems/"][class*="whitespace-normal"]');
    if (titleElement) {
        const fullText = titleElement.textContent.trim();
        const match = fullText.match(/^(\d+)\./);
        if (match) {
            return parseInt(match[1]);
        }
    }
    return null;
}

/**
 * Extract problem description
 */
function getProblemDescription() {
    // Look for the problem description container
    const descriptionContainer = document.querySelector('[data-track-load="description_content"]');
    if (descriptionContainer) {
        // Get only the first paragraph(s) before examples/constraints
        const paragraphs = descriptionContainer.querySelectorAll('p');
        const description = [];

        for (const p of paragraphs) {
            const text = p.textContent.trim();
            // Stop if we hit Example or Constraints sections
            if (text.toLowerCase().includes('example') || text.toLowerCase().includes('constraint')) {
                break;
            }
            if (text) {
                description.push(text);
            }
        }

        return description.length > 0 ? description.join('\n\n') : null;
    }

    return null;
}

/**
 * Extract constraints
 */
function getConstraints() {
    // Look for "Constraints:" header
    const headers = Array.from(document.querySelectorAll('p, strong'));
    const constraintsHeader = headers.find(el =>
        el.textContent.trim().toLowerCase() === 'constraints:'
    );

    if (constraintsHeader) {
        // Look for UL list following the header
        let next = constraintsHeader.nextElementSibling;
        if (next && next.tagName === 'UL') {
            const items = Array.from(next.querySelectorAll('li'));
            return items.map(li => '• ' + li.textContent.trim()).join('\n');
        } else if (next) {
            // Fallback: get text content of next element
            return next.textContent.trim();
        }
    }

    return null;
}

/**
 * Extract examples/test cases
 */
function getExamples() {
    const examples = [];

    // Find all example headers (e.g., "Example 1:", "Example 2:")
    const headers = Array.from(document.querySelectorAll('p, strong'));
    const exampleHeaders = headers.filter(el =>
        el.textContent.match(/Example\s+\d+:/i)
    );

    // For each example header, find the next <pre> element
    exampleHeaders.forEach(header => {
        let next = header.nextElementSibling;
        // Skip until we find a PRE element or another example
        while (next && next.tagName !== 'PRE' && !next.textContent.includes('Example')) {
            next = next.nextElementSibling;
        }
        if (next && next.tagName === 'PRE') {
            const text = next.textContent.trim();
            if (text && text.length < 500) { // Avoid huge blocks
                examples.push(`${header.textContent.trim()}\n${text}`);
            }
        }
    });

    return examples.length > 0 ? examples.join('\n\n') : null;
}

/**
 * Extract code from editor OR from submission results page
 */
function getCode() {
    // FIRST: Try to get code from submission results page (when viewing accepted solution)
    // LeetCode shows submitted code in <code class="language-xxx"> elements
    const submittedCodeElements = Array.from(document.querySelectorAll('code[class*="language-"]'));
    console.log('LC Helper: Found', submittedCodeElements.length, 'code elements on page');

    // Helper function to check if code looks like actual source code vs test data
    function looksLikeSourceCode(text) {
        // Keywords that appear in real code but not in test data
        const codeKeywords = [
            'class', 'function', 'def ', 'public', 'private', 'return',
            'if ', 'else', 'for ', 'while ', 'int ', 'void ', 'const ',
            'let ', 'var ', 'import', '#include', 'struct', 'impl'
        ];

        // Check if text contains programming keywords
        const hasCodeKeywords = codeKeywords.some(keyword =>
            text.toLowerCase().includes(keyword)
        );

        // Test data usually starts with brackets or is just numbers/arrays
        const looksLikeTestData = /^[\[\]\d\s,\n]+$/.test(text.trim());

        return hasCodeKeywords && !looksLikeTestData;
    }

    for (const codeEl of submittedCodeElements) {
        const code = codeEl.textContent;
        console.log('LC Helper: Code element length:', code?.length || 0, 'preview:', code?.substring(0, 50));

        if (code && code.length > 50) {
            // Skip if it looks like test data
            if (!looksLikeSourceCode(code)) {
                console.log('LC Helper: Skipping - looks like test data');
                continue;
            }

            // Remove line numbers that LeetCode adds (e.g., "1class Solution..." -> "class Solution...")
            const cleanedCode = code.split('\n').map(line => {
                // Remove leading line numbers
                return line.replace(/^\d+/, '');
            }).join('\n');

            if (cleanedCode.length > 10) {
                console.log('LC Helper: Code extracted from submission results page, length:', cleanedCode.length);
                cachedCode = cleanedCode;
                return cleanedCode;
            }
        }
    }

    // SECOND: Try textarea (fallback for editor page)
    const textarea = document.querySelector('textarea[class*="code"]');
    if (textarea && textarea.value) {
        console.log('LC Helper: Code extracted from textarea, length:', textarea.value.length);
        cachedCode = textarea.value;
        return textarea.value;
    }

    // THIRD: Use cached code if available
    if (cachedCode) {
        console.log('LC Helper: Using cached code, length:', cachedCode.length);
        return cachedCode;
    }

    console.log('LC Helper: No code found anywhere');
    return null;
}

/**
 * Periodically cache code from editor
 * (Simplified significantly to avoid CSP issues)
 */
function cacheCode() {
    // Only try to read from textarea which is safe
    try {
        const textarea = document.querySelector('textarea[class*="code"]');
        if (textarea && textarea.value && textarea.value.length > 10) {
            cachedCode = textarea.value;
            console.log('LC Helper: Code cached from textarea! Length:', textarea.value.length);
        }
    } catch (error) {
        // Silent fail
    }
}

/**
 * Extract programming language
 */
function getLanguage() {
    // Try to find language selector
    const langButton = document.querySelector('button[id*="lang"]');
    if (langButton) {
        return langButton.textContent.trim();
    }

    // Try alternative selector
    const langDiv = document.querySelector('div[class*="lang"]');
    if (langDiv) {
        return langDiv.textContent.trim();
    }

    return 'Python'; // Default
}

/**
 * Check if submission was accepted
 */
function checkSubmissionStatus() {
    // Pattern 1: Check for elements with "Accepted" text and green color
    const greenElements = Array.from(document.querySelectorAll('span, div')).filter(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const text = el.textContent.trim();

        // Check if text is exactly "Accepted" and has green color
        return text === 'Accepted' && (
            color.includes('rgb(45, 181, 93)') ||  // Actual LeetCode green from testing!
            color.includes('rgb(0, 184, 163)') ||  // Alternative LeetCode green
            color.includes('rgb(67, 160, 71)') ||   // Material green
            color.includes('16, 185, 129') ||       // Tailwind green
            el.className.includes('text-green')     // Green class
        );
    });

    if (greenElements.length > 0) {
        console.log('LC Helper: Found accepted submission via green text');
        return true;
    }

    // Pattern 2: Old selector
    const oldSelector = document.querySelector('[data-e2e-locator="submission-result"]');
    if (oldSelector && oldSelector.textContent.includes('Accepted')) {
        console.log('LC Helper: Found accepted submission via data-e2e-locator');
        return true;
    }

    // Pattern 3: Check for status ID 10 (LeetCode's internal status for Accepted)
    const statusElements = Array.from(document.querySelectorAll('[data-status-id="10"]'));
    if (statusElements.length > 0) {
        console.log('LC Helper: Found accepted submission via status-id');
        return true;
    }

    // Pattern 4: Look for "Runtime" and "Memory" together (only shown on accepted submissions)
    const hasRuntime = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent.includes('Runtime') && el.textContent.includes('ms')
    );
    const hasMemory = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent.includes('Memory') && el.textContent.includes('MB')
    );
    const hasAcceptedText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent.trim() === 'Accepted'
    );

    if (hasRuntime && hasMemory && hasAcceptedText) {
        console.log('LC Helper: Found accepted submission via Runtime+Memory+Accepted');
        return true;
    }

    return false;
}

/**
 * Send submission data to backend
 */
async function syncSubmission(data) {
    if (isProcessing) {
        console.log('LC Helper: Already processing a submission');
        return;
    }

    isProcessing = true;

    try {
        console.log('LC Helper: Syncing submission:', data);

        // Send to background script
        chrome.runtime.sendMessage({
            type: 'SYNC_SUBMISSION',
            data: data
        }, (response) => {
            // Check for runtime errors
            if (chrome.runtime.lastError) {
                console.error('LC Helper: Runtime error:', chrome.runtime.lastError.message);
                showNotification('❌ Extension error! Check if background script is running.');
                isProcessing = false;
                return;
            }

            if (response && response.success) {
                console.log('LC Helper: Submission synced successfully!');
                // Show success notification
                showNotification('✓ Synced to LC Helper!');
            } else {
                console.error('LC Helper: Sync failed:', response?.error);
                showNotification('❌ Sync failed: ' + (response?.error || 'Unknown error'));

                // Reset lastSubmissionId so we can retry
                lastSubmissionId = null;
            }
            isProcessing = false;
        });
    } catch (error) {
        console.error('LC Helper: Error syncing submission:', error);
        showNotification('❌ Error: ' + error.message);

        // Reset lastSubmissionId so we can retry
        lastSubmissionId = null;
        isProcessing = false;
    }
}

/**
 * Show notification on page
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Main monitoring loop
 */
function monitorSubmissions() {
    const isAccepted = checkSubmissionStatus();

    if (isAccepted && !isProcessing) {
        const slug = getProblemSlug();
        const code = getCode();

        console.log('LC Helper: Submission detected! slug:', slug, 'code length:', code?.length || 0);

        if (slug && code) {
            const submissionData = {
                slug,
                title: getProblemTitle(),
                difficulty: getDifficulty(),
                problemNumber: getProblemNumber(),
                description: getProblemDescription(),
                constraints: getConstraints(),
                examples: getExamples(),
                code,
                language: getLanguage(),
                submittedAt: new Date().toISOString()
            };

            // Check if it's a new submission (prevent duplicates)
            const submissionHash = `${slug}-${code.substring(0, 50)}`;
            if (submissionHash !== lastSubmissionId) {
                lastSubmissionId = submissionHash;
                syncSubmission(submissionData);
            } else {
                console.log('LC Helper: Skipping duplicate submission');
            }
        } else {
            console.warn('LC Helper: Missing required data - slug:', !!slug, 'code:', !!code);
        }
    }
}

/**
 * Auto-sync latest submission when on description page
 */
function autoSyncLatestSubmission() {
    // Only auto-sync once per page load
    if (hasAutoSynced) {
        return;
    }

    // Check if URL changed (user navigated)
    if (window.location.href !== currentPageUrl) {
        currentPageUrl = window.location.href;
        hasAutoSynced = false; // Reset for new page
    }

    // Only auto-sync on description pages, not on submission pages
    const isDescriptionPage = window.location.pathname.includes('/description') ||
        (!window.location.pathname.includes('/submissions') &&
            !window.location.pathname.includes('/editorial') &&
            !window.location.pathname.includes('/solutions'));

    if (!isDescriptionPage) {
        return; // Don't auto-sync on submissions pages - let manual detection work
    }

    // Check if there's a "Submissions" tab we can click
    const submissionsTab = Array.from(document.querySelectorAll('a, button')).find(el =>
        el.textContent.trim().toLowerCase() === 'submissions'
    );

    if (submissionsTab && !isProcessing) {
        console.log('LC Helper: Auto-syncing latest submission...');
        hasAutoSynced = true; // Mark as synced to prevent repeated attempts

        // Click the submissions tab
        submissionsTab.click();

        // Wait for submissions to load, then click the first accepted one
        setTimeout(() => {
            const acceptedSubmissions = Array.from(document.querySelectorAll('a[href*="/submissions/"]')).filter(el => {
                // Look for green "Accepted" indicator nearby
                const parent = el.closest('div');
                return parent && parent.textContent.includes('Accepted');
            });

            if (acceptedSubmissions.length > 0) {
                console.log('LC Helper: Found accepted submission, navigating...');
                acceptedSubmissions[0].click();
            } else {
                console.log('LC Helper: No accepted submissions found');
                hasAutoSynced = false; // Allow retry
            }
        }, 1500); // Wait for submissions list to load
    }
}

// Start monitoring
console.log('LC Helper: Starting submission monitor');
setInterval(monitorSubmissions, CHECK_INTERVAL);

// Periodically cache code (in case editor becomes inaccessible after submission)
setInterval(cacheCode, 2000);

// Auto-sync latest submission on description pages
setInterval(autoSyncLatestSubmission, 3000); // Check every 3 seconds

// Also check immediately on page load after a delay
setTimeout(monitorSubmissions, 3000);
setTimeout(autoSyncLatestSubmission, 4000); // Try auto-sync after initial load
