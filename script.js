let videoDetails = [];
const centerPanel = document.getElementById('video-container');
const titleElement = document.getElementById('dynamic-title');
const textElement = document.getElementById('dynamic-text');

// ==========================================
// 1. FETCH DATA FROM THE DATABASE
// ==========================================
async function loadWebsiteContent() {
    try {
        // Fetch the JSON file managed by the Admin Dashboard
        const response = await fetch('content.json');
        const data = await response.json();
        
        videoDetails = data.videos;

        // Build the Gallery Images
        const desktopGallery = document.getElementById('desktop-gallery-container');
        const mobileGallery = document.getElementById('mobile-gallery-container');
        
        data.gallery.forEach(imgUrl => {
            const imgHTML = `<img src="${imgUrl}" class="grid-image" loading="lazy">`;
            desktopGallery.innerHTML += imgHTML;
            mobileGallery.innerHTML += imgHTML;
        });

        // Build the Videos
        data.videos.forEach((vid, index) => {
            const vidHTML = `
            <div class="video-wrapper" data-index="${index}">
                <video src="${vid.videoUrl}" loop muted playsinline preload="metadata"></video>
            </div>`;
            centerPanel.innerHTML += vidHTML;
        });

        // Once the HTML is built, start the interactive features
        initializeWebsite();

    } catch (error) {
        titleElement.textContent = "Error";
        textElement.textContent = "Could not load content.";
        console.error("Error loading content:", error);
    }
}

// ==========================================
// 2. INITIALIZE ALL INTERACTIONS
// ==========================================
function initializeWebsite() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');

    // -- Resize Protector --
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
                if (rect.top >= -rect.height/2 && rect.top <= rect.height/2) video.play();
            });
        }, 200);
    });

    // -- Endless Loop Scroll Logic --
    centerPanel.style.scrollSnapType = 'none';
    centerPanel.prepend(centerPanel.lastElementChild);
    centerPanel.scrollTop = centerPanel.clientHeight;
    centerPanel.style.scrollSnapType = 'y mandatory';

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

    // -- Video Observer --
    const observerOptions = { root: centerPanel, threshold: 0.6 };
    const videoObserver = new IntersectionObserver((entries) => {
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
                if(video.readyState >= 2) video.currentTime = 0; 
            }
        });
    }, observerOptions);

    videoWrappers.forEach(wrapper => videoObserver.observe(wrapper));

    // -- Mobile Gallery Overlay & Modal --
    const mobileViewBtn = document.getElementById('mobileViewBtn');
    const gridOverlay = document.getElementById('gridOverlay');
    const closeGridBtn = document.getElementById('closeGridBtn');

    if (mobileViewBtn) mobileViewBtn.addEventListener('click', () => gridOverlay.classList.add('active'));
    if (closeGridBtn) closeGridBtn.addEventListener('click', () => gridOverlay.classList.remove('active'));

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

    // -- Navigation Arrows --
    document.getElementById('btn-up').addEventListener('click', () => {
        centerPanel.scrollBy({ top: -centerPanel.clientHeight, behavior: 'smooth' });
    });
    document.getElementById('btn-down').addEventListener('click', () => {
        centerPanel.scrollBy({ top: centerPanel.clientHeight, behavior: 'smooth' });
    });
}

// Trigger the build process when the page loads
loadWebsiteContent();