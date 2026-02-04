var app = new Framework7({
  el: '#app',
  name: 'EM Del Ponte',
  theme: 'auto',
  panel: {
    swipe: true,
  },
  routes: [
    { path: '/', pageName: 'home' },
    { path: '/about/', pageName: 'about' },
    { path: '/lab/', pageName: 'lab' },
    { path: '/resources/', pageName: 'resources' },
    { path: '/posts/', pageName: 'posts' },
  ],
});

var homeView = app.views.create('#view-home', { url: '/' });
var aboutView = app.views.create('#view-about', { url: '/about/' });
var labView = app.views.create('#view-lab', { url: '/lab/' });
var resourcesView = app.views.create('#view-resources', { url: '/resources/' });
var postsView = app.views.create('#view-posts', { url: '/posts/' });

// Function to render posts list
function loadPosts() {
  const listEl = document.querySelector('#posts-list ul');
  if (!listEl || typeof postsData === 'undefined') return;

  listEl.innerHTML = postsData.map((post, index) => `
    <li>
      <a href="#" class="item-link item-content" onclick="openPost(${index})">
        <div class="item-media">
          <img src="posts/${post.folder}/${post.image || 'preview.png'}" width="80" style="border-radius: 4px; aspect-ratio: 1; object-fit: cover;" />
        </div>
        <div class="item-inner">
          <div class="item-title-row">
            <div class="item-title" style="white-space: normal; font-weight: bold;">${post.title}</div>
          </div>
          <div class="item-subtitle" style="font-size: 0.85em;">${post.date}</div>
        </div>
      </a>
    </li>
  `).join('');
}

// Function to open post in popup
window.openPost = function (index) {
  const post = postsData[index];
  if (!post) return;

  // Set titles
  document.getElementById('post-display-title').innerText = post.title;
  document.getElementById('post-display-date').innerText = post.date;

  // Render markdown with fixed image paths
  let fixedContent = post.content.replace(/!\[(.*?)\]\((.*?)\)(\{.*?\})?/g, (match, alt, src, attr) => {
    if (!src.startsWith('http') && !src.startsWith('/')) {
      return `![${alt}](posts/${post.folder}/${src})`;
    }
    return match;
  });
  fixedContent = fixedContent.replace(/\{#fig-.*?\}/g, '');

  document.getElementById('post-display-body').innerHTML = marked.parse(fixedContent);

  // Open the popup
  app.popup.open('#post-popup');
};

// Function to randomize splash screen background
function setRandomSplash() {
  const splashEl = document.querySelector('.splash-page');
  if (!splashEl) return;

  const images = [
    'figs/splash.png',          // Wheat
    'figs/splash_soybean.png',  // Soybean (canopy dark)
    'figs/splash_corn.png',     // Corn (dawn dramatic)
    'figs/splash_orange.png',   // Orange Orchard
    'figs/splash_banana.png'    // Banana Plantation (dawn dramatic)
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  splashEl.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45)), url('${randomImage}')`;
}

// Initial load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  loadPosts();
  setRandomSplash();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setRandomSplash();
  });
}

// Load posts when tab is clicked
app.on('pageInit', function (page) {
  if (page.name === 'posts') {
    loadPosts();
  }
});
