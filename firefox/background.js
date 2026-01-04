// Background script for Instahyre Auto Apply Extension (Firefox Version)

// Listen for installation
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Instahyre Auto Apply extension installed!');

        // Set default settings
        browser.storage.local.set({
            delay: 2,
            skipApplied: true,
            autoScroll: true
        });
    }
});

// Handle messages between popup and content scripts if needed
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Forward messages if needed
    if (message.type === 'statsUpdate' || message.type === 'statusUpdate' || message.type === 'complete') {
        return;
    }
});
