"use strict";

/* =========================
   CONFIG & UTILITIES
========================= */
const API_BASE = "https://striveschool-api.herokuapp.com/api/deezer";
const SEEDS = [
  "pupo",
  "queen",
  "drake",
  "dua",
  "coldplay",
  "metallica",
  "eminem",
  "ariana",
  "u2",
  "beatles",
  "jazz",
  "rock",
  "pop",
  "classical",
  "muse",
  "taylor",
  // nuovi aggiunti
  "the weeknd",
  "beyonce",
  "billie eilish",
  "rihanna",
  "ed sheeran",
  "lady gaga",
  "justin bieber",
  "shakira",
  "bruno mars",
  "adele",
  "madonna",
  "snoop dogg",
  "kanye west",
  "post malone",
  "avicii",
  "maroon 5",
  "imagine dragons",
  "kendrick lamar",
  "linkin park",
  "green day",
  "shawn mendes",
  "olivia rodrigo",
  "sam smith",
  "blackpink",
  "bts",
  "lana del rey",
  "harry styles",
  "tiziano ferro",
  "maneskin",
  "elton john",
  "sting",
  "abba",
  "david guetta",
  "lizzo",
  "doja cat",
  "miley cyrus",
  "flo rida",
  "twenty one pilots",
  "red hot chili peppers",
  "the rolling stones",
  "pink floyd",
  "bob marley",
  "john legend",
  "celine dion",
  "frank sinatra",
  "mozart",
  "beethoven",
  "vivaldi",
  "chopin",
  "andrea bocelli",
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

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* =========================
   ALBUMS GRID (HOME)
========================= */
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
      <div class="card bg-dark text-white h-100 album-card" data-album-id="${
        alb.id
      }" style="cursor:pointer">
        <img src="${alb.cover}" class="card-img-top" alt="cover ${escapeHtml(
      alb.title
    )}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${escapeHtml(alb.title)}</h5>
          <p class="card-text text-white-50 mb-0">
            <a href="artist.html?id=${
              alb.artistId
            }" class="text-decoration-none text-white-50 artist-link">
              ${escapeHtml(alb.artistName)}
            </a>
          </p>
        </div>
      </div>
    `;

    // click sulla card → album.html?id=...
    col.querySelector(".album-card").addEventListener("click", (e) => {
      if (e.target.closest(".artist-link")) return; // se clicco sul nome artista, non aprire l'album
      location.href = `ALBUM-PAGE.html?id=${alb.id}`;
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
    const albums = await getRandomAlbums(20);
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

/* =========================
   SEARCH + PLAYER
========================= */
let currentTrack = null;
let searchTimeout;

async function searchTracks(query) {
  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      displaySearchResults(data.data);
      const defaultContent = document.getElementById("defaultContent");
      if (defaultContent) defaultContent.style.display = "none";
    } else {
      const searchResults = document.getElementById("searchResults");
      if (searchResults) {
        searchResults.innerHTML =
          '<p class="text-center text-secondary">Nessun risultato trovato</p>';
      }
      const defaultContent = document.getElementById("defaultContent");
      if (defaultContent) defaultContent.style.display = "none";
    }
  } catch (error) {
    console.error("Errore nella ricerca:", error);
    const searchResults = document.getElementById("searchResults");
    if (searchResults) {
      searchResults.innerHTML =
        '<p class="text-center text-danger">Errore nella ricerca</p>';
    }
  }
}

function displaySearchResults(tracks) {
  const searchResults = document.getElementById("searchResults");
  if (!searchResults) return;

  // Costruisco HTML con data-index per evitare JSON inline nell'onclick
  const html = `
    <div class="mx-2 mt-3">
      <h2 class="my-3">Risultati della ricerca</h2>
      <div class="row g-2">
        ${tracks
          .slice(0, 12)
          .map(
            (_track, i) => `
          <div class="col-12">
            <div class="track-item p-3 rounded d-flex align-items-center gap-3" data-index="${i}" style="cursor:pointer;">
              <img src="${_track.album.cover_medium}" alt="${escapeHtml(
              _track.title
            )}" class="rounded" style="width: 50px; height: 50px;">
              <div class="flex-grow-1">
                <p class="mb-0 fw-semibold">${escapeHtml(_track.title)}</p>
                <small class="text-secondary">${escapeHtml(
                  _track.artist.name
                )}</small>
              </div>
              <small class="text-secondary d-none d-md-block">${formatDuration(
                _track.duration
              )}</small>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
  searchResults.innerHTML = html;

  // Bind click per ogni track-item
  searchResults.querySelectorAll(".track-item").forEach((el) => {
    const idx = Number(el.getAttribute("data-index"));
    const track = tracks[idx];
    el.addEventListener("click", () => playTrack(track));
  });
}

function playTrack(track) {
  currentTrack = track;

  // Update player UI Desktop
  const cover = document.getElementById("playerCover");
  const title = document.getElementById("playerTitle");
  const artist = document.getElementById("playerArtist");

  if (cover) cover.src = track.album.cover_medium;
  if (title) title.textContent = track.title;
  if (artist) artist.textContent = track.artist.name;

  // Update player UI Mobile
  const coverM = document.getElementById("playerCoverMobile");
  const titleM = document.getElementById("playerTitleMobile");
  const artistM = document.getElementById("playerArtistMobile");

  if (coverM) coverM.src = track.album.cover_medium;
  if (titleM) titleM.textContent = track.title;
  if (artistM) artistM.textContent = track.artist.name;

  // Set audio source (Deezer preview 30s)
  const audioPlayer = document.getElementById("audioPlayer");
  if (!track.preview) {
    console.warn("Nessuna preview disponibile per questo brano.");
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.removeAttribute("src");
    }
    alert("Nessuna preview disponibile per questo brano.");
    return;
  }

  if (audioPlayer) {
    audioPlayer.src = track.preview;
    audioPlayer.play().catch((e) => console.error(e));
  }

  // Update both play buttons
  const playBtn = document.getElementById("playPauseBtn");
  const playBtnM = document.getElementById("playPauseBtnMobile");
  playBtn && playBtn.classList.remove("bi-play-circle-fill");
  playBtn && playBtn.classList.add("bi-pause-circle-fill");
  playBtnM && playBtnM.classList.remove("bi-play-circle-fill");
  playBtnM && playBtnM.classList.add("bi-pause-circle-fill");
}

function togglePlayPause() {
  const audioPlayer = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playPauseBtn");
  const playBtnM = document.getElementById("playPauseBtnMobile");
  if (!audioPlayer) return;

  if (audioPlayer.paused) {
    audioPlayer.play().catch((e) => console.error(e));
    playBtn && playBtn.classList.remove("bi-play-circle-fill");
    playBtn && playBtn.classList.add("bi-pause-circle-fill");
    playBtnM && playBtnM.classList.remove("bi-play-circle-fill");
    playBtnM && playBtnM.classList.add("bi-pause-circle-fill");
  } else {
    audioPlayer.pause();
    playBtn && playBtn.classList.remove("bi-pause-circle-fill");
    playBtn && playBtn.classList.add("bi-play-circle-fill");
    playBtnM && playBtnM.classList.remove("bi-pause-circle-fill");
    playBtnM && playBtnM.classList.add("bi-play-circle-fill");
  }
}

/* =========================
   STARBOY PLAY FUNCTION
========================= */
async function playStarboy() {
  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent("Starboy The Weeknd")}`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const starboy = data.data[0];
      playTrack(starboy);
    } else {
      alert("Impossibile trovare Starboy");
    }
  } catch (error) {
    console.error("Errore nel caricamento di Starboy:", error);
    alert("Errore nel caricamento della canzone");
  }
}

/* =========================
   BOOTSTRAP SCRIPT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Albums iniziali
  initAlbums();

  // Riferimenti DOM per search e blocchi
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const defaultContent = document.getElementById("defaultContent");

  // Player refs
  const audioPlayer = document.getElementById("audioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playPauseBtnMobile = document.getElementById("playPauseBtnMobile");
  const progressBar = document.getElementById("progressBar");
  const progressBarMobile = document.getElementById("progressBarMobile");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");

  // STARBOY
  const playStarboyBtn = document.getElementById("playStarboyBtn");
  if (playStarboyBtn) {
    playStarboyBtn.addEventListener("click", playStarboy);
  }

  // Volume Control
  const volumeControl = document.getElementById("volumeControl");
  const volumeIcon = document.getElementById("volumeIcon");

  if (volumeControl && audioPlayer) {
    // Imposta il volume iniziale
    audioPlayer.volume = 0.6;

    // Listener per il cambio di volume
    volumeControl.addEventListener("input", (e) => {
      const value = e.target.value;
      audioPlayer.volume = value / 100;

      // Aggiorna l'icona
      if (value == 0) {
        volumeIcon.className = "bi bi-volume-mute text-white-50";
      } else if (value < 50) {
        volumeIcon.className = "bi bi-volume-down text-white-50";
      } else {
        volumeIcon.className = "bi bi-volume-up text-white-50";
      }
    });

    // Click sull'icona volume per mute/unmute
    let previousVolume = 60;
    volumeIcon?.addEventListener("click", () => {
      if (volumeControl.value > 0) {
        previousVolume = volumeControl.value;
        volumeControl.value = 0;
        audioPlayer.volume = 0;
        volumeIcon.className = "bi bi-volume-mute text-white-50";
      } else {
        volumeControl.value = previousVolume;
        audioPlayer.volume = previousVolume / 100;
        if (previousVolume < 50) {
          volumeIcon.className = "bi bi-volume-down text-white-50";
        } else {
          volumeIcon.className = "bi bi-volume-up text-white-50";
        }
      }
    });
  }

  // Search: input con debounce
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length === 0) {
        if (searchResults) searchResults.innerHTML = "";
        if (defaultContent) defaultContent.style.display = "block";
        return;
      }

      searchTimeout = setTimeout(() => {
        searchTracks(query);
      }, 500);
    });
  }

  // Play/Pause
  playPauseBtn && playPauseBtn.addEventListener("click", togglePlayPause);
  playPauseBtnMobile &&
    playPauseBtnMobile.addEventListener("click", togglePlayPause);

  // Update progress bar e tempi
  if (audioPlayer) {
    audioPlayer.addEventListener("timeupdate", () => {
      if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (progressBar) progressBar.style.width = progress + "%";
        if (progressBarMobile) progressBarMobile.style.width = progress + "%";
        if (currentTimeEl)
          currentTimeEl.textContent = formatDuration(audioPlayer.currentTime);
        if (durationEl)
          durationEl.textContent = formatDuration(audioPlayer.duration);
      }
    });

    // Aggiorna la durata quando metadati caricati
    audioPlayer.addEventListener("loadedmetadata", () => {
      if (durationEl)
        durationEl.textContent = formatDuration(audioPlayer.duration || 0);
    });

    // Auto reset a fine preview
    audioPlayer.addEventListener("ended", () => {
      const playBtn = document.getElementById("playPauseBtn");
      const playBtnM = document.getElementById("playPauseBtnMobile");
      playBtn && playBtn.classList.remove("bi-pause-circle-fill");
      playBtn && playBtn.classList.add("bi-play-circle-fill");
      playBtnM && playBtnM.classList.remove("bi-pause-circle-fill");
      playBtnM && playBtnM.classList.add("bi-play-circle-fill");
      if (progressBar) progressBar.style.width = "0%";
      if (progressBarMobile) progressBarMobile.style.width = "0%";
    });
  }
});

/* =========================
   ICONE EXTRA SULLA PARTE DESTRA DELLA BARRA
========================= */

const ICON_FULLSCREEN = document.querySelector(
  "#player-footer .bi-arrows-fullscreen"
);

// FULLSCREEN → entra/esci da schermo intero
ICON_FULLSCREEN?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    ICON_FULLSCREEN.classList.replace(
      "bi-arrows-fullscreen",
      "bi-fullscreen-exit"
    );
  } else {
    document.exitFullscreen();
    ICON_FULLSCREEN.classList.replace(
      "bi-fullscreen-exit",
      "bi-arrows-fullscreen"
    );
  }
});
