document.getElementById('downloadBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = '正在处理...';

  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 向content script发送消息
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'downloadImage' });
    
    if (response.success) {
      statusDiv.textContent = '下载成功！';
      // 使用chrome.downloads API下载图片
      chrome.downloads.download({
        url: response.imageUrl,
        filename: response.filename || 'image.jpg',
        saveAs: true
      });
    } else {
      statusDiv.textContent = '未找到可下载的图片';
    }
  } catch (error) {
    statusDiv.textContent = '发生错误：' + error.message;
  }
}); 