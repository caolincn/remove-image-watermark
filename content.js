// 创建下载按钮
function createDownloadButton() {
  const button = document.createElement('div');
  button.className = 'mweb-button-tertiary mwebButton-LL2WCB operationBtnItem-TdSw0y download-btn';
  
  // 使用img标签替代SVG
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('images/icon48.png');
  img.width = 20;
  img.height = 20;
  button.appendChild(img);
  
  button.title = '无水印下载';
  return button;
}

// 获取图片URL
function getImageUrl() {
  console.log('开始查找图片元素...');
  
  // 首先找到topActionBar元素
  const topActionBar = document.querySelector('div[class^="topActionBar-"]');
  if (!topActionBar) {
    console.log('未找到topActionBar');
    return null;
  }

  // 获取topActionBar的父元素
  const parentElement = topActionBar.parentElement;
  if (!parentElement) {
    console.log('未找到topActionBar的父元素');
    return null;
  }

  // 遍历父元素的子元素，找到topActionBar的下一个兄弟元素
  let nextElement = topActionBar.nextElementSibling;
  if (!nextElement) {
    console.log('未找到topActionBar的下一个元素');
    return null;
  }

  // 在这个元素中查找img标签
  const imgElement = nextElement.querySelector('img');
  if (imgElement && imgElement.src) {
    console.log('找到图片元素:', {
      src: imgElement.src,
      className: imgElement.className,
      width: imgElement.width,
      height: imgElement.height,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      attributes: Array.from(imgElement.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')
    });
    return imgElement.src;
  }

  console.log('未找到合适的图片');
  return null;
}

// 下载图片函数
async function downloadImage(imageUrl) {
  console.log('准备下载图片:', imageUrl);
  if (!imageUrl) {
    alert('无效的图片URL');
    return;
  }

  try {
    // 获取图片数据
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // 创建一个 Image 对象来加载图片
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // 等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
    
    // 创建 canvas 并绘制图片
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // 将 canvas 转换为 PNG blob
    const pngBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    // 创建下载链接
    const url = URL.createObjectURL(pngBlob);
    const link = document.createElement('a');
    
    // 设置文件名
    const now = new Date();
    const dateStr = now.toISOString()
      .slice(0, 19)
      .replace('T', '_')
      .replace(/:/g, '-');
    link.download = `RWater_${dateStr}.png`;
    
    // 设置链接并触发下载
    link.href = url;
    document.body.appendChild(link);
    link.click();
    
    // 清理资源
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    URL.revokeObjectURL(img.src);
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载失败，请重试');
  }
}

// 添加下载按钮到页面
function addDownloadButton() {
  // 使用部分类名查找操作栏
  const topActionBar = document.querySelector('div[class^="topActionBar-"]');
  if (!topActionBar) {
    console.log('未找到操作栏');
    return;
  }
  
  // 检查是否已经添加过下载按钮
  if (topActionBar.querySelector('.download-btn')) {
    console.log('下载按钮已存在');
    return;
  }
  
  console.log('添加下载按钮');
  const downloadBtn = createDownloadButton();
  const firstButton = topActionBar.querySelector('.mweb-button-tertiary');
  if (firstButton) {
    topActionBar.insertBefore(downloadBtn, firstButton);
  } else {
    topActionBar.appendChild(downloadBtn);
  }
  
  // 添加点击事件
  downloadBtn.addEventListener('click', () => {
    console.log('点击下载按钮');
    const imageUrl = getImageUrl();
    console.log('获取到的图片URL:', imageUrl);
    
    if (imageUrl) {
      downloadBtn.style.opacity = '0.5';
      downloadBtn.style.pointerEvents = 'none';
      try {
        downloadImage(imageUrl);
      } finally {
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
      }
    } else {
      console.error('未找到图片元素');
      alert('未找到可下载的图片');
    }
  });
}

// 监听页面变化
const observer = new MutationObserver(() => {
  addDownloadButton();
});

// 开始观察页面变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 初始化时添加按钮
console.log('初始化插件');
addDownloadButton(); 