// Background service worker for Instahyre Auto Apply Extension

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Instahyre Auto Apply extension installed!');

        // Set default settings
        chrome.storage.local.set({
            delay: 2,
            skipApplied: true,
            autoScroll: true
        });
    }
});

// Handle messages between popup and content scripts if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Forward messages if needed
    if (message.type === 'statsUpdate' || message.type === 'statusUpdate' || message.type === 'complete') {
        // These are meant for the popup, which listens directly
        return;
    }
});

// Optional: Add context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'auto-apply-menu',
        title: 'Instahyre Auto Apply',
        contexts: ['page'],
        documentUrlPatterns: ['https://instahyre.com/*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'auto-apply-menu') {
        // Open extension popup
        chrome.action.openPopup();
    }
});
