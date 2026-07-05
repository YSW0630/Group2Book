const groupList = document.getElementById("groupList");

function getGroupTitle(group) {
  return group.title || "Unnamed Group";
}

async function exportGroupToBookmarks(group) {
  const tabs = await chrome.tabs.query({
    groupId: group.id
  });

  const folder = await chrome.bookmarks.create({
    title: getGroupTitle(group)
  });

  for (const tab of tabs) {
    if (!tab.url) continue;

    await chrome.bookmarks.create({
      parentId: folder.id,
      title: tab.title || tab.url,
      url: tab.url
    });
  }
}

async function loadGroups() {
  const groups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT
  });

  groupList.innerHTML = "";

  if (groups.length === 0) {
    groupList.textContent = "No tab groups in current window.";
    return;
  }

  for (const group of groups) {
    const item = document.createElement("div");
    item.className = "group-item";

    const title = document.createElement("span");
    title.className = "group-title";
    title.textContent = getGroupTitle(group);

    const button = document.createElement("button");
    button.textContent = "Export";

    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Exporting...";

      try {
        await exportGroupToBookmarks(group);
        button.textContent = "Done";
      } catch (error) {
        console.error(error);
        button.disabled = false;
        button.textContent = "Retry";
      }
    });

    item.appendChild(title);
    item.appendChild(button);
    groupList.appendChild(item);
  }
}

loadGroups();