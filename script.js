document.getElementById('import-btn').addEventListener('change', handleFiles);

// 全局状态
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTranslateX = 0;
let dragStartTranslateY = 0;

const MAX_SCALE = 5;
const MIN_SCALE = 0.2;
const SCALE_STEP = 1.1;

let imageContainers = [];
let images = [];

function handleFiles(event) {
    const files = event.target.files;
    const imageContainer = document.getElementById('images');
    imageContainer.innerHTML = '';
    
    // 限制最多4张图片
    const fileCount = Math.min(files.length, 4);
    
    if (fileCount < 2) {
        alert('请至少选择 2 张图片进行对比');
        return;
    }
    
    // 重置状态
    scale = 1;
    translateX = 0;
    translateY = 0;
    imageContainers = [];
    images = [];
    
    // 计算布局
    const isLandscape = window.innerWidth > window.innerHeight;
    imageContainer.className = 'images-container';
    imageContainer.classList.add(`layout-${fileCount}`);
    if (!isLandscape && (fileCount === 2 || fileCount === 3)) {
        imageContainer.classList.add('portrait');
    }
    
    // 创建图片容器
    for (let i = 0; i < fileCount; i++) {
        const file = files[i];
        const container = document.createElement('div');
        container.classList.add('image-container');
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = function() {
            updateImageTransform();
        };
        
        container.appendChild(img);
        imageContainer.appendChild(container);
        
        imageContainers.push(container);
        images.push(img);
        
        // 添加事件监听
        container.addEventListener('wheel', handleWheel);
        container.addEventListener('mousedown', handleMouseDown);
    }
    
    // 全局事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
}

function handleWheel(event) {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 1 / SCALE_STEP : SCALE_STEP;
    const newScale = scale * delta;
    
    if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        // 使用触发事件的容器来计算鼠标位置（确保每个容器都能正确计算）
        const container = event.currentTarget;
        const rect = container.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;
        
        // 计算鼠标相对于容器中心的位置
        const mouseX = event.clientX - containerCenterX;
        const mouseY = event.clientY - containerCenterY;
        
        // 计算缩放前后的鼠标位置（考虑当前的平移）
        // 在缩放前，鼠标指向的图片点在图片坐标系中的位置
        const beforeScaleX = (mouseX - translateX) / scale;
        const beforeScaleY = (mouseY - translateY) / scale;
        
        // 应用新缩放
        scale = newScale;
        
        // 计算新的平移量，使鼠标位置下的图片点保持不变
        // 缩放后，该点在容器坐标系中的新位置
        translateX = mouseX - beforeScaleX * scale;
        translateY = mouseY - beforeScaleY * scale;
        
        updateImageTransform();
    }
}

function handleMouseDown(event) {
    if (event.button !== 0) return; // 只处理左键
    
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartTranslateX = translateX;
    dragStartTranslateY = translateY;
    
    event.currentTarget.classList.add('dragging');
    event.preventDefault();
}

function handleMouseMove(event) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    
    translateX = dragStartTranslateX + deltaX;
    translateY = dragStartTranslateY + deltaY;
    
    updateImageTransform();
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        document.querySelectorAll('.image-container').forEach(container => {
            container.classList.remove('dragging');
        });
    }
}

function handleResize() {
    // 窗口大小改变时，重新计算布局
    const fileCount = imageContainers.length;
    if (fileCount === 0) return;
    
    const imageContainer = document.getElementById('images');
    const isLandscape = window.innerWidth > window.innerHeight;
    
    imageContainer.className = 'images-container';
    imageContainer.classList.add(`layout-${fileCount}`);
    if (!isLandscape && (fileCount === 2 || fileCount === 3)) {
        imageContainer.classList.add('portrait');
    }
}

function updateImageTransform() {
    // 应用相同的变换到所有图片
    images.forEach(img => {
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        img.style.transformOrigin = 'center center';
    });
}
