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
    { path: '/resources/', pageName: 'resources' },
    { path: '/posts/', pageName: 'posts' },
  ],
});

var homeView = app.views.create('#view-home', { url: '/' });
var aboutView = app.views.create('#view-about', { url: '/about/' });
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
          <div class="item-subtitle" style="font-size: 0.85em; color: #666;">${post.date}</div>
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

// Initial load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  loadPosts();
} else {
  document.addEventListener('DOMContentLoaded', loadPosts);
}

// Load posts when tab is clicked
app.on('pageInit', function (page) {
  if (page.name === 'posts') {
    loadPosts();
  }
});
