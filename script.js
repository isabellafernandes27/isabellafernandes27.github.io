// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active'));
    link.classList.add('active');
    const id = link.getAttribute('href');
    document.querySelector(id).scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// Highlight nav on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const options = {root:null,rootMargin:'-40% 0px -40% 0px',threshold:0};
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = entry.target.getAttribute('id');
      navLinks.forEach(n=>n.classList.toggle('active', n.getAttribute('href') === '#'+id));
    }
  });
},options);
sections.forEach(s=>observer.observe(s));

// Fetch GitHub repos dynamically and handle filtering
const filterContainer = document.getElementById('filter-buttons'); // container for filter buttons
const projectsGrid = document.getElementById('projects-grid');

fetch('https://api.github.com/users/isabellafernandes27/repos')
  .then(res => res.json())
  .then(repos => {
    if(!projectsGrid) return;
    projectsGrid.innerHTML = '';

    // Filter out forks and website repo
    const filteredRepos = repos.filter(r => !r.fork && r.name.toLowerCase() !== 'isabellafernandes27.github.io')
      .sort((a,b)=> new Date(b.updated_at) - new Date(a.updated_at));

    // Collect unique languages for dynamic filter buttons
    const languages = Array.from(new Set(filteredRepos.map(r => (r.language || 'Other').toLowerCase()))).sort();

    // Build filter buttons dynamically
    if(filterContainer){
      filterContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>' +
        languages.map(l => `<button class="filter-btn" data-filter="${l}">${l.charAt(0).toUpperCase() + l.slice(1)}</button>`).join('');
    }

    // Build project cards
    filteredRepos.forEach(repo => {
      const lang = repo.language || 'Other';
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.lang = lang.toLowerCase();
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description yet.'}</p>
        <span class="lang-badge"><strong>${lang}</strong></span>
        <a href="${repo.html_url}" target="_blank" class="project-link">View Repo</a>
      `;
      projectsGrid.appendChild(card);
    });

    // Attach filtering behavior to buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = Array.from(projectsGrid.querySelectorAll('.project-card'));
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const lang = card.dataset.lang;
          card.classList.toggle('hidden', !(filter === 'all' || filter === lang));
        });
      });
    });

    // Apply initial filter
    const activeBtn = document.querySelector('.filter-btn.active') || filterButtons[0];
    if(activeBtn) activeBtn.click();
  });

// Formspree submission handling (progress feedback)
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    status.textContent = 'Sending...';
    const data = new FormData(form);
    fetch(form.action, {method:'POST',body:data,headers:{'Accept':'application/json'}})
      .then(response=>{
        if(response.ok){
          status.textContent = 'Thanks — I received your message!';
          form.reset();
        } else {
          response.json().then(data=>{
            status.textContent = (data && data.error) ? data.error : 'Oops — there was a problem.';
          });
        }
      })
      .catch(()=>{
        status.textContent = 'Network error — please try again later.';
      });
  });
}

// current year
document.getElementById('cur-year').textContent = new Date().getFullYear();
