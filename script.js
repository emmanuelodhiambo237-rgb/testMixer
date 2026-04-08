let videoDetails = [];
const centerPanel = document.getElementById('video-container');
const titleElement = document.getElementById('dynamic-title');
const textElement = document.getElementById('dynamic-text');

// ==========================================
// 1. FETCH DATA & HANDLE SPACES
// ==========================================
async function loadWebsiteContent() {
    try {
        const response = await fetch('content.json?t=' + new Date().getTime());
        const data = await response.json();
        
        videoDetails = data.videos || [];

        const desktopGallery = document.getElementById('desktop-gallery-container');
        const mobileGallery = document.getElementById('mobile-gallery-container');
        
        desktopGallery.innerHTML = "";
        mobileGallery.innerHTML = "";
        centerPanel.innerHTML = "";

        // Build Gallery 
        if (data.gallery) {
            data.gallery.forEach(imgUrl => {
                const safeUrl = encodeURI(imgUrl);
                const imgHTML = `<img src="${safeUrl}" class="grid-image" loading="lazy">`;
                desktopGallery.innerHTML += imgHTML;
                mobileGallery.innerHTML += imgHTML;
            });
        }

        // Build Videos 
        if (data.videos && data.videos.length > 0) {
            data.videos.forEach((vid, index) => {
                const safeVidUrl = encodeURI(vid.videoUrl);
                const vidHTML = `
                <div class="video-wrapper" data-index="${index}">
                    <video src="${safeVidUrl}" loop muted playsinline preload="metadata"></video>
                    <button class="sound-btn"></button>
                </div>`;
                centerPanel.innerHTML += vidHTML;
            });
            initializeWebsiteInteractions();
        } else {
            titleElement.textContent = "Welcome";
            textElement.textContent = "Use the dashboard to add videos.";
            document.querySelector('.nav-arrows').style.display = 'none';
        }

    } catch (error) {
        titleElement.textContent = "Configuration Needed";
        textElement.textContent = "Please check your content.json file.";
        console.error("Error loading content:", error);
    }
}

// ==========================================
// 2. RE-INITIALIZE THE INTERACTIONS
// ==========================================
function initializeWebsiteInteractions() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    if (videoWrappers.length === 0) return;

    // -- TikTok Sound Logic & Video Clicks --
    let globalMuted = true;
    const mutedIcon = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
    const unmutedIcon = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const soundBtn = wrapper.querySelector('.sound-btn');
        
        soundBtn.innerHTML = mutedIcon;

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            globalMuted = !globalMuted;
            document.querySelectorAll('video').forEach(v => v.muted = globalMuted);
            document.querySelectorAll('.sound-btn').forEach(btn => {
                btn.innerHTML = globalMuted ? mutedIcon : unmutedIcon;
            });
        });

        video.addEventListener('click', () => {
            if(video.paused) video.play();
            else video.pause();
        });
    });

    // -- Ensure strict scroll snapping is on permanently --
    centerPanel.style.scrollSnapType = 'y mandatory';

    // -- Intersection Observer (Rock solid scroll detection) --
    const observerOptions = { root: centerPanel, threshold: 0.6 };
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            const index = parseInt(entry.target.getAttribute('data-index'));

            video.muted = globalMuted;

            if (entry.isIntersecting) {
                video.play().catch(e => console.log("Waiting for interaction"));
                
                titleElement.style.opacity = 0;
                textElement.style.opacity = 0;
                
                setTimeout(() => {
                    if (videoDetails[index]) {
                        titleElement.textContent = videoDetails[index].title;
                        textElement.textContent = videoDetails[index].text;
                        titleElement.style.opacity = 1;
                        textElement.style.opacity = 1;
                    }
                }, 300);
            } else {
                video.pause();
                if(video.readyState >= 2) {
                    video.currentTime = 0; 
                }
            }
        });
    }, observerOptions);

    videoWrappers.forEach(wrapper => videoObserver.observe(wrapper));

    // -- Looping Image Carousel & Modal --
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.querySelector(".close-modal");

    // Gather all current images after they load
    const sidebarImages = Array.from(document.querySelectorAll('.sidebar-grid .grid-image'));
    const imageUrls = sidebarImages.map(img => img.src);
    let currentImageIndex = 0;

    function openModal(index) {
        currentImageIndex = index;
        modalImg.src = imageUrls[currentImageIndex];
        modal.style.display = "flex";
    }

    // Bind clicks to desktop and mobile images cleanly
    document.querySelectorAll('.sidebar-grid .grid-image').forEach((img, index) => {
        img.replaceWith(img.cloneNode(true)); // Clear old listeners
    });
    document.querySelectorAll('.sidebar-grid .grid-image').forEach((img, index) => {
        img.addEventListener("click", () => openModal(index));
    });

    document.querySelectorAll('.overlay-grid .grid-image').forEach((img, index) => {
        img.replaceWith(img.cloneNode(true));
    });
    document.querySelectorAll('.overlay-grid .grid-image').forEach((img, index) => {
        img.addEventListener("click", () => openModal(index));
    });

    // Arrow Math (Loops backward/forward seamlessly)
    const prevBtn = document.querySelector('.prev-modal');
    const nextBtn = document.querySelector('.next-modal');
    
    // Clear old event listeners on modal arrows
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));

    document.querySelector('.prev-modal').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
        modalImg.src = imageUrls[currentImageIndex];
    });

    document.querySelector('.next-modal').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
        modalImg.src = imageUrls[currentImageIndex];
    });

    // Close logic
    if(closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // -- Mobile Grid Overlay bindings --
    const mobileViewBtn = document.getElementById('mobileViewBtn');
    const gridOverlay = document.getElementById('gridOverlay');
    const closeGridBtn = document.getElementById('closeGridBtn');

    if (mobileViewBtn) mobileViewBtn.onclick = () => gridOverlay.classList.add('active');
    if (closeGridBtn) closeGridBtn.onclick = () => gridOverlay.classList.remove('active');
}

// -- Navigation Arrows (Finite Scroll) --
document.getElementById('btn-up').onclick = () => {
    const itemHeight = centerPanel.clientHeight;
    centerPanel.scrollBy({ top: -itemHeight, behavior: 'smooth' });
};
document.getElementById('btn-down').onclick = () => {
    const itemHeight = centerPanel.clientHeight;
    centerPanel.scrollBy({ top: itemHeight, behavior: 'smooth' });
};

// Start the build process
loadWebsiteContent();
