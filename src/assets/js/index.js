import data from '../../data.json';

const slider = document.getElementById('slider');
const starField = document.getElementById('starField');
const cursorGlow = document.getElementById('cursor-glow');

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
    const star = document.createElement('div');
    const size = rand(1.5, 5.5);
    const colorTpl = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const opacityStart = rand(0.3, 0.7);
    const opacityPeak = rand(0.7, 1.0);
    const duration = rand(4, 10);
    const delay = rand(0, 8);
    const travel = rand(10, 40);
    const scaleEnd = rand(1.1, 1.8);
    const isSparkle = Math.random() > 0.75;

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
// Glowing cursor tracker
// ─────────────────────────────────────────────────────────────────────────────
if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let raf;
    let mouseX = -500, mouseY = -500;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!raf) {
            raf = requestAnimationFrame(moveCursor);
        }
    });

    function moveCursor() {
        cursorGlow.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
        raf = null;
    }

    // Change glow class based on what's being hovered
    document.addEventListener('mouseover', (e) => {
        cursorGlow.classList.remove('on-card', 'on-btn', 'on-kuromi');
        if (e.target.closest('.item')) {
            cursorGlow.classList.add('on-card');
        } else if (e.target.closest('.btn') || e.target.closest('.nav')) {
            cursorGlow.classList.add('on-btn');
        } else if (
            e.target.classList.contains('kuromi-left-decor') ||
            e.target.classList.contains('kuromi-chibi-decor') ||
            e.target.classList.contains('kuromi-right-decor') ||
            e.target.classList.contains('kuromi-right-small-decor') ||
            e.target.classList.contains('corner-image')
        ) {
            cursorGlow.classList.add('on-kuromi');
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile content panel (outside slider — avoids overflow:hidden clipping)
// ─────────────────────────────────────────────────────────────────────────────
const mobilePanel = document.createElement('div');
mobilePanel.id = 'mobile-content';
mobilePanel.setAttribute('aria-live', 'polite');
slider.insertAdjacentElement('afterend', mobilePanel);

function isMobile() {
    return window.matchMedia('(max-width: 649px)').matches;
}

function updateMobilePanel() {
    if (!isMobile()) {
        mobilePanel.style.display = 'none';
        return;
    }
    const items = slider.querySelectorAll('.item');
    if (items.length < 2) return;

    const activeItem = items[1];
    const title = activeItem.querySelector('.title')?.textContent ?? '';
    const desc = activeItem.querySelector('.description')?.textContent ?? '';

    mobilePanel.style.display = 'block';
    mobilePanel.innerHTML = `
        <div class="mobile-content-inner">
            <h1 class="title">${title}</h1>
            <p class="description">${desc}</p>
        </div>
    `;
    mobilePanel.classList.remove('animate-in');
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
    itemLi.style.backgroundSize = 'cover';
    itemLi.innerHTML = `
        <div class="content">
            <h1 class="title">${item.title}</h1>
            <p class="description">${item.message}</p>
        </div>
    `;
    slider.appendChild(itemLi);
});

// Fix initial ordering: move the last card to position 0 (nth-child 1 = "behind" card)
// so that nth-child(2) = data[0] is the first card shown as active.
// Sequence: [last, data0, data1, data2, ...] → visible as 1,2,3,4...
{
    const allItems = slider.querySelectorAll('.item');
    if (allItems.length > 1) {
        slider.prepend(allItems[allItems.length - 1]);
    }
}

// Initial mobile panel render
updateMobilePanel();

// ─────────────────────────────────────────────────────────────────────────────
// Navigation logic
// ─────────────────────────────────────────────────────────────────────────────
function triggerCardEnter(targetItem) {
    if (!targetItem) return;
    targetItem.classList.remove('card-enter');
    void targetItem.offsetWidth; // force reflow so animation restarts
    targetItem.classList.add('card-enter');
    // Remove class after animation so it doesn't interfere with CSS transitions
    targetItem.addEventListener('animationend', () => {
        targetItem.classList.remove('card-enter');
    }, { once: true });
}

function nextCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        const incoming = items[2]; // becomes nth-child(2) = new active
        // Temporarily disable transitions on the incoming card so it jumps
        // from peek-card size (200×300px) to full-screen instantly.
        // Without this, the clip-path bubble is invisible because the card
        // is also mid-transition from a tiny size to full size.
        if (incoming) incoming.classList.add('no-transition');
        slider.append(items[0]);
        void slider.offsetWidth; // force reflow to commit instant position
        if (incoming) incoming.classList.remove('no-transition');
        triggerCardEnter(incoming);
        updateMobilePanel();
    }
}

function prevCard() {
    const items = slider.querySelectorAll('.item');
    if (items.length > 0) {
        const toFront = items[items.length - 1]; // becomes nth-child(1) = new background
        // 'incoming' is the OLD background (items[0] = nth-child 1) which
        // becomes nth-child(2) = new active after the prepend.
        // Bug was: code was calling triggerCardEnter on 'toFront' which
        // ends up as nth-child(1) (background), not the newly active card.
        const incoming = items[0];
        // Also disable transitions on toFront — it's coming from the far
        // right side (left: calc(50% + 440px)) and would otherwise make a
        // long distracting slide into the background position.
        toFront.classList.add('no-transition');
        slider.prepend(toFront);
        void slider.offsetWidth;
        toFront.classList.remove('no-transition');
        triggerCardEnter(incoming); // bubble on the now-active card
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
    if (e.key === 'ArrowLeft') prevCard();
    else if (e.key === 'ArrowRight') nextCard();
});

// ─────────────────────────────────────────────────────────────────────────────
// Clickable side cards — clicking a side card navigates directly to it
// ─────────────────────────────────────────────────────────────────────────────
slider.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.item');
    if (!clickedItem) return;

    const items = Array.from(slider.querySelectorAll('.item'));
    const clickedIndex = items.indexOf(clickedItem);

    // Index 0 = background card (nth-child 1), Index 1 = active card (nth-child 2)
    // Only side cards (index 2+) are clickable for navigation
    if (clickedIndex <= 1) return;

    // Build the new DOM order directly:
    //   nth-child(1) = card just before clicked (becomes new background)
    //   nth-child(2) = clicked card (becomes new active)
    //   nth-child(3+) = remaining cards in their correct relative order
    const bgCard    = items[clickedIndex - 1];
    const afterSlot = items.slice(clickedIndex + 1);           // cards after clicked → new peek stack
    const beforeBg  = items.slice(0, clickedIndex - 1);       // cards before bg → cycle to end
    const newOrder  = [bgCard, clickedItem, ...afterSlot, ...beforeBg];

    // Step 1: Disable all transitions and float animations so cards jump
    //         instantly to their correct final positions with no visible movement.
    //         This prevents the "move left" bug caused by interrupting in-progress
    //         CSS transitions with a second DOM mutation.
    newOrder.forEach(item => item.classList.add('no-transition'));
    newOrder.forEach(item => slider.appendChild(item));

    // Step 2: Force a reflow so the browser commits the new positions
    //         while transitions are still disabled.
    void slider.offsetWidth;

    // Step 3: Re-enable transitions and float animations.
    newOrder.forEach(item => item.classList.remove('no-transition'));

    // Step 4: Play the bubble-enter animation on the newly active card.
    triggerCardEnter(clickedItem);
    updateMobilePanel();
});

// Touch swipe gestures
let touchStartX = 0;
let touchEndX = 0;

slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 40;
    if (touchStartX - touchEndX > threshold) nextCard();
    else if (touchEndX - touchStartX > threshold) prevCard();
}, { passive: true });

// Prevent native element dragging
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.classList.contains('item') || e.target.closest('#slider')) {
        e.preventDefault();
    }
});

// Re-evaluate on viewport resize
window.addEventListener('resize', updateMobilePanel);

// ─────────────────────────────────────────────────────────────────────────────
// INTRO OVERLAY — Gift box opening screen
// ─────────────────────────────────────────────────────────────────────────────
(function initIntro() {
    const overlay   = document.getElementById('intro-overlay');
    const gift      = document.getElementById('gift');
    const wrapper   = document.getElementById('giftWrapper');
    const burstRing = document.getElementById('burstRing');
    const introStars = document.getElementById('introStars');
    if (!overlay || !gift || !wrapper) return;

    // Generate floating star dots inside the intro overlay
    const INTRO_STAR_COLORS = [
        'rgba(255,127,191,VAL)', 'rgba(200,162,255,VAL)',
        'rgba(255,255,255,VAL)', 'rgba(253,230,138,VAL)',
    ];
    for (let i = 0; i < 40; i++) {
        const s = document.createElement('div');
        s.className = 'intro-star-dot';
        const sz      = rand(2, 6);
        const color   = INTRO_STAR_COLORS[Math.floor(Math.random() * INTRO_STAR_COLORS.length)];
        const opA     = rand(0.15, 0.45).toFixed(2);
        const opB     = rand(0.6, 1).toFixed(2);
        const dur     = rand(2.5, 7).toFixed(1);
        const delay   = rand(0, 5).toFixed(1);
        s.style.cssText = `
            width:${sz}px; height:${sz}px;
            left:${rand(1,99)}%; top:${rand(1,95)}%;
            background:${color.replace('VAL', opB)};
            --dur:${dur}s; --delay:${delay}s;
            --op-start:${opA}; --op-end:${opB};
            ${Math.random() > 0.6 ? `box-shadow:0 0 ${sz*2}px ${sz}px ${color.replace('VAL','0.5')};` : ''}
        `;
        introStars.appendChild(s);
    }

    let opened = false;

    function openGift() {
        if (opened) return;
        opened = true;

        // 1 — shake the gift
        gift.classList.add('shake');
        gift.addEventListener('animationend', () => {
            gift.classList.remove('shake');

            // 2 — burst sparkles
            burstRing?.classList.add('burst-active');

            // 3 — open the lid
            gift.classList.add('opening');

            // 4 — after a moment, fade out the overlay
            setTimeout(() => {
                overlay.classList.add('fade-out');
                overlay.addEventListener('transitionend', () => {
                    overlay.remove();
                    // Signal CSS to start love-section entrance animations
                    document.body.classList.add('intro-complete');
                    // Init the two new sections
                    initLoveSection();
                    initFlowerSection();
                }, { once: true });
            }, 600);
        }, { once: true });
    }

    wrapper.addEventListener('click', openGift);
    wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(); }
    });
})();

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC PLAYER — Spotify-inspired, romantic aesthetic
// Add your songs below. For each entry, set:
//   title  — displayed song title
//   artist — displayed artist name
//   art    — path relative to the /images/ folder (reuses card images)
//   src    — path to your audio file (e.g. "audio/song.mp3"), leave "" if none
// ─────────────────────────────────────────────────────────────────────────────
const SONGS = [
    { title: 'Your Geek in the Pink',     artist: 'Just for you 🤓',  art: 'images/image_05.jpg', src: '' },
    { title: 'Happy Girlfriends Day!',    artist: 'With love 💖',     art: 'images/image_00.jpg', src: '' },
    { title: 'Nayeon is Life',            artist: 'Always 💘',        art: 'images/image_01.jpg', src: '' },
    { title: 'Opensource is Love',        artist: 'Together 🤝',      art: 'images/image_02.jpg', src: '' },
    { title: 'Love Countdown',            artist: 'Forever ⏳',       art: 'images/image_03.jpg', src: '' },
    { title: "I'll Keep Building",        artist: 'For us 🛠️',       art: 'images/image_04.jpg', src: '' },
];

(function initPlayer() {
    if (!SONGS.length) return;

    const audioEl         = document.getElementById('audioEl');
    const playerEl        = document.getElementById('music-player');
    const artMini         = document.getElementById('playerArtMini');
    const artLarge        = document.getElementById('playerArtLarge');
    const titleMini       = document.getElementById('playerTitleMini');
    const artistMini      = document.getElementById('playerArtistMini');
    const titleFull       = document.getElementById('playerTitleFull');
    const artistFull      = document.getElementById('playerArtistFull');
    const playIconMini    = document.getElementById('playerPlayIcon');
    const playIconFull    = document.getElementById('playerPlayIconFull');
    const trackFill       = document.getElementById('playerTrackFill');
    const trackBar        = document.getElementById('playerTrack');
    const currentTimeEl   = document.getElementById('playerCurrentTime');
    const durationEl      = document.getElementById('playerDuration');
    const volumeSlider    = document.getElementById('playerVolume');
    const expandBtn       = document.getElementById('playerExpandBtn');
    if (!audioEl || !playerEl) return;

    let currentIndex = 0;
    let isPlaying    = false;
    let rafId        = null;

    // ── Helpers
    function formatTime(sec) {
        if (!isFinite(sec) || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function setArt(url) {
        const bg = url ? `url(${url})` : '';
        if (artMini)   { artMini.style.backgroundImage   = bg; artMini.style.backgroundSize = 'cover'; }
        if (artLarge)  { artLarge.style.backgroundImage  = bg; artLarge.style.backgroundSize = 'cover'; }
    }

    function setPlayState(playing) {
        isPlaying = playing;
        const icon = playing ? 'ri-pause-fill' : 'ri-play-fill';
        if (playIconMini) { playIconMini.className = icon; }
        if (playIconFull) { playIconFull.className = icon; }
        playerEl.classList.toggle('playing', playing);
    }

    function updateProgress() {
        if (!audioEl.duration) return;
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        if (trackFill) trackFill.style.width = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioEl.currentTime);
        if (durationEl)    durationEl.textContent    = formatTime(audioEl.duration);
        if (isPlaying) rafId = requestAnimationFrame(updateProgress);
    }

    function loadSong(index, autoPlay = false) {
        const song = SONGS[index];
        if (!song) return;
        currentIndex = index;

        // Update UI
        if (titleMini)   titleMini.textContent  = song.title;
        if (artistMini)  artistMini.textContent = song.artist;
        if (titleFull)   titleFull.textContent  = song.title;
        if (artistFull)  artistFull.textContent = song.artist;
        setArt(song.art);

        // Load audio if src provided
        if (song.src) {
            audioEl.src = song.src;
            audioEl.load();
            if (autoPlay) audioEl.play().then(() => setPlayState(true)).catch(() => setPlayState(false));
            else setPlayState(false);
        } else {
            // No audio file — reset UI to paused
            audioEl.removeAttribute('src');
            setPlayState(false);
            if (trackFill) trackFill.style.width = '0%';
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
            if (durationEl)    durationEl.textContent    = '0:00';
        }
    }

    function play() {
        if (!SONGS[currentIndex].src) return; // no audio file yet
        audioEl.play()
            .then(() => {
                setPlayState(true);
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(updateProgress);
            })
            .catch(() => setPlayState(false));
    }

    function pause() {
        audioEl.pause();
        setPlayState(false);
        cancelAnimationFrame(rafId);
    }

    function togglePlay() {
        if (isPlaying) pause(); else play();
    }

    // ── Wire up controls (both mini and full buttons share the same actions)
    document.getElementById('playerPlayMini')?.addEventListener('click', togglePlay);
    document.getElementById('playerPlayFull')?.addEventListener('click', togglePlay);

    document.getElementById('playerPrevMini')?.addEventListener('click', () => {
        loadSong((currentIndex - 1 + SONGS.length) % SONGS.length, isPlaying);
    });
    document.getElementById('playerNextMini')?.addEventListener('click', () => {
        loadSong((currentIndex + 1) % SONGS.length, isPlaying);
    });
    document.getElementById('playerPrevFull')?.addEventListener('click', () => {
        loadSong((currentIndex - 1 + SONGS.length) % SONGS.length, isPlaying);
    });
    document.getElementById('playerNextFull')?.addEventListener('click', () => {
        loadSong((currentIndex + 1) % SONGS.length, isPlaying);
    });

    // Progress bar seeking
    if (trackBar) {
        trackBar.addEventListener('click', (e) => {
            if (!audioEl.duration) return;
            const rect = trackBar.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audioEl.currentTime = ratio * audioEl.duration;
            if (trackFill) trackFill.style.width = `${ratio * 100}%`;
        });
    }

    // Volume
    if (volumeSlider) {
        audioEl.volume = parseFloat(volumeSlider.value);
        volumeSlider.addEventListener('input', () => {
            audioEl.volume = parseFloat(volumeSlider.value);
        });
    }

    // Auto-advance to next song
    audioEl.addEventListener('ended', () => {
        loadSong((currentIndex + 1) % SONGS.length, true);
    });

    // Sync duration display when metadata loaded
    audioEl.addEventListener('loadedmetadata', () => {
        if (durationEl) durationEl.textContent = formatTime(audioEl.duration);
    });

    // Expand / collapse
    if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playerEl.classList.toggle('expanded');
        });
    }

    // Load first song (no autoplay — respects browser autoplay policy)
    loadSong(0, false);
})();

// ─────────────────────────────────────────────────────────────────────────────
// LOVE LETTER SECTION — stars + falling petals
// Called once after the gift overlay fades out.
// ─────────────────────────────────────────────────────────────────────────────
function initLoveSection() {
    const lsStars  = document.getElementById('lsStars');
    const lsPetals = document.getElementById('lsPetals');

    // Floating star dots
    if (lsStars) {
        const colors = [
            'rgba(255,127,191,V)', 'rgba(200,162,255,V)',
            'rgba(255,255,255,V)', 'rgba(220,200,255,V)',
        ];
        for (let i = 0; i < 38; i++) {
            const s   = document.createElement('div');
            s.className = 'ls-star-dot';
            const sz  = rand(1.5, 4.5);
            const col = colors[Math.floor(Math.random() * colors.length)];
            const opA = rand(0.2, 0.5).toFixed(2);
            const opB = rand(0.65, 1.0).toFixed(2);
            const dur = rand(3, 9).toFixed(1);
            const del = rand(0, 6).toFixed(1);
            s.style.cssText = `
                width:${sz}px; height:${sz}px;
                left:${rand(1, 99)}%; top:${rand(1, 97)}%;
                background:${col.replace('V', opB)};
                --op-a:${opA}; --op-b:${opB};
                animation: lsStar ${dur}s ease-in-out ${del}s infinite alternate;
                ${Math.random() > 0.65 ? `box-shadow:0 0 ${(sz*2).toFixed(1)}px ${sz}px ${col.replace('V','0.5')};` : ''}
            `;
            lsStars.appendChild(s);
        }
    }

    // Falling petals
    if (lsPetals) {
        const petalColors = [
            'rgba(255,127,191,0.75)',
            'rgba(255,183,197,0.65)',
            'rgba(200,162,255,0.65)',
            'rgba(255,210,235,0.70)',
        ];
        for (let i = 0; i < 16; i++) {
            const p   = document.createElement('div');
            p.className = 'ls-petal';
            const sz  = rand(8, 18).toFixed(0);
            const col = petalColors[Math.floor(Math.random() * petalColors.length)];
            const dur = rand(7, 15).toFixed(1);
            const del = rand(0, 11).toFixed(1);
            p.style.cssText = `
                left:${rand(0, 100)}%;
                --sz:${sz}px; --pc:${col}; --pd:${dur}s; --delay:${del}s;
            `;
            lsPetals.appendChild(p);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOWER FINALE SECTION — stars, hearts, sparkles, scroll-reveal
// Called once after the gift overlay fades out.
// ─────────────────────────────────────────────────────────────────────────────
function initFlowerSection() {
    const fsStars    = document.getElementById('fsStars');
    const fsHearts   = document.getElementById('fsHearts');
    const fsSparkles = document.getElementById('fsSparkles');

    // Ambient star dots
    if (fsStars) {
        for (let i = 0; i < 30; i++) {
            const s  = document.createElement('div');
            s.className = 'fs-star-dot';
            const sz = rand(1.5, 4);
            const op = rand(0.3, 0.85).toFixed(2);
            const dur = rand(3, 7).toFixed(1);
            const del = rand(0, 4).toFixed(1);
            s.style.cssText = `
                width:${sz}px; height:${sz}px;
                left:${rand(0, 100)}%; top:${rand(0, 100)}%;
                background:rgba(255,220,180,${op});
                animation: fsStar ${dur}s ease-in-out ${del}s infinite alternate;
            `;
            fsStars.appendChild(s);
        }
    }

    // Floating hearts
    if (fsHearts) {
        const heartEmojis = ['💗', '💕', '💓', '💖', '🩷', '❤️'];
        for (let i = 0; i < 14; i++) {
            const h = document.createElement('span');
            h.className = 'fs-heart';
            h.setAttribute('aria-hidden', 'true');
            h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            const hs  = rand(0.7, 1.8).toFixed(1);
            const hd  = rand(5, 13).toFixed(1);
            const del = rand(0, 7).toFixed(1);
            h.style.cssText = `left:${rand(3, 92)}%; --hs:${hs}rem; --hd:${hd}s; --delay:${del}s;`;
            fsHearts.appendChild(h);
        }
    }

    // Sparkle dots
    if (fsSparkles) {
        for (let i = 0; i < 22; i++) {
            const s  = document.createElement('div');
            s.className = 'fs-sparkle';
            const sz  = rand(2, 6).toFixed(1);
            const sd  = rand(2, 5).toFixed(1);
            const del = rand(0, 4.5).toFixed(1);
            s.style.cssText = `
                left:${rand(0, 100)}%; top:${rand(5, 95)}%;
                --sz:${sz}px; --sd:${sd}s; --delay:${del}s;
            `;
            fsSparkles.appendChild(s);
        }
    }

    // IntersectionObserver: reveal .reveal-item children on scroll into view
    const flowerSection = document.getElementById('flower-section');
    if (!flowerSection || !('IntersectionObserver' in window)) {
        // Fallback: just show everything immediately
        document.querySelectorAll('#flower-section .reveal-item').forEach(el => {
            el.classList.add('revealed');
        });
        return;
    }

    const revealItems = flowerSection.querySelectorAll('.reveal-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // once revealed, no need to watch
            }
        });
    }, { threshold: 0.15, root: null });

    revealItems.forEach(item => observer.observe(item));
}
