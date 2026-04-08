// ==========================================
// 1. EDIT YOUR VIDEO DESCRIPTIONS HERE
// ==========================================
const videoDetails = [
    { title: "The Smoked Old Fashioned", text: "A dramatic take on a timeless classic. Bourbon infused with cherry wood smoke, featuring notes of orange peel and Angostura bitters." },
    { title: "Neon Margarita", text: "A vibrant, electric twist on the traditional margarita. Blanco tequila, fresh lime, and a secret glowing blue curaçao float." },
    { title: "Velvet Espresso Martini", text: "The perfect pick-me-up. Freshly pulled espresso shaken vigorously with premium vodka and coffee liqueur for a frothy finish." },
    { title: "Dragonfruit Mojito", text: "A tropical escape. Muddled fresh mint, lime, white rum, and exotic pink dragonfruit puree, topped with sparkling water." },
    { title: "The Alchemist's Gin", text: "A color-changing botanical experience. Empress gin hits citrus, shifting from deep indigo to a vibrant magenta right before your eyes." }
];

const centerPanel = document.getElementById('video-container');
const titleElement = document.getElementById('dynamic-title');
const textElement = document.getElementById('dynamic-text');

const profilePicDesktop = document.querySelector('.left-panel .profile-pic');
const profilePicMobile = document.querySelector('.mobile-header .mobile-profile-pic');
const modalPrevBtn = document.querySelector('.prev-modal');
const modalNextBtn = document.querySelector('.next-modal');

// ==========================================
// 2. THE SEAMLESS INFINITE LOOP (CLONING)
// ==========================================
let originalWrappers = document.querySelectorAll('.video-wrapper');

if (originalWrappers.length > 1) {
    const firstClone = originalWrappers[0].cloneNode(true);
    const lastClone = originalWrappers[originalWrappers.length - 1].cloneNode(true);

    centerPanel.appendChild(firstClone);
    centerPanel.insertBefore(lastClone, originalWrappers[0]);

    centerPanel.scrollTop = centerPanel.clientHeight;
}

const allVideoWrappers = document.querySelectorAll('.video-wrapper');

// ==========================================
// 3. THE SILENT JUMP SCROLL LISTENER
// ==========================================
let isResizing = false;
centerPanel.style.scrollSnapType = 'y mandatory';

centerPanel.addEventListener('scroll', () => {
    if (isResizing) return;
    
    const itemHeight = centerPanel.clientHeight;
    const maxScroll = centerPanel.scrollHeight - itemHeight;

    if (centerPanel.scrollTop === 0) {
        centerPanel.style.scrollSnapType = 'none';
        centerPanel.scrollTop = maxScroll - itemHeight; 
        requestAnimationFrame(() => { centerPanel.style.scrollSnapType = 'y mandatory'; });
    }
    else if (centerPanel.scrollTop >= maxScroll - 2) { 
        centerPanel.style.scrollSnapType = 'none';
        centerPanel.scrollTop = itemHeight; 
        requestAnimationFrame(() => { centerPanel.style.scrollSnapType = 'y mandatory'; });
    }
});

// ==========================================
// 4. TIKTOK SOUND LOGIC & VIDEO CLICKS
// ==========================================
let globalMuted = true;
const mutedIcon = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
const unmutedIcon = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

allVideoWrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const soundBtn = wrapper.querySelector('.sound-btn');
    
    if(soundBtn) soundBtn.innerHTML = mutedIcon;

    if(soundBtn) {
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            globalMuted = !globalMuted;
            document.querySelectorAll('video').forEach(v => v.muted = globalMuted);
            document.querySelectorAll('.sound-btn').forEach(btn => {
                btn.innerHTML = globalMuted ? mutedIcon : unmutedIcon;
            });
        });
    }

    video.addEventListener('click', () => {
        if(video.paused) video.play();
        else video.pause();
    });
});

// ==========================================
// 5. WINDOW RESIZE PROTECTOR
// ==========================================
let resizeTimer;
window.addEventListener('resize', () => {
    isResizing = true;
    centerPanel.style.scrollSnapType = 'none';
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
        isResizing = false;
        centerPanel.style.scrollSnapType = 'y mandatory';
        
        allVideoWrappers.forEach(wrapper => {
            const video = wrapper.querySelector('video');
            const rect = wrapper.getBoundingClientRect();
            if (rect.top >= -rect.height/2 && rect.top <= rect.height/2) {
                video.play().catch(e => console.log("Waiting for user tap"));
            }
        });
    }, 200);
});

// ==========================================
// 6. ROCK SOLID VIDEO OBSERVER
// ==========================================
const observerOptions = { root: centerPanel, threshold: 0.6 };

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        const index = entry.target.getAttribute('data-index');

        if (entry.isIntersecting) {
            video.muted = globalMuted;
            video.play().catch(e => console.log("Autoplay blocked until user taps"));
            
            titleElement.style.opacity = 0;
            textElement.style.opacity = 0;
            
            setTimeout(() => {
                if (videoDetails[index]) {
                    titleElement.textContent = videoDetails[index].title;
                    textElement.textContent = videoDetails[index].text;
                }
                titleElement.style.opacity = 1;
                textElement.style.opacity = 1;
            }, 300);
        } else {
            video.pause();
            if(video.readyState >= 2) video.currentTime = 0; 
        }
    });
}, observerOptions);

allVideoWrappers.forEach(wrapper => videoObserver.observe(wrapper));

// ==========================================
// 7. LOOPING IMAGE CAROUSEL & MODAL
// ==========================================
const mobileViewBtn = document.getElementById('mobileViewBtn');
const gridOverlay = document.getElementById('gridOverlay');
const closeGridBtn = document.getElementById('closeGridBtn');

if (mobileViewBtn) mobileViewBtn.addEventListener('click', () => gridOverlay.classList.add('active'));
if (closeGridBtn) closeGridBtn.addEventListener('click', () => gridOverlay.classList.remove('active'));

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close-modal");

const sidebarImages = Array.from(document.querySelectorAll('.sidebar-grid .grid-image'));
const imageUrls = sidebarImages.map(img => img.src);
let currentImageIndex = 0;

function openModal(index) {
    currentImageIndex = index;
    modalImg.src = imageUrls[currentImageIndex];
    modalImg.classList.remove('profile-preview'); 
    if(modalPrevBtn) modalPrevBtn.style.display = 'inline-block'; 
    if(modalNextBtn) modalNextBtn.style.display = 'inline-block';
    modal.style.display = "flex";
}

function openModalDirectly(src) {
    modalImg.src = src;
    modalImg.classList.add('profile-preview'); 
    if(modalPrevBtn) modalPrevBtn.style.display = 'none'; 
    if(modalNextBtn) modalNextBtn.style.display = 'none';
    modal.style.display = "flex";
}

function closeModalDirectly() {
    modal.style.display = "none";
    modalImg.classList.remove('profile-preview'); 
    if(modalPrevBtn) modalPrevBtn.style.display = 'inline-block'; 
    if(modalNextBtn) modalNextBtn.style.display = 'inline-block';
}

sidebarImages.forEach((img, index) => img.addEventListener("click", () => openModal(index)));

const mobileImages = document.querySelectorAll('.overlay-grid .grid-image');
mobileImages.forEach((img, index) => img.addEventListener("click", () => openModal(index)));

[profilePicDesktop, profilePicMobile].forEach(pPic => {
    if (pPic) {
        pPic.style.cursor = 'pointer'; 
        pPic.addEventListener('click', () => openModalDirectly(pPic.src));
    }
});

if(modalPrevBtn) {
    modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalImg.classList.contains('profile-preview')) return; 
        currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
        modalImg.src = imageUrls[currentImageIndex];
    });
}

if(modalNextBtn) {
    modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalImg.classList.contains('profile-preview')) return; 
        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
        modalImg.src = imageUrls[currentImageIndex];
    });
}

if(closeBtn) closeBtn.addEventListener("click", closeModalDirectly);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModalDirectly(); });

// ==========================================
// 8. NAVIGATION ARROWS
// ==========================================
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');

btnUp.addEventListener('click', () => {
    centerPanel.scrollBy({ top: -centerPanel.clientHeight, behavior: 'smooth' });
});

btnDown.addEventListener('click', () => {
    centerPanel.scrollBy({ top: centerPanel.clientHeight, behavior: 'smooth' });
});
