// 监听扩展安装或更新事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展已安装/更新');
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'downloadImage') {
    console.log('收到下载请求:', request.url);
    // 处理下载请求
    chrome.downloads.download({
      url: request.url,
      filename: request.filename
    });
  }
  return true;
}); 