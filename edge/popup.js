// Popup script for Instahyre Auto Apply Extension

document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isInstahyre = tab.url && tab.url.includes('instahyre.com/candidate/opportunities');

    // UI Elements
    const notOnInstahyre = document.getElementById('not-on-instahyre');
    const mainControls = document.getElementById('main-controls');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const btnApplyCurrent = document.getElementById('btn-apply-current');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const statApplied = document.getElementById('stat-applied');
    const statSkipped = document.getElementById('stat-skipped');
    const statTotal = document.getElementById('stat-total');
    const delayInput = document.getElementById('delay-input');
    const skipAppliedCheckbox = document.getElementById('skip-applied');
    const autoScrollCheckbox = document.getElementById('auto-scroll');

    // Show warning if not on Instahyre
    if (!isInstahyre) {
        notOnInstahyre.style.display = 'flex';
        mainControls.style.opacity = '0.5';
        mainControls.style.pointerEvents = 'none';
        return;
    }

    // Load saved settings
    const settings = await chrome.storage.local.get(['delay', 'skipApplied', 'autoScroll']);
    if (settings.delay) delayInput.value = settings.delay;
    if (settings.skipApplied !== undefined) skipAppliedCheckbox.checked = settings.skipApplied;
    if (settings.autoScroll !== undefined) autoScrollCheckbox.checked = settings.autoScroll;

    // Save settings on change
    delayInput.addEventListener('change', () => {
        chrome.storage.local.set({ delay: parseInt(delayInput.value) });
    });
    skipAppliedCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ skipApplied: skipAppliedCheckbox.checked });
    });
    autoScrollCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ autoScroll: autoScrollCheckbox.checked });
    });

    // Update stats from content script
    function updateStats(stats) {
        statApplied.textContent = stats.applied || 0;
        statSkipped.textContent = stats.skipped || 0;
        statTotal.textContent = stats.total || 0;

        if (stats.total > 0) {
            const progress = Math.round(((stats.applied + stats.skipped + stats.errors) / stats.total) * 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
    }

    // Update status display
    function setStatus(status, isRunning = false) {
        statusText.textContent = status;
        statusDot.className = 'status-dot' + (isRunning ? ' running' : '');

        if (isRunning) {
            btnStart.style.display = 'none';
            btnStop.style.display = 'flex';
            progressContainer.style.display = 'block';
        } else {
            btnStart.style.display = 'flex';
            btnStop.style.display = 'none';
        }
    }

    // Send message to content script
    async function sendToContent(action, data = {}) {
        try {
            const response = await chrome.tabs.sendMessage(tab.id, { action, ...data });
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('Error: Please refresh the page', false);
            return null;
        }
    }

    // Start auto apply
    btnStart.addEventListener('click', async () => {
        const config = {
            delay: parseInt(delayInput.value) * 1000,
            skipApplied: skipAppliedCheckbox.checked,
            autoScroll: autoScrollCheckbox.checked
        };

        setStatus('Starting...', true);
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        const response = await sendToContent('startAutoApply', { config });
        if (response && response.success) {
            setStatus('Running...', true);
        }
    });

    // Stop auto apply
    btnStop.addEventListener('click', async () => {
        setStatus('Stopping...', false);
        await sendToContent('stopAutoApply');
        setStatus('Stopped', false);
    });

    // Apply to current job only
    btnApplyCurrent.addEventListener('click', async () => {
        setStatus('Applying to current job...', false);
        const response = await sendToContent('applyCurrentJob');
        if (response && response.success) {
            setStatus('Applied!', false);
            updateStats({ applied: 1, skipped: 0, total: 1 });
        } else if (response && response.skipped) {
            setStatus('Already applied', false);
            updateStats({ applied: 0, skipped: 1, total: 1 });
        } else {
            setStatus('Could not apply', false);
        }
    });

    // Listen for updates from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'statsUpdate') {
            updateStats(message.stats);
        } else if (message.type === 'statusUpdate') {
            setStatus(message.status, message.isRunning);
        } else if (message.type === 'complete') {
            setStatus('Complete!', false);
            updateStats(message.stats);
        }
    });

    // Get initial stats
    const initialStats = await sendToContent('getStats');
    if (initialStats) {
        updateStats(initialStats);
    }
});
