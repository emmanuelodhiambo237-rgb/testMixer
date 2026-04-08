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
// 2. WINDOW RESIZE PROTECTOR
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
        
        // BUG FIX: Force the browser to re-check and play the current video 
        // after you finish resizing the window so it doesn't stay stuck!
        videoWrappers.forEach(wrapper => {
            const video = wrapper.querySelector('video');
            const rect = wrapper.getBoundingClientRect();
            // If the video is taking up at least half the screen, play it
            if (rect.top >= -rect.height/2 && rect.top <= rect.height/2) {
                video.play();
            }
        });
        
    }, 200);
});

// ==========================================
// 3. ENDLESS LOOP SCROLL LOGIC
// ==========================================

window.addEventListener('load', () => {
    centerPanel.style.scrollSnapType = 'none';
    centerPanel.prepend(centerPanel.lastElementChild);
    centerPanel.scrollTop = centerPanel.clientHeight;
    centerPanel.style.scrollSnapType = 'y mandatory';
});

// The Teleporter
centerPanel.addEventListener('scroll', () => {
    if (isResizing) return; // Keep the teleporter frozen during resize so it doesn't lag

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
// 4. VIDEO OBSERVER
// ==========================================

const observerOptions = { root: centerPanel, threshold: 0.6 };

const videoObserver = new IntersectionObserver((entries) => {
    // BUG FIX: Removed the line that was completely blocking the video during resize
    entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        const index = entry.target.getAttribute('data-index');

        if (entry.isIntersecting) {
            video.play();
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
// 5. IMAGE MODAL (LIGHTBOX)
// ==========================================
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close-modal");
const gridImages = document.querySelectorAll(".grid-image");

gridImages.forEach(img => {
    img.addEventListener("click", function() {
        modal.style.display = "flex";
        modalImg.src = this.src; 
    });
});

closeBtn.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// ==========================================
// 6. NAVIGATION ARROWS
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