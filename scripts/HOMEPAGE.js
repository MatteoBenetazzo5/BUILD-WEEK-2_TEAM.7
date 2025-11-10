// Popola #albumsGrid con 10 album casuali dall'API Deezer (proxy Strive)

const API_BASE = "https://striveschool-api.herokuapp.com/api/deezer";
const SEEDS = [
  "queen","drake","dua","coldplay","metallica","eminem","ariana",
  "u2","beatles","jazz","rock","pop","classical","muse","taylor"
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getRandomAlbums(limit = 10) {
  const seed = pickRandom(SEEDS);
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(seed)}`);
  if (!res.ok) throw new Error("Errore nella fetch di ricerca");
  const { data } = await res.json(); // { data: tracks[] }

  const byAlbumId = new Map();
  for (const track of data || []) {
    const alb = track.album;
    const art = track.artist;
    if (alb && art && !byAlbumId.has(alb.id)) {
      byAlbumId.set(alb.id, {
        id: alb.id,
        title: alb.title,
        cover: alb.cover_medium || alb.cover || "",
        artistName: art.name,
        artistId: art.id,
      });
    }
  }

  const albums = Array.from(byAlbumId.values());
  shuffleInPlace(albums);
  return albums.slice(0, limit);
}

function renderAlbumsGrid(albums) {
  const grid = document.getElementById("albumsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  albums.forEach((alb) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card bg-dark text-white h-100 album-card" data-album-id="${alb.id}" style="cursor:pointer">
        <img src="${alb.cover}" class="card-img-top" alt="cover ${escapeHtml(alb.title)}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${escapeHtml(alb.title)}</h5>
          <p class="card-text text-white-50 mb-0">
            <a href="artist.html?id=${alb.artistId}" class="text-decoration-none text-white-50 artist-link">
              ${escapeHtml(alb.artistName)}
            </a>
          </p>
        </div>
      </div>
    `;

    // click sulla card → album.html?id=...
    col.querySelector(".album-card").addEventListener("click", (e) => {
      if (e.target.closest(".artist-link")) return; // se clicco sul nome artista, non aprire l'album
      location.href = `album.html?id=${alb.id}`;
    });

    grid.appendChild(col);
  });
}

async function initAlbums() {
  const grid = document.getElementById("albumsGrid");
  if (!grid) return;
  try {
    grid.innerHTML = `
      <div class="col-12">
        <div class="text-center text-white-50 py-4">Caricamento album...</div>
      </div>`;
    const albums = await getRandomAlbums(10);
    renderAlbumsGrid(albums);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          Non riesco a caricare gli album. Riprova più tardi.
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initAlbums);
