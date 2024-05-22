document.getElementById('import-btn').addEventListener('change', handleFiles);

let scale = 1;
const MAX_SCALE = 3;
const MIN_SCALE = 0.5;

function handleFiles(event) {
    const files = event.target.files;
    const imageContainer = document.getElementById('images');
    imageContainer.innerHTML = ''; // 清空以前的图片

    const isLandscape = window.innerWidth > window.innerHeight;
    const fileCount = Math.min(files.length, 4);
    
    const layoutStyles = calculateLayoutStyles(isLandscape, fileCount);
    
    for (let i = 0; i < fileCount; i++) {
        const file = files[i];
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');
        Object.assign(imgContainer.style, layoutStyles);

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        imgContainer.appendChild(img);
        
        imageContainer.appendChild(imgContainer);
        
        imgContainer.addEventListener('wheel', (event) => zoomImage(event, img));
    }
}

function calculateLayoutStyles(isLandscape, fileCount) {
    const styles = { width: '100%', height: '100%' };

    if (fileCount === 1) {
        styles.width = '100%';
        styles.height = '100%';
    } else if (fileCount === 2) {
        if (isLandscape) {
            styles.width = '50%';
            styles.height = '100%';
        } else {
            styles.width = '100%';
            styles.height = '50%';
        }
    } else if (fileCount === 3) {
        if (isLandscape) {
            styles.width = '33.33%';
            styles.height = '100%';
        } else {
            styles.width = '100%';
            styles.height = '33.33%';
        }
    } else if (fileCount === 4) {
        styles.width = '50%';
        styles.height = '50%';
    }
    return styles;
}

function zoomImage(event, img) {
    event.preventDefault();

    if (event.deltaY < 0) {
        scale *= 1.1;
        if (scale > MAX_SCALE) scale = MAX_SCALE;
    } else {
        scale /= 1.1;
        if (scale < MIN_SCALE) scale = MIN_SCALE;
    }

    const rect = img.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    img.style.transformOrigin = `${offsetX * 100}% ${offsetY * 100}%`;
    img.style.transform = `scale(${scale})`;

    // 同步其他图片缩放
    const images = document.querySelectorAll('.image-container img');
    images.forEach(otherImg => {
        if (otherImg !== img) {
            otherImg.style.transformOrigin = `${offsetX * 100}% ${offsetY * 100}%`;
            otherImg.style.transform = `scale(${scale})`;
        }
    });
}
