// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initButtons();
  initSettings();
});

// Helper: Add tab to "demo" group
async function addTabToDemoGroup(tabId) {
  try {
    // Find existing "demo" group in current window
    const groups = await chrome.tabGroups.query({ title: 'demo', windowId: chrome.windows.WINDOW_ID_CURRENT });

    if (groups.length > 0) {
      // Add to existing group
      await chrome.tabs.group({ tabIds: tabId, groupId: groups[0].id });
    } else {
      // Create new group
      const groupId = await chrome.tabs.group({ tabIds: tabId });
      await chrome.tabGroups.update(groupId, { title: 'demo', color: 'blue' });
    }
  } catch (error) {
    console.error('Failed to add tab to group:', error);
  }
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;

      // Update button states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update panel visibility
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetTab) {
          panel.classList.add('active');
        }
      });

      // Save active tab if setting enabled
      const rememberTab = document.getElementById('setting-remembertab');
      if (rememberTab && rememberTab.checked) {
        chrome.storage.local.set({ activeTab: targetTab });
      }
    });
  });

  // Restore last active tab
  chrome.storage.local.get(['activeTab'], (result) => {
    if (result.activeTab) {
      const targetButton = document.querySelector(`[data-tab="${result.activeTab}"]`);
      if (targetButton) {
        targetButton.click();
      }
    }
  });
}

function initButtons() {
  console.log('initButtons called');

  // Button 1: Open team.arcblock.io
  const btnTeam = document.getElementById('btn-team');
  console.log('btn-team element:', btnTeam);

  if (!btnTeam) {
    console.error('btn-team not found!');
    return;
  }

  btnTeam.addEventListener('click', () => {
    console.log('Team button clicked!');
    const teamUrl = 'https://team.arcblock.io';

    // Query tabs with URL pattern (current window only)
    chrome.tabs.query({ url: 'https://team.arcblock.io/*', currentWindow: true }, (tabs) => {
      console.log('Query result:', tabs);
      if (chrome.runtime.lastError) {
        console.error('Query error:', chrome.runtime.lastError);
      }

      if (tabs && tabs.length > 0) {
        // Try to switch to existing tab
        console.log('Switching to existing tab:', tabs[0].id);
        chrome.tabs.update(tabs[0].id, { active: true }, (updatedTab) => {
          if (chrome.runtime.lastError) {
            // Tab doesn't exist anymore, create new one
            console.log('Tab switch failed, creating new:', chrome.runtime.lastError);
            chrome.tabs.create({ url: teamUrl }, (tab) => {
              if (tab) addTabToDemoGroup(tab.id);
            });
          } else {
            chrome.windows.update(tabs[0].windowId, { focused: true });
          }
        });
      } else {
        // Create new tab and add to demo group
        console.log('Creating new tab...');
        chrome.tabs.create({ url: teamUrl }, (tab) => {
          console.log('Tab created:', tab);
          if (chrome.runtime.lastError) {
            console.error('Create error:', chrome.runtime.lastError);
          } else if (tab) {
            addTabToDemoGroup(tab.id);
          }
        });
      }
    });
  });

  // Button 2: Open internal demo page
  const btnInternal = document.getElementById('btn-internal');
  console.log('btn-internal element:', btnInternal);

  btnInternal.addEventListener('click', async () => {
    console.log('Internal button clicked!');
    const internalUrl = chrome.runtime.getURL('internal-page.html');

    try {
      // Query for extension pages (current window only)
      const tabs = await chrome.tabs.query({ url: internalUrl, currentWindow: true });

      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        const tab = await chrome.tabs.create({ url: internalUrl });
        if (tab) await addTabToDemoGroup(tab.id);
      }
    } catch (error) {
      console.log('Opening new tab:', error);
      const tab = await chrome.tabs.create({ url: internalUrl });
      if (tab) await addTabToDemoGroup(tab.id);
    }
  });

  // Button 3: Show current tab info
  const btnPageinfo = document.getElementById('btn-pageinfo');
  console.log('btn-pageinfo element:', btnPageinfo);

  btnPageinfo.addEventListener('click', async () => {
    console.log('Pageinfo button clicked!');
    const pageInfoDiv = document.getElementById('page-info');
    const contentDiv = document.getElementById('page-info-content');

    pageInfoDiv.classList.remove('hidden');
    contentDiv.innerHTML = '<div class="loading">Loading page info</div>';

    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        contentDiv.innerHTML = '<div class="error">No active tab found</div>';
        return;
      }

      // Capture screenshot
      let screenshotUrl = null;
      try {
        screenshotUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      } catch (screenshotError) {
        console.log('Screenshot failed:', screenshotError);
      }

      // Check if we can inject script (not on chrome:// pages)
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        contentDiv.innerHTML = renderBasicTabInfo(tab, screenshotUrl);
        return;
      }

      // Inject content script and get page info
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractPageInfo
        });

        if (results && results[0] && results[0].result) {
          contentDiv.innerHTML = renderPageInfo(tab, results[0].result, screenshotUrl);
        } else {
          contentDiv.innerHTML = renderBasicTabInfo(tab, screenshotUrl);
        }
      } catch (scriptError) {
        // If script injection fails, show basic info
        contentDiv.innerHTML = renderBasicTabInfo(tab, screenshotUrl);
      }
    } catch (error) {
      contentDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  });
}

// Function to be injected into the page
function extractPageInfo() {
  const meta = {};

  // Get all meta tags
  document.querySelectorAll('meta').forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (name && content) {
      meta[name] = content;
    }
  });

  // Get basic page stats
  const stats = {
    links: document.querySelectorAll('a').length,
    images: document.querySelectorAll('img').length,
    scripts: document.querySelectorAll('script').length,
    stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
    forms: document.querySelectorAll('form').length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    headings: {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length
    }
  };

  // Get document info
  const docInfo = {
    title: document.title,
    charset: document.characterSet,
    doctype: document.doctype ? document.doctype.name : 'none',
    language: document.documentElement.lang || 'not specified',
    contentLength: document.body.innerText.length
  };

  return { meta, stats, docInfo };
}

function renderBasicTabInfo(tab, screenshotUrl) {
  let html = '';

  // Add screenshot if available
  if (screenshotUrl) {
    html += `
      <div class="info-item screenshot-container">
        <span class="info-label">Screenshot</span>
        <img src="${screenshotUrl}" class="screenshot" alt="Page screenshot">
      </div>
    `;
  }

  html += `
    <div class="info-item">
      <span class="info-label">Title</span>
      <span class="info-value">${tab.title || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">URL</span>
      <span class="info-value url">${tab.url || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Status</span>
      <span class="info-value">${tab.status || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Note</span>
      <span class="info-value">Detailed info not available for this page type</span>
    </div>
  `;

  return html;
}

function renderPageInfo(tab, info, screenshotUrl) {
  const { meta, stats, docInfo } = info;

  let html = '';

  // Add screenshot if available
  if (screenshotUrl) {
    html += `
      <div class="info-item screenshot-container">
        <span class="info-label">Screenshot</span>
        <img src="${screenshotUrl}" class="screenshot" alt="Page screenshot">
      </div>
    `;
  }

  html += `
    <div class="info-item">
      <span class="info-label">Title</span>
      <span class="info-value">${docInfo.title || tab.title || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">URL</span>
      <span class="info-value url">${tab.url || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Language</span>
      <span class="info-value">${docInfo.language}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Character Set</span>
      <span class="info-value">${docInfo.charset}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Content Length</span>
      <span class="info-value">${docInfo.contentLength.toLocaleString()} characters</span>
    </div>
  `;

  // Add meta info
  if (meta.description) {
    html += `
      <div class="info-item">
        <span class="info-label">Description</span>
        <span class="info-value">${meta.description}</span>
      </div>
    `;
  }

  if (meta.keywords) {
    html += `
      <div class="info-item">
        <span class="info-label">Keywords</span>
        <span class="info-value">${meta.keywords}</span>
      </div>
    `;
  }

  if (meta.author) {
    html += `
      <div class="info-item">
        <span class="info-label">Author</span>
        <span class="info-value">${meta.author}</span>
      </div>
    `;
  }

  // Add page statistics
  html += `
    <div class="info-item">
      <span class="info-label">Page Statistics</span>
      <span class="info-value">
        Links: ${stats.links} | Images: ${stats.images} | Scripts: ${stats.scripts}<br>
        Forms: ${stats.forms} | Buttons: ${stats.buttons} | Inputs: ${stats.inputs}<br>
        Headings: H1(${stats.headings.h1}) H2(${stats.headings.h2}) H3(${stats.headings.h3})
      </span>
    </div>
  `;

  return html;
}

function initSettings() {
  // Load saved settings
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};

    Object.keys(settings).forEach(key => {
      const element = document.getElementById(`setting-${key}`);
      if (element) {
        element.checked = settings[key];
      }
    });
  });

  // Save settings on change
  const toggles = document.querySelectorAll('.toggle input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      saveSettings();
    });
  });
}

function saveSettings() {
  const settings = {};
  const toggles = document.querySelectorAll('.toggle input');

  toggles.forEach(toggle => {
    const key = toggle.id.replace('setting-', '');
    settings[key] = toggle.checked;
  });

  chrome.storage.local.set({ settings });
}
