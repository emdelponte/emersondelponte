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
    { path: '/cv/', pageName: 'cv' },
  ],
});

var homeView = app.views.create('#view-home', { url: '/' });
var aboutView = app.views.create('#view-about', { url: '/about/' });
var labView = app.views.create('#view-lab', { url: '/lab/' });
var resourcesView = app.views.create('#view-resources', { url: '/resources/' });
var postsView = app.views.create('#view-posts', { url: '/posts/' });
var cvView = app.views.create('#view-cv', { url: '/cv/' });

// Function to render posts list
function loadPosts() {
  const listEl = document.querySelector('#posts-list ul');
  if (!listEl || typeof postsData === 'undefined') return;

  listEl.innerHTML = postsData.map((post, index) => {
    const thumb = post.image ? `posts/${post.folder}/${post.image}` : 'figs/splash.png';
    return `
    <li>
      <a href="#" class="item-link item-content" onclick="openPost(${index})">
        <div class="item-media"><img src="${thumb}" width="80" height="60" style="object-fit: cover; border-radius: 8px"/></div>
        <div class="item-inner">
          <div class="item-title-row">
            <div class="item-title">${post.title}</div>
          </div>
          <div class="item-subtitle" style="font-size: 0.85em;">${post.date}</div>
        </div>
      </a>
    </li>
  `}).join('');
}

// Function to open post in popup
function openPost(index) {
  const post = postsData[index];
  const popup = app.popup.get('#post-popup');

  document.getElementById('post-display-title').innerText = post.title;
  document.getElementById('post-display-date').innerText = post.date;
  document.getElementById('post-display-body').innerHTML = marked.parse(post.content);

  app.popup.open('#post-popup');
}

// Function to load the CV from cv.md
function loadCV() {
  const cvEl = document.getElementById('cv-body');
  if (!cvEl || cvEl.dataset.loaded) return;
  cvEl.dataset.loaded = 'true';

  fetch('cv.md')
    .then(res => res.text())
    .then(text => {
      // Remove YAML frontmatter
      const content = text.replace(/^---\s*\n[\s\S]*?\n---\s*/, '');
      cvEl.innerHTML = marked.parse(content);

      // Dated entries ("- **2023 – present** text") become timeline rows
      cvEl.querySelectorAll('li').forEach(li => {
        const first = li.firstChild;
        if (!first || first.nodeName !== 'STRONG' || !/^(Since |Current|\d{4})/.test(first.textContent)) return;
        const body = document.createElement('div');
        body.className = 'timeline-content';
        while (first.nextSibling) body.appendChild(first.nextSibling);
        first.className = 'timeline-date';
        li.classList.add('timeline-item');
        li.appendChild(body);
        li.parentElement.classList.add('timeline-list');
      });

      // External links open in a new tab
      cvEl.querySelectorAll('a[href^="http"], a[href^="mailto"]').forEach(a => {
        a.classList.add('external');
        a.target = '_blank';
        a.rel = 'noopener';
      });
    })
    .catch(() => {
      delete cvEl.dataset.loaded;
      cvEl.innerHTML = '<p>Could not load the CV.</p>';
    });
}

// Add event listener for images in splash screen
function setRandomSplash() {
  const splashPage = document.querySelector('.splash-page');
  if (!splashPage) return;

  const images = [
    'figs/splash.png',          // Wheat
    'figs/splash_soybean.png',  // Soybean (canopy dark)
    'figs/splash_corn.png',     // Corn (dawn dramatic)
    'figs/splash_orange.png',   // Orange Orchard
    'figs/splash_banana.png'    // Banana Plantation (dawn dramatic)
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  splashPage.style.backgroundImage = `url('${randomImage}')`;
}

// Initialize on app load
app.on('init', () => {
  loadPosts();
  loadCV();
  setRandomSplash();
});

// For initial load if init already fired
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadCV();
  setRandomSplash();
});
