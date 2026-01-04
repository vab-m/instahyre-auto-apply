// Content script for Instahyre Auto Apply Extension (Firefox Version)
// This runs on the Instahyre opportunities page

(function () {
    'use strict';

    // State
    let isRunning = false;
    let shouldStop = false;
    let config = {
        delay: 2000,
        skipApplied: true,
        autoScroll: true
    };

    // Stats
    const stats = {
        applied: 0,
        skipped: 0,
        errors: 0,
        total: 0
    };

    // Utility: Sleep function
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Utility: Log with prefix
    const log = {
        info: (msg) => console.log(`%c[Instahyre AutoApply] ${msg}`, 'color: #00bcd4; font-weight: bold;'),
        success: (msg) => console.log(`%c[Instahyre AutoApply] ✓ ${msg}`, 'color: #4caf50; font-weight: bold;'),
        warning: (msg) => console.log(`%c[Instahyre AutoApply] ⚠ ${msg}`, 'color: #ff9800; font-weight: bold;'),
        error: (msg) => console.log(`%c[Instahyre AutoApply] ✗ ${msg}`, 'color: #f44336; font-weight: bold;'),
    };

    // Send stats update to popup
    function sendStatsUpdate() {
        browser.runtime.sendMessage({ type: 'statsUpdate', stats });
    }

    // Send status update to popup
    function sendStatusUpdate(status, isRunning = false) {
        browser.runtime.sendMessage({ type: 'statusUpdate', status, isRunning });
    }

    // Find all job cards in the list
    function getJobCards() {
        const selectors = [
            '[class*="opportunity-card"]',
            '[class*="job-card"]',
            '.opportunity-listing',
            '.job-listing-item',
            'aside li',
            '.sidebar li',
            '[class*="opportunities"] > div > div',
            '[class*="listing"] > div'
        ];

        for (const selector of selectors) {
            const cards = document.querySelectorAll(selector);
            if (cards.length > 0) {
                log.info(`Found ${cards.length} job cards using: ${selector}`);
                return Array.from(cards);
            }
        }

        const allDivs = document.querySelectorAll('div[class]');
        const jobCards = Array.from(allDivs).filter(div => {
            const className = div.className.toLowerCase();
            const hasJobText = div.textContent && div.textContent.length > 50;
            return (className.includes('opportunit') || className.includes('job') || className.includes('listing'))
                && hasJobText
                && div.querySelectorAll('button, a').length > 0;
        });

        if (jobCards.length > 0) {
            log.info(`Found ${jobCards.length} job cards using fallback`);
            return jobCards.slice(0, 50);
        }

        return [];
    }

    // Find the Apply button in the current view
    function findApplyButton() {
        const allButtons = document.querySelectorAll('button, a[role="button"]');

        for (const btn of allButtons) {
            const text = btn.textContent.trim().toLowerCase();

            if ((text === 'apply' || text === 'apply now' || text === 'quick apply' || text === 'apply →')
                && !text.includes('not')
                && !text.includes('applied')) {

                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }

        const classSelectors = [
            'button[class*="apply"]',
            'a[class*="apply"]',
            '.apply-btn',
            '.apply-button'
        ];

        for (const selector of classSelectors) {
            const btn = document.querySelector(selector);
            if (btn && !btn.textContent.toLowerCase().includes('applied')) {
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }

        return null;
    }

    // Check if already applied to current job
    function isAlreadyApplied() {
        const appliedIndicators = document.querySelectorAll(
            '[class*="applied"], .applied-badge, .application-status'
        );

        for (const indicator of appliedIndicators) {
            const rect = indicator.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const text = indicator.textContent.toLowerCase();
                if (text.includes('applied') || text.includes('application sent')) {
                    return true;
                }
            }
        }

        const applyBtn = findApplyButton();
        if (applyBtn) {
            const text = applyBtn.textContent.toLowerCase();
            if (text.includes('applied') || applyBtn.disabled) {
                return true;
            }
        }

        return false;
    }

    // Click on a job card to open details
    async function clickJobCard(card, index) {
        log.info(`Opening job ${index + 1}...`);

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(300);

        card.click();

        const link = card.querySelector('a');
        if (link) {
            link.click();
        }

        await sleep(1500);
    }

    // Apply to the currently visible job
    async function applyToCurrentJob() {
        if (config.skipApplied && isAlreadyApplied()) {
            log.warning('Already applied to this job');
            return { success: false, skipped: true };
        }

        const applyBtn = findApplyButton();
        if (!applyBtn) {
            log.error('Apply button not found');
            return { success: false, error: 'Button not found' };
        }

        log.info('Clicking Apply button...');
        applyBtn.click();

        await sleep(1000);
        await closeModals();

        log.success('Applied!');
        return { success: true };
    }

    // Close any modals that appear after applying
    async function closeModals() {
        const closeSelectors = [
            'button[aria-label="Close"]',
            'button[class*="close"]',
            '.modal-close',
            '[class*="dismiss"]',
            'button[class*="modal"] svg',
            '.modal button:last-child'
        ];

        for (const selector of closeSelectors) {
            try {
                const closeBtn = document.querySelector(selector);
                if (closeBtn) {
                    const rect = closeBtn.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        closeBtn.click();
                        await sleep(300);
                    }
                }
            } catch (e) {
                continue;
            }
        }

        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            keyCode: 27,
            bubbles: true
        }));
    }

    // Scroll to load more jobs
    async function scrollToLoadMore() {
        const scrollContainers = document.querySelectorAll(
            '[class*="opportunities"], [class*="listing"], aside, .sidebar'
        );

        for (const container of scrollContainers) {
            if (container.scrollHeight > container.clientHeight) {
                container.scrollTop = container.scrollHeight;
                await sleep(1000);
                return;
            }
        }

        window.scrollTo(0, document.body.scrollHeight);
        await sleep(1000);
    }

    // Main auto-apply function
    async function runAutoApply() {
        if (isRunning) {
            log.warning('Already running');
            return;
        }

        isRunning = true;
        shouldStop = false;
        stats.applied = 0;
        stats.skipped = 0;
        stats.errors = 0;

        log.info('🚀 Starting Auto-Apply...');
        sendStatusUpdate('Starting...', true);

        let jobCards = getJobCards();
        stats.total = jobCards.length;
        sendStatsUpdate();

        if (jobCards.length === 0) {
            log.error('No job cards found');
            sendStatusUpdate('No jobs found', false);
            isRunning = false;
            return;
        }

        log.info(`Found ${jobCards.length} jobs`);

        for (let i = 0; i < jobCards.length && !shouldStop; i++) {
            sendStatusUpdate(`Processing job ${i + 1} of ${jobCards.length}...`, true);
            log.info(`\n--- Processing job ${i + 1} of ${jobCards.length} ---`);

            try {
                await clickJobCard(jobCards[i], i);
                const result = await applyToCurrentJob();

                if (result.success) {
                    stats.applied++;
                    log.success(`Applied! (${stats.applied} total)`);
                } else if (result.skipped) {
                    stats.skipped++;
                    log.warning('Skipped - already applied');
                } else {
                    stats.errors++;
                    log.error('Could not apply');
                }

                sendStatsUpdate();
                await sleep(config.delay);

                if (config.autoScroll && i >= jobCards.length - 3) {
                    await scrollToLoadMore();
                    const newCards = getJobCards();
                    if (newCards.length > jobCards.length) {
                        jobCards = newCards;
                        stats.total = jobCards.length;
                        sendStatsUpdate();
                    }
                }

            } catch (error) {
                stats.errors++;
                log.error(`Error: ${error.message}`);
                sendStatsUpdate();
            }
        }

        isRunning = false;
        log.success('=== Auto-Apply Complete ===');
        log.info(`Applied: ${stats.applied}`);
        log.info(`Skipped: ${stats.skipped}`);
        log.info(`Errors: ${stats.errors}`);

        browser.runtime.sendMessage({ type: 'complete', stats });
    }

    // Stop auto-apply
    function stopAutoApply() {
        shouldStop = true;
        isRunning = false;
        log.warning('Stopping...');
    }

    // Listen for messages from popup
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'startAutoApply':
                if (message.config) {
                    config = { ...config, ...message.config };
                }
                runAutoApply();
                sendResponse({ success: true });
                break;

            case 'stopAutoApply':
                stopAutoApply();
                sendResponse({ success: true });
                break;

            case 'applyCurrentJob':
                applyToCurrentJob().then(result => {
                    sendResponse(result);
                });
                return true;

            case 'getStats':
                sendResponse(stats);
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    });

    log.success('Instahyre Auto-Apply extension loaded!');
    log.info('Open the extension popup to start applying');

})();
