const stadium = document.getElementById('stadium');
const nameDisp = document.getElementById('name');
const priceDisp = document.getElementById('price');

let isDragging = false;
let startX, startY;
let currRotateX = 55;
let currRotateZ = -20;
let currScale = 1;

document.querySelectorAll('.sector').forEach(s => {
    s.addEventListener('mouseenter', () => {
        nameDisp.innerText = s.getAttribute('data-n');
        priceDisp.innerHTML = s.getAttribute('data-p') + " <small>VND</small>";
        // Hiệu ứng chữ chạy khi hover
        nameDisp.style.letterSpacing = '2px';
        setTimeout(() => nameDisp.style.letterSpacing = '1px', 200);
    });
});

document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.side-panel')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    currRotateZ += deltaX * 0.5;
    currRotateX -= deltaY * 0.5;
    if (currRotateX < 20) currRotateX = 20;
    if (currRotateX > 85) currRotateX = 85;
    updateTransform();
    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener('mouseup', () => isDragging = false);

document.addEventListener('wheel', (e) => {
    if (e.target.closest('.side-panel')) return;
    e.preventDefault();
    const zoomSpeed = 0.05;
    currScale += (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
    currScale = Math.min(Math.max(0.5, currScale), 2);
    updateTransform();
}, { passive: false });

function updateTransform() {
    stadium.style.transform = `rotateX(${currRotateX}deg) rotateZ(${currRotateZ}deg) scale(${currScale})`;
}