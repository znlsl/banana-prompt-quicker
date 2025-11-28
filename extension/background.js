chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'banana-prompt',
        title: 'Insert 🍌 Prompts',
        contexts: ['editable']
    })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'banana-prompt') {
        chrome.tabs.sendMessage(tab.id, { action: 'openModal' })
    }
})
