let videoDetails = [];
const centerPanel = document.getElementById('video-container');
const titleElement = document.getElementById('dynamic-title');
const textElement = document.getElementById('dynamic-text');

// ==========================================
// 1. FETCH DATA & HANDLE SPACES
// ==========================================
async function loadWebsiteContent() {
    try {
        // Prevent caching so changes show immediately
        const response = await fetch('content.json?t=' + new Date().getTime());
        const data = await response.json();
        
        videoDetails = data.videos || [];

        const desktopGallery = document.getElementById('desktop-gallery-container');
        const mobileGallery = document.getElementById('mobile-gallery-container');
        
        // Clear containers for a fresh load
        desktopGallery.innerHTML = "";
        mobileGallery.innerHTML = "";
        centerPanel.innerHTML = "";

        // Build Gallery (Automatically handles spaces in filenames)
        if (data.gallery) {
            data.gallery.forEach(imgUrl => {
                // This converts "images/side image1.jpg" to "images/side%20image1.jpg" only for loading
                const safeUrl = encodeURI(imgUrl);
                const imgHTML = `<img src="${safeUrl}" class="grid-image" loading="lazy">`;
                desktopGallery.innerHTML += imgHTML;
                mobileGallery.innerHTML += imgHTML;
            });
        }

        // Build Videos (Automatically handles spaces in filenames)
        if (data.videos && data.videos.length > 0) {
            data.videos.forEach((vid, index) => {
                // This converts "videos/my video.mp4" to "videos/my%20video.mp4" only for loading
                const safeVidUrl = encodeURI(vid.videoUrl);
                const vidHTML = `
                <div class="video-wrapper" data-index="${index}">
                    <video src="${safeVidUrl}" loop muted playsinline preload="metadata"></video>
                </div>`;
                centerPanel.innerHTML += vidHTML;
            });
            // Important: Interaction setup must happen AFTER HTML is built
            initializeWebsiteInteractions();
        } else {
            titleElement.textContent = "Welcome";
            textElement.textContent = "Use the dashboard to add videos.";
            // Hide arrows if no videos
            document.querySelector('.nav-arrows').style.display = 'none';
        }

    } catch (error) {
        titleElement.textContent = "Configuration Needed";
        textElement.textContent = "Please ensure content.json exists and media folders are set correctly.";
        console.error("Error loading content:", error);
    }
}

// ==========================================
// 2. RE-INITIALIZE THE INTERACTIONS
// ==========================================
function initializeWebsiteInteractions() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    const totalVideos = videoWrappers.length;

    // -- Endless Loop Scroll Logic --
    // We only enable the loop if there are enough videos (at least 2)
    if (totalVideos > 1) {
        centerPanel.style.scrollSnapType = 'none';
        centerPanel.prepend(centerPanel.lastElementChild);
        centerPanel.scrollTop = centerPanel.clientHeight;
        
        centerPanel.addEventListener('scroll', loopScrollHandler);
        // Turn snap back on after setup
        setTimeout(() => { centerPanel.style.scrollSnapType = 'y mandatory'; }, 10);
    } else if (totalVideos === 1) {
         // Single video setup
         centerPanel.style.scrollSnapType = 'y mandatory';
         videoWrappers[0].querySelector('video').play().catch(e => console.log("Autoplay waiting for interaction"));
    }

    // -- Intersection Observer (Video Play/Pause & Dynamic Text) --
    const observerOptions = { root: centerPanel, threshold: 0.6 };
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            const index = entry.target.getAttribute('data-index');

            if (entry.isIntersecting) {
                // Attempt to play (browser may block if no interaction)
                video.play().catch(e => {
                     console.log("Play blocked, waiting for user click.");
                     // Show interaction prompt if needed
                });

                // Smoothly fade text in/out
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
                // Optional: Reset video to start
                if(video.readyState >= 2) {
                    video.currentTime = 0; 
                }
            }
        });
    }, observerOptions);

    videoWrappers.forEach(wrapper => videoObserver.observe(wrapper));

    // -- Setup Lightbox for newly created images --
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const gridImages = document.querySelectorAll(".grid-image");

    gridImages.forEach(img => {
        // Remove old listeners to prevent bugs
        img.replaceWith(img.cloneNode(true));
    });
    
    // Re-select and add listener
    document.querySelectorAll(".grid-image").forEach(img => {
        img.addEventListener("click", function() {
            modal.style.display = "flex";
            modalImg.src = this.src; 
        });
    });

    // Modal close logic (remains stable)
    const closeBtn = document.querySelector(".close-modal");
    if(closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // -- Mobile Grid Overlay re-binding --
    const mobileViewBtn = document.getElementById('mobileViewBtn');
    const gridOverlay = document.getElementById('gridOverlay');
    const closeGridBtn = document.getElementById('closeGridBtn');

    if (mobileViewBtn) {
        mobileViewBtn.onclick = () => gridOverlay.classList.add('active');
    }
    if (closeGridBtn) {
        closeGridBtn.onclick = () => gridOverlay.classList.remove('active');
    }
}

// Handler for the endless scroll loop
function loopScrollHandler() {
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
}

// -- Navigation Arrows re-binding --
document.getElementById('btn-up').onclick = () => {
    centerPanel.scrollBy({ top: -centerPanel.clientHeight, behavior: 'smooth' });
};
document.getElementById('btn-down').onclick = () => {
    centerPanel.scrollBy({ top: centerPanel.clientHeight, behavior: 'smooth' });
};

// Start the build process
loadWebsiteContent();
