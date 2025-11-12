// scripts/crea-playlist.js
// Offcanvas crea/modifica + card sotto “Buonasera”
// Menu a tre puntini che apre un pannellino interno con pulsanti verdi Modifica/Elimina
// Persistenza su localStorage SOLO per le card create dall’utente

(function () {
  const STORAGE_KEY = 'customPlaylists';
  const CSS_ID = 'createPlaylistStyles';

  // ===== CSS iniettato (verde offcanvas + menu interno card) =====
  const CSS_RULES = `
  /* OFFCANVAS VERDE */
  #offcanvasCreatePlaylist {
    background-color: #1ed760 !important;
    color: #000 !important;
    border-right: 1px solid rgba(0,0,0,0.15) !important;
  }
  #offcanvasCreatePlaylist .offcanvas-header { border-bottom: 1px solid rgba(0,0,0,0.15) !important; }
  #offcanvasCreatePlaylist .offcanvas-title { color: #000 !important; font-weight: 800 !important; letter-spacing: .3px !important; }
  #offcanvasCreatePlaylist .title-label { color: #000 !important; font-weight: 600 !important; }
  #offcanvasCreatePlaylist .form-dark,
  #offcanvasCreatePlaylist .form-dark:focus,
  #offcanvasCreatePlaylist select.form-dark,
  #offcanvasCreatePlaylist textarea.form-dark {
    background-color: #000 !important; color: #fff !important; border: 1px solid #000 !important; box-shadow: none !important;
  }
  #offcanvasCreatePlaylist .form-dark::placeholder { color: #bbb !important; }
  #offcanvasCreatePlaylist .btn-light { background-color: #fff !important; color: #000 !important; border: none !important; }
  #offcanvasCreatePlaylist .btn-light:hover { background-color: #e9e9e9 !important; }
  #offcanvasCreatePlaylist .btn-outline-light { color: #fff !important; border-color: #fff !important; }
  #offcanvasCreatePlaylist .btn-close-white { filter: invert(1) !important; }

  /* MENU INTERNO ALLA CARD (tre puntini) */
  .pl-card-wrap { position: relative; } /* per posizionare il menu interno */
  .pl-menu-toggle {
    border: none; background: transparent; color: #ffffffcc; padding: .25rem .35rem; border-radius: .5rem; transition: background .15s;
  }
  .pl-menu-toggle:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .pl-inline-menu {
    position: absolute; top: 50%; right: .5rem; transform: translateY(-50%);
    display: none; gap: .35rem; align-items: center;
    background: rgba(0,0,0,0.6); /* leggera base scura per separare dal contenuto */
    padding: .35rem; border-radius: .5rem; backdrop-filter: blur(2px);
  }
  .pl-inline-menu.show { display: inline-flex; }
  .pl-inline-menu .btn-spotify {
    background-color: #1ed760 !important; color: #000 !important; border: 1px solid #1ed760 !important;
    padding: .2rem .55rem !important; line-height: 1.1 !important; font-weight: 700 !important; border-radius: .45rem !important;
  }
  .pl-inline-menu .btn-spotify:hover { filter: brightness(0.95); }

  /* assicura che l’immagine non “salti” quando appare il menu */
  .playlist-card { padding-right: 48px; } /* piccolo margine per non sovrapporre i bottoni all’immagine */
  `;

  function ensureCssInjected() {
    if (!document.getElementById(CSS_ID)) {
      const style = document.createElement('style');
      style.id = CSS_ID;
      style.textContent = CSS_RULES;
      document.head.appendChild(style);
    }
  }

  // ===== localStorage helpers =====
  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveData(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  // ===== util =====
  const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2)));
  const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));

  // ===== trova/crea la row target sotto "Buonasera" =====
  function ensureRowTarget() {
    let customRow = document.getElementById('customPlaylistsRow');
    if (customRow) return customRow;

    const h2s = Array.from(document.querySelectorAll('h2'));
    const buona = h2s.find(h => h.textContent.trim().toLowerCase() === 'buonasera');

    let afterNode = null;
    if (buona) {
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

  // ===== rendering =====
  function renderAll(playlists) {
    const row = ensureRowTarget();
    row.innerHTML = '';
    playlists.slice().reverse().forEach(item => row.appendChild(renderCard(item)));
  }

  function renderCard(item) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.dataset.id = item.id;

    col.innerHTML = `
      <div class="d-flex playlist-card align-items-center pl-card-wrap">
        <a href="ARTIST-PAGE.html" class="shrink-0">
          <img src="${escapeHtml(item.cover || './img/PREFERITI.png')}" alt="#" height="100" />
        </a>
        <div class="m-0 ms-2 ms-md-3 flex-grow-1">
          <p class="fw-bold mb-1 text-truncate" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
          <p class="m-0 small text-white-50">
            ${escapeHtml(item.vis || 'Pubblica')}${item.tag ? ' • ' + escapeHtml(item.tag) : ''}${item.desc ? ' • ' + escapeHtml(item.desc) : ''}
          </p>
        </div>

        <!-- Toggle tre puntini -->
        <button class="pl-menu-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Apri menu azioni" data-id="${item.id}">
          <i class="bi bi-three-dots-vertical fs-5"></i>
        </button>

        <!-- Menu interno -->
        <div class="pl-inline-menu" role="menu" aria-hidden="true" data-menu-for="${item.id}">
          <button class="btn btn-spotify btn-sm me-1" data-action="edit" data-id="${item.id}" role="menuitem">Modifica</button>
          <button class="btn btn-spotify btn-sm" data-action="delete" data-id="${item.id}" role="menuitem">Elimina</button>
        </div>
      </div>
    `;
    return col;
  }

  // ===== main flow =====
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

      // stato
      let editingId = null;
      let data = loadData();

      // apri tendina da "Crea playlist" in sidebar
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

      // render iniziale
      renderAll(data);

      // === Delega: toggle menu tre puntini + azioni Modifica/Elimina ===
      const row = ensureRowTarget();

      // chiudi tutti i menu
      function closeAllMenus() {
        document.querySelectorAll('.pl-inline-menu.show').forEach(m => {
          m.classList.remove('show');
          m.setAttribute('aria-hidden', 'true');
        });
        document.querySelectorAll('.pl-menu-toggle[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }

      // toggle menu
      row.addEventListener('click', (e) => {
        const toggle = e.target.closest('.pl-menu-toggle');
        if (toggle) {
          e.stopPropagation();
          const id = toggle.getAttribute('data-id');
          const menu = row.querySelector(`.pl-inline-menu[data-menu-for="${CSS.escape(id)}"]`);
          if (!menu) return;

          // se ce n'è un altro aperto, chiudilo
          if (!menu.classList.contains('show')) closeAllMenus();

          const show = !menu.classList.contains('show');
          if (show) {
            menu.classList.add('show');
            menu.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
          } else {
            menu.classList.remove('show');
            menu.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
          }
          return;
        }

        // click su azione nel menu
        const actionBtn = e.target.closest('button[data-action]');
        if (actionBtn) {
          e.stopPropagation();
          const id = actionBtn.getAttribute('data-id');
          const action = actionBtn.getAttribute('data-action');
          const idx = data.findIndex(p => p.id === id);
          if (idx === -1) return;

          if (action === 'delete') {
            data.splice(idx, 1);
            saveData(data);
            renderAll(data);
            closeAllMenus();
          } else if (action === 'edit') {
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
            closeAllMenus();
          }
        }
      });

      // chiusura menu con click fuori o ESC
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.pl-inline-menu') && !e.target.closest('.pl-menu-toggle')) {
          closeAllMenus();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllMenus();
      });

      // submit: crea o salva modifica
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
          const idx = data.findIndex(p => p.id === editingId);
          if (idx !== -1) data[idx] = { ...data[idx], cover, name, desc, vis, tag };
        } else {
          data.push({ id: uuid(), cover, name, desc, vis, tag });
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


