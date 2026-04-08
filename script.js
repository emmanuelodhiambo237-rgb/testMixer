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
const videoWrappers = document.querySelectorAll('.video-wrapper');

// ==========================================
// 2. TIKTOK SOUND LOGIC & VIDEO CLICKS
// ==========================================
let globalMuted = true;
const mutedIcon = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
const unmutedIcon = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

videoWrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const soundBtn = wrapper.querySelector('.sound-btn');
    
    // Set initial icon
    soundBtn.innerHTML = mutedIcon;

    // Toggle sound on all videos when button is clicked
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stops the video from pausing
        globalMuted = !globalMuted;
        
        // Apply mute state to all videos
        document.querySelectorAll('video').forEach(v => v.muted = globalMuted);
        
        // Update all buttons visually
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.innerHTML = globalMuted ? mutedIcon : unmutedIcon;
        });
    });

    // Tap video to Pause/Play
    video.addEventListener('click', () => {
        if(video.paused) video.play();
        else video.pause();
    });
});

// ==========================================
// 3. WINDOW RESIZE PROTECTOR
// ==========================================
let isResizing = false;
let resizeTimer;

window.addEventListener('resize', () => {
    isResizing = true;
    centerPanel.style.scrollSnapType = 'none';
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
        isResizing = false;
        centerPanel.style.scrollSnapType = 'y mandatory';
        
        videoWrappers.forEach(wrapper => {
            const video = wrapper.querySelector('video');
            const rect = wrapper.getBoundingClientRect();
            if (rect.top >= -rect.height/2 && rect.top <= rect.height/2) {
                video.play().catch(e => console.log("Waiting for user interaction"));
            }
        });
    }, 200);
});

// ==========================================
// 4. ENDLESS LOOP SCROLL LOGIC
// ==========================================
window.addEventListener('load', () => {
    centerPanel.style.scrollSnapType = 'none';
    centerPanel.prepend(centerPanel.lastElementChild);
    centerPanel.scrollTop = centerPanel.clientHeight;
    centerPanel.style.scrollSnapType = 'y mandatory';
});

centerPanel.addEventListener('scroll', () => {
    if (isResizing) return; 

    const itemHeight = centerPanel.clientHeight;

    if (centerPanel.scrollTop === 0) {
        centerPanel.style.scrollSnapType = 'none';
        centerPanel.prepend(centerPanel.lastElementChild);
        centerPanel.scrollTop = itemHeight;
        setTimeout(() => { centerPanel.style.scrollSnapType = 'y mandatory'; }, 0);
    }
    
    if (centerPanel.scrollTop + itemHeight >= centerPanel.scrollHeight - 2) {
        centerPanel.style.scrollSnapType = 'none';
        centerPanel.appendChild(centerPanel.firstElementChild);
        centerPanel.scrollTop = centerPanel.scrollHeight - (itemHeight * 2);
        setTimeout(() => { centerPanel.style.scrollSnapType = 'y mandatory'; }, 0);
    }
});

// ==========================================
// 5. VIDEO OBSERVER
// ==========================================
const observerOptions = { root: centerPanel, threshold: 0.6 };

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        const index = entry.target.getAttribute('data-index');

        // Ensure global mute state applies to newly scrolled videos
        video.muted = globalMuted;

        if (entry.isIntersecting) {
            video.play().catch(e => console.log("Autoplay blocked until user taps"));
            titleElement.style.opacity = 0;
            textElement.style.opacity = 0;
            
            setTimeout(() => {
                titleElement.textContent = videoDetails[index].title;
                textElement.textContent = videoDetails[index].text;
                titleElement.style.opacity = 1;
                textElement.style.opacity = 1;
            }, 300);
        } else {
            video.pause();
            if(video.readyState >= 2) {
                video.currentTime = 0; 
            }
        }
    });
}, observerOptions);

videoWrappers.forEach(wrapper => {
    videoObserver.observe(wrapper);
});

// ==========================================
// 6. LOOPING IMAGE CAROUSEL & MODAL
// ==========================================
const mobileViewBtn = document.getElementById('mobileViewBtn');
const gridOverlay = document.getElementById('gridOverlay');
const closeGridBtn = document.getElementById('closeGridBtn');

if (mobileViewBtn) mobileViewBtn.addEventListener('click', () => gridOverlay.classList.add('active'));
if (closeGridBtn) closeGridBtn.addEventListener('click', () => gridOverlay.classList.remove('active'));

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close-modal");

// Create a master list of your image paths from the sidebar
const sidebarImages = Array.from(document.querySelectorAll('.sidebar-grid .grid-image'));
const imageUrls = sidebarImages.map(img => img.src);
let currentImageIndex = 0;

function openModal(index) {
    currentImageIndex = index;
    modalImg.src = imageUrls[currentImageIndex];
    modal.style.display = "flex";
}

// Bind clicks to desktop images
sidebarImages.forEach((img, index) => {
    img.addEventListener("click", () => openModal(index));
});

// Bind clicks to mobile images (they mirror the exact same index order)
const mobileImages = document.querySelectorAll('.overlay-grid .grid-image');
mobileImages.forEach((img, index) => {
    img.addEventListener("click", () => openModal(index));
});

// Left Arrow Math (Loops backward seamlessly)
document.querySelector('.prev-modal').addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
    modalImg.src = imageUrls[currentImageIndex];
});

// Right Arrow Math (Loops forward seamlessly)
document.querySelector('.next-modal').addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    modalImg.src = imageUrls[currentImageIndex];
});

// Close logic
closeBtn.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// ==========================================
// 7. NAVIGATION ARROWS
// ==========================================
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');

btnUp.addEventListener('click', () => {
    const itemHeight = centerPanel.clientHeight;
    centerPanel.scrollBy({ top: -itemHeight, behavior: 'smooth' });
});

btnDown.addEventListener('click', () => {
    const itemHeight = centerPanel.clientHeight;
    centerPanel.scrollBy({ top: itemHeight, behavior: 'smooth' });
});