(function () {
  const STORAGE_KEY = 'customPlaylists';
  const CSS_ID = 'createPlaylistStyles';

  const CSS_RULES = `
  /* OFFCANVAS VERDE */
  #offcanvasCreatePlaylist {
    background-color: #1ed760 !important; /* verde Spotify */
    color: #000 !important;
    border-right: 1px solid rgba(0,0,0,0.15) !important;
  }
  #offcanvasCreatePlaylist .offcanvas-header {
    border-bottom: 1px solid rgba(0,0,0,0.15) !important;
  }
  #offcanvasCreatePlaylist .offcanvas-title {
    color: #000 !important;
    font-weight: 800 !important;
    letter-spacing: .3px !important;
  }
  #offcanvasCreatePlaylist .title-label { color: #000 !important; font-weight: 600 !important; }
  #offcanvasCreatePlaylist .form-dark,
  #offcanvasCreatePlaylist .form-dark:focus,
  #offcanvasCreatePlaylist select.form-dark,
  #offcanvasCreatePlaylist textarea.form-dark {
    background-color: #000 !important;
    color: #fff !important;
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
  #offcanvasCreatePlaylist .form-dark::placeholder { color: #bbb !important; }
  #offcanvasCreatePlaylist .btn-light { background-color: #fff !important; color: #000 !important; border: none !important; }
  #offcanvasCreatePlaylist .btn-light:hover { background-color: #e9e9e9 !important; }
  #offcanvasCreatePlaylist .btn-outline-light { color: #fff !important; border-color: #fff !important; }
  #offcanvasCreatePlaylist .btn-close-white { filter: invert(1) !important; }

  /* PULSANTINI VERDI SOTTO LA CARD */
  .pl-actions .btn-spotify {
    background-color: #1ed760 !important;
    color: #000 !important;
    border: 1px solid #1ed760 !important;
    padding: .15rem .5rem !important;
    line-height: 1.1 !important;
    font-weight: 600 !important;
  }
  .pl-actions .btn-spotify:hover { filter: brightness(0.95); }
  `;

  function ensureCssInjected() {
    if (!document.getElementById(CSS_ID)) {
      const style = document.createElement('style');
      style.id = CSS_ID;
      style.textContent = CSS_RULES;
      document.head.appendChild(style);
    }
  }

  // localStorage
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }
  function saveData(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  
  const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2)));
  const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));

  
  function ensureRowTarget() {
    let customRow = document.getElementById('customPlaylistsRow');
    if (customRow) return customRow;

    // Cerca il titolo "Buonasera"
    const h2s = Array.from(document.querySelectorAll('h2'));
    const buona = h2s.find(h => h.textContent.trim().toLowerCase() === 'buonasera');

    let afterNode = null;
    if (buona) {
      // Trova una .container vicina a quel blocco
      let container = buona.parentElement;
      for (let i = 0; i < 5 && container && !container.classList.contains('container'); i++) {
        container = container.nextElementSibling || container.parentElement?.nextElementSibling || container.parentElement;
      }
      afterNode = container || buona.closest('.container');
    }

    const newWrapper = document.createElement('div');
    newWrapper.className = 'container';
    newWrapper.innerHTML = `<div class="row g-3 mt-2" id="customPlaylistsRow"></div>`;

    if (afterNode && afterNode.parentNode) {
      afterNode.parentNode.insertBefore(newWrapper, afterNode.nextSibling);
    } else {
      document.querySelector('.col.col-12.col-md-8')?.appendChild(newWrapper);
    }
    return document.getElementById('customPlaylistsRow');
  }

  function renderAll(playlists) {
    const row = ensureRowTarget();
    row.innerHTML = '';
    playlists.slice().reverse().forEach(item => {
      row.appendChild(renderCard(item));
    });
  }

  function renderCard(item) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.dataset.id = item.id;

    col.innerHTML = `
      <div class="d-flex playlist-card align-items-center">
        <a href="ARTIST-PAGE.html" class="shrink-0">
          <img src="${escapeHtml(item.cover || './img/PREFERITI.png')}" alt="#" height="100" />
        </a>
        <div class="m-0 ms-2 ms-md-3 flex-grow-1">
          <p class="fw-bold mb-1 text-truncate" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
          <p class="m-0 small text-white-50">
            ${escapeHtml(item.vis || 'Pubblica')}${item.tag ? ' • ' + escapeHtml(item.tag) : ''}${item.desc ? ' • ' + escapeHtml(item.desc) : ''}
          </p>
          <div class="pl-actions mt-2">
            <button class="btn btn-spotify btn-sm me-2" data-action="edit" data-id="${item.id}">Modifica</button>
            <button class="btn btn-spotify btn-sm" data-action="delete" data-id="${item.id}">Elimina</button>
          </div>
        </div>
      </div>
    `;
    return col;
  }


  fetch('./crea-playlist.html')
    .then(r => r.text())
    .then(html => {
      ensureCssInjected();

      // prendo solo l'offcanvas e lo appendo
      const temp = document.createElement('html');
      temp.innerHTML = html;
      const offcanvasNode = temp.querySelector('#offcanvasCreatePlaylist');
      if (!offcanvasNode) throw new Error('Offcanvas non trovato in crea-playlist.html');
      document.body.appendChild(offcanvasNode);

      const offcanvas = new bootstrap.Offcanvas(offcanvasNode);
      const form = offcanvasNode.querySelector('#createPlaylistForm');
      const titleEl = offcanvasNode.querySelector('#offcanvasCreatePlaylistLabel');
      const submitBtn = offcanvasNode.querySelector('#plSubmitBtn');

      // stato di editing
      let editingId = null;

      // apri tendina "Crea playlist" in sidebar
      const sidebarRoot = document.getElementById('sidebar') || document.querySelector('.sidebar');
      if (sidebarRoot) {
        const trigger = Array.from(sidebarRoot.querySelectorAll('p, a, button'))
          .find(el => el.textContent.trim().toLowerCase() === 'crea playlist');
        if (trigger) {
          trigger.style.cursor = 'pointer';
          trigger.addEventListener('click', () => {
            editingId = null;
            titleEl.textContent = 'Crea playlist';
            submitBtn.textContent = 'Crea';
            form.reset();
            offcanvas.show();
          });
        }
      }

      // carica eventuali card dal localStorage
      let data = loadData();
      renderAll(data);

      // click Modifica/Elimina
      const row = ensureRowTarget();
      row.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const idx = data.findIndex(p => p.id === id);
        if (idx === -1) return;

        if (action === 'delete') {
          // elimina
          data.splice(idx, 1);
          saveData(data);
          renderAll(data);
        } else if (action === 'edit') {
          // precompila form e apri offcanvas
          const item = data[idx];
          offcanvasNode.querySelector('#plCover').value = item.cover || '';
          offcanvasNode.querySelector('#plName').value  = item.name  || '';
          offcanvasNode.querySelector('#plDesc').value  = item.desc  || '';
          offcanvasNode.querySelector('#plVisibility').value = item.vis || 'Pubblica';
          offcanvasNode.querySelector('#plTag').value   = item.tag   || '';
          editingId = item.id;
          titleEl.textContent = 'Modifica playlist';
          submitBtn.textContent = 'Salva';
          offcanvas.show();
        }
      });

      // crea o salva modifica
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const cover = (offcanvasNode.querySelector('#plCover').value || '').trim();
        const name  = (offcanvasNode.querySelector('#plName').value || '').trim();
        const desc  = (offcanvasNode.querySelector('#plDesc').value || '').trim();
        const vis   = (offcanvasNode.querySelector('#plVisibility').value || 'Pubblica').trim();
        const tag   = (offcanvasNode.querySelector('#plTag').value || '').trim();

        if (!name) {
          offcanvasNode.querySelector('#plName').reportValidity?.();
          return;
        }

        if (editingId) {
          // update
          const idx = data.findIndex(p => p.id === editingId);
          if (idx !== -1) {
            data[idx] = { ...data[idx], cover, name, desc, vis, tag };
          }
        } else {
          // create
          const item = { id: uuid(), cover, name, desc, vis, tag };
          data.push(item);
        }

        saveData(data);
        renderAll(data);

        editingId = null;
        form.reset();
        offcanvas.hide();
        submitBtn.textContent = 'Crea';
        titleEl.textContent = 'Crea playlist';
      });
    })
    .catch(err => console.error('Impossibile inizializzare crea-playlist:', err));
})();

