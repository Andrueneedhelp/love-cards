import data from '../../data.json';

const slider = document.getElementById('slider');

data.forEach((item) => {
    const itemLi = document.createElement('li');
    itemLi.classList.add('item');
    itemLi.style.backgroundImage = `url(images/${item.image})`;
    itemLi.style.backgroundSize = 'cover';
    itemLi.innerHTML = `
        <div class="content">
            <h1 class="title">${item.title}</h1>
            <p class="description">${item.message}</p>
        </div>
    `;
    slider.appendChild(itemLi);
});

function nextCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        slider.append(items[0]);
    }
}

function prevCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        slider.prepend(items[items.length - 1]);
    }
}

// Handle click event on buttons
const prevBtn = document.querySelector('.nav .prev');
const nextBtn = document.querySelector('.nav .next');

prevBtn?.addEventListener('click', prevCard);
nextBtn?.addEventListener('click', nextCard);

// Handle keyboard event
document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    }
});

// Handle touch swipe gestures
let touchStartX = 0;
let touchEndX = 0;

slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 40;
    if (touchStartX - touchEndX > swipeThreshold) {
        nextCard();
    } else if (touchEndX - touchStartX > swipeThreshold) {
        prevCard();
    }
}, { passive: true });

