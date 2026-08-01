import data from '../../data.json';

const slider   = document.getElementById('slider');
const starField = document.getElementById('starField');
const main     = document.querySelector('main');

// ─────────────────────────────────────────────────────────────────────────────
// Floating star particle generation (Kuromi night-sky effect)
// ─────────────────────────────────────────────────────────────────────────────
const STAR_COUNT = 55;
const STAR_COLORS = [
    'rgba(255, 255, 255, VAL)',
    'rgba(200, 162, 255, VAL)',
    'rgba(255, 127, 191, VAL)',
    'rgba(220, 200, 255, VAL)',
    'rgba(255, 210, 235, VAL)',
];

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

for (let i = 0; i < STAR_COUNT; i++) {
    const star        = document.createElement('div');
    const size        = rand(1.5, 5.5);
    const colorTpl    = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const opacityStart = rand(0.3, 0.7);
    const opacityPeak  = rand(0.7, 1.0);
    const duration    = rand(4, 10);
    const delay       = rand(0, 8);
    const travel      = rand(10, 40);
    const scaleEnd    = rand(1.1, 1.8);
    const isSparkle   = Math.random() > 0.75;

    star.classList.add('star');
    star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${rand(1, 99)}%;
        top: ${rand(1, 95)}%;
        background: ${colorTpl.replace('VAL', opacityPeak.toFixed(2))};
        --duration: ${duration.toFixed(1)}s;
        --delay: ${delay.toFixed(1)}s;
        --opacity-start: ${opacityStart.toFixed(2)};
        --opacity-peak: ${opacityPeak.toFixed(2)};
        --travel: -${travel.toFixed(0)}px;
        --scale-end: ${scaleEnd.toFixed(2)};
        ${isSparkle ? `box-shadow: 0 0 ${(size * 2).toFixed(1)}px ${size.toFixed(1)}px ${colorTpl.replace('VAL', '0.6')};` : ''}
        animation: starFloat ${duration.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite alternate;
    `;
    starField.appendChild(star);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile content panel (outside slider — avoids overflow:hidden clipping)
// ─────────────────────────────────────────────────────────────────────────────
const mobilePanel = document.createElement('div');
mobilePanel.id = 'mobile-content';
mobilePanel.setAttribute('aria-live', 'polite');
// Insert the panel right after the slider in the DOM
slider.insertAdjacentElement('afterend', mobilePanel);

function isMobile() {
    return window.matchMedia('(max-width: 649px)').matches;
}

function updateMobilePanel() {
    if (!isMobile()) {
        mobilePanel.style.display = 'none';
        return;
    }
    // The active card is always the 2nd item in the slider (index 1)
    const items = slider.querySelectorAll('.item');
    if (items.length < 2) return;

    const activeItem = items[1]; // nth-child(2) in CSS = index 1 in NodeList
    const title  = activeItem.querySelector('.title')?.textContent  ?? '';
    const desc   = activeItem.querySelector('.description')?.textContent ?? '';

    mobilePanel.style.display = 'block';
    mobilePanel.innerHTML = `
        <div class="mobile-content-inner">
            <h1 class="title">${title}</h1>
            <p class="description">${desc}</p>
        </div>
    `;
    // Trigger entrance animation by toggling class
    mobilePanel.classList.remove('animate-in');
    // Force a reflow to restart animation
    void mobilePanel.offsetWidth;
    mobilePanel.classList.add('animate-in');
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the card list
// ─────────────────────────────────────────────────────────────────────────────
data.forEach((item) => {
    const itemLi = document.createElement('li');
    itemLi.classList.add('item');
    itemLi.style.backgroundImage = `url(images/${item.image})`;
    itemLi.style.backgroundSize  = 'cover';
    itemLi.innerHTML = `
        <div class="content">
            <h1 class="title">${item.title}</h1>
            <p class="description">${item.message}</p>
        </div>
    `;
    slider.appendChild(itemLi);
});

// Initial mobile panel render
updateMobilePanel();

// ─────────────────────────────────────────────────────────────────────────────
// Navigation logic
// ─────────────────────────────────────────────────────────────────────────────
function nextCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        slider.append(items[0]);
        updateMobilePanel();
    }
}

function prevCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        slider.prepend(items[items.length - 1]);
        updateMobilePanel();
    }
}

// Button click
const prevBtn = document.querySelector('.nav .prev');
const nextBtn = document.querySelector('.nav .next');
prevBtn?.addEventListener('click', prevCard);
nextBtn?.addEventListener('click', nextCard);

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowLeft')       prevCard();
    else if (e.key === 'ArrowRight') nextCard();
});

// Touch swipe gestures
let touchStartX = 0;
let touchEndX   = 0;

slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 40;
    if (touchStartX - touchEndX > threshold)       nextCard();
    else if (touchEndX - touchStartX > threshold)  prevCard();
}, { passive: true });

// Re-evaluate on viewport resize (e.g. rotating device)
window.addEventListener('resize', updateMobilePanel);
