
(function () {
  const CSS_ID = 'createPlaylistStyles';
  const CSS_RULES = `
  /* ===== OFFCANVAS VERDE SPOTIFY ===== */
  #offcanvasCreatePlaylist {
    background-color: #1ed760 !important; /* verde Spotify */
    color: #000 !important;
    border-right: 1px solid rgba(0, 0, 0, 0.15) !important;
  }
  #offcanvasCreatePlaylist .offcanvas-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.15) !important;
  }
  #offcanvasCreatePlaylist .offcanvas-title {
    color: #000 !important;
    font-weight: 800 !important;
    letter-spacing: .3px !important;
  }
  /* Etichette (titoli dei campi): nere */
  #offcanvasCreatePlaylist .title-label {
    color: #000 !important;
    font-weight: 600 !important;
  }
  /* Input/textarea/select: sfondo nero, testo bianco, bordi neri */
  #offcanvasCreatePlaylist .form-dark,
  #offcanvasCreatePlaylist .form-dark:focus,
  #offcanvasCreatePlaylist select.form-dark,
  #offcanvasCreatePlaylist textarea.form-dark {
    background-color: #000 !important;
    color: #fff !important;
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
  #offcanvasCreatePlaylist .form-dark::placeholder {
    color: #bbb !important;
  }
  /* Pulsanti */
  #offcanvasCreatePlaylist .btn-light {
    background-color: #fff !important;
    color: #000 !important;
    border: none !important;
  }
  #offcanvasCreatePlaylist .btn-light:hover {
    background-color: #e9e9e9 !important;
  }
  #offcanvasCreatePlaylist .btn-outline-light {
    color: #fff !important;
    border-color: #fff !important;
  }
  /* Bottone chiudi bianco */
  #offcanvasCreatePlaylist .btn-close-white {
    filter: invert(1) !important;
  }`;

  function ensureCssInjected() {
    if (!document.getElementById(CSS_ID)) {
      const style = document.createElement('style');
      style.id = CSS_ID;
      style.textContent = CSS_RULES;
      document.head.appendChild(style);
    }
  }

  // 1) Carico l'HTML della tendina, estraggo l'elemento offcanvas e lo appendo al body
  fetch('./crea-playlist.html')
    .then(r => r.text())
    .then(html => {
      ensureCssInjected(); 

      const temp = document.createElement('html');
      temp.innerHTML = html;

      const offcanvasNode = temp.querySelector('#offcanvasCreatePlaylist');
      if (!offcanvasNode) throw new Error('Offcanvas non trovato in crea-playlist.html');

      document.body.appendChild(offcanvasNode);

      // Riferimenti
      const offcanvas = new bootstrap.Offcanvas(offcanvasNode);
      const form = offcanvasNode.querySelector('#createPlaylistForm');

      // 2) Trovo/creo il contenitore per le playlist sotto "Buonasera"
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

      // 3) clic su "Crea playlist" nella sidebar
      const sidebarRoot = document.getElementById('sidebar') || document.querySelector('.sidebar');
      if (sidebarRoot) {
        const trigger = Array.from(sidebarRoot.querySelectorAll('p, a, button'))
          .find(el => el.textContent.trim().toLowerCase() === 'crea playlist');
        if (trigger) {
          trigger.style.cursor = 'pointer';
          trigger.addEventListener('click', () => offcanvas.show());
        }
      }

      // 4) crea card sotto "Buonasera"
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

        const row = ensureRowTarget();

        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        col.innerHTML = `
          <div class="d-flex playlist-card align-items-center">
            <a href="ARTIST-PAGE.html" class="shrink-0">
              <img src="${escapeHtml(cover || './img/PREFERITI.png')}" alt="#" height="100" />
            </a>
            <div class="m-0 mx-2 mx-md-3">
              <p class="fw-bold mb-1 text-truncate" title="${escapeHtml(name)}">${escapeHtml(name)}</p>
              <p class="m-0 small text-white-50">
                ${escapeHtml(vis)}${tag ? ' • ' + escapeHtml(tag) : ''}${desc ? ' • ' + escapeHtml(desc) : ''}
              </p>
            </div>
          </div>
        `;

        row.prepend(col);

        form.reset();
        offcanvas.hide();
      });

      function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[s]));
      }
    })
    .catch(err => console.error('Impossibile caricare crea-playlist.html:', err));
})();
