const url = location.search;
const allP = new URLSearchParams(url);
const albumId = allP.get("id");
console.log("Album ID:", albumId);

fetch("https://striveschool-api.herokuapp.com/api/deezer/album/" + albumId)
  .then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error("Errore nel recupero dei dati dell'album");
    }
  })
  .then((album) => {
    console.log(album);
    document.getElementById("img-album").src = album.cover_medium;
    document.getElementById("name-artist").innerText = album.artist.name;
    document.getElementById("year-album").innerText = new Date(
      album.release_date
    ).getFullYear();
    document.getElementById("num-song").innerText = album.nb_tracks + " brani";
    document.getElementById("name-album").innerText = album.title;
    document.getElementById("img-artist").src = album.artist.picture;
    document.getElementById(
      "link-artist"
    ).href = `ARTIST-PAGE.html?id=${album.artist.id}`;
    album.tracks.data.forEach((track, index) => {
      document.getElementById("album-tracks").innerHTML += `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-3">
            <span class="text-secondary fw-bold fs-5">${index + 1}</span>
            <div>
              <span>${track.title}</span>
              <span class="d-block text-secondary">${album.artist.name}</span>
            </div>
          </div>
          <span>${Math.floor(track.duration / 60)}:${
        track.duration % 60 < 10 ? "0" : ""
      }${track.duration % 60}</span>
        </div>
      `;
    });
  })
  .catch((err) => {
    console.error("Errore:", err);
  });

function Like() {
  const likebtn = document.getElementById("like-button");
  //   fai che diventi verde e quando viene ricliccato ritorni normale
  const greenlike =
    (likebtn.innerHTML = `<i class="bi bi-heart-fill fs-3" style="color:#1ed760;"></i>`);
}

/* =========================
      PLAYER + PREVIEW 30s
========================= */

const AUDIO = document.getElementById("audioPlayer");

// UI desktop
const COVER = document.getElementById("playerCover");
const TITLE = document.getElementById("playerTitle");
const ARTIST = document.getElementById("playerArtist");
const BTN_PLAY = document.getElementById("playPauseBtn");
const BAR = document.getElementById("progressBar");
const CURR = document.getElementById("currentTime");
const DUR = document.getElementById("duration");

// UI mobile
const COVER_M = document.getElementById("playerCoverMobile");
const TITLE_M = document.getElementById("playerTitleMobile");
const ARTIST_M = document.getElementById("playerArtistMobile");
const BTN_PLAY_M = document.getElementById("playPauseBtnMobile");
const BAR_M = document.getElementById("progressBarMobile");

// Icone al centro: shuffle, prev, play/pause, next, repeat
const centerIcons = document.querySelectorAll(
  "#player-footer .d-none.d-md-flex .flex-column .gap-4.mb-1 i"
);

const BTN_SHUFFLE = centerIcons[0];
const BTN_PREV = centerIcons[1];
const BTN_NEXT = centerIcons[3];
const BTN_REPEAT = centerIcons[4];

// Stato player
let trackRows = []; // popolato quando genero le tracce
let currentIndex = -1; // indice della traccia corrente in trackRows
let shuffleOn = false; // shuffle
let repeatMode = "off"; // 'off' | 'one'

// Utility
function formatTime(s) {
  s = Math.floor(s || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}
function setPlayIcon(isPlaying) {
  const icon = isPlaying ? "bi-pause-circle-fill" : "bi-play-circle-fill";
  if (BTN_PLAY) BTN_PLAY.className = `bi ${icon} fs-2 text-white`;
  if (BTN_PLAY_M) BTN_PLAY_M.className = `bi ${icon} fs-2 text-white`;
}
function updateUI(title, artist, cover) {
  if (TITLE) TITLE.textContent = title;
  if (ARTIST) ARTIST.textContent = artist;
  if (COVER) COVER.src = cover;
  if (TITLE_M) TITLE_M.textContent = title;
  if (ARTIST_M) ARTIST_M.textContent = artist;
  if (COVER_M) COVER_M.src = cover;
}

// Crea le righe dei brani e li collega player
fetch("https://striveschool-api.herokuapp.com/api/deezer/album/" + albumId)
  .then((r) => r.json())
  .then((album) => {
    const tracksBox = document.getElementById("album-tracks");
    tracksBox.innerHTML = album.tracks.data
      .map((track, index) => {
        const mins = Math.floor(track.duration / 60);
        const secs = track.duration % 60;
        return `
          <div class="d-flex justify-content-between align-items-center mb-3"
               data-preview="${track.preview}"
               data-title="${track.title.replace(/"/g, "&quot;")}"
               data-artist="${album.artist.name.replace(/"/g, "&quot;")}"
               data-cover="${album.cover_medium}"
               style="cursor:pointer">
            <div class="d-flex align-items-center gap-3">
              <span class="text-secondary fw-bold fs-5">${index + 1}</span>
              <div>
                <span>${track.title}</span>
                <span class="d-block text-secondary">${album.artist.name}</span>
              </div>
            </div>
            <span>${mins}:${secs < 10 ? "0" : ""}${secs}</span>
          </div>
        `;
      })
      .join("");

    trackRows = Array.from(tracksBox.querySelectorAll("[data-preview]"));

    // Click su riga: play preview di quella riga
    tracksBox.addEventListener("click", (e) => {
      const row = e.target.closest("[data-preview]");
      if (!row) return;
      currentIndex = trackRows.indexOf(row);
      playCurrent();
    });

    // Bottoni player
    function togglePlay() {
      if (AUDIO.paused) AUDIO.play();
      else AUDIO.pause();
    }
    BTN_PLAY?.addEventListener("click", togglePlay);
    BTN_PLAY_M?.addEventListener("click", togglePlay);

    BTN_SHUFFLE?.addEventListener("click", () => {
      shuffleOn = !shuffleOn;
      BTN_SHUFFLE.classList.toggle("text-white", shuffleOn);
      BTN_SHUFFLE.classList.toggle("text-white-50", !shuffleOn);
    });

    BTN_REPEAT?.addEventListener("click", () => {
      repeatMode = repeatMode === "off" ? "one" : "off";
      BTN_REPEAT.classList.toggle("text-white", repeatMode === "one");
      BTN_REPEAT.classList.toggle("text-white-50", repeatMode !== "one");
    });

    BTN_NEXT?.addEventListener("click", nextTrack);
    BTN_PREV?.addEventListener("click", prevTrack);

    // Audio events
    AUDIO.addEventListener("play", () => setPlayIcon(true));
    AUDIO.addEventListener("pause", () => setPlayIcon(false));
    AUDIO.addEventListener("ended", () => {
      if (repeatMode === "one") {
        AUDIO.currentTime = 0;
        AUDIO.play();
      } else {
        nextTrack();
      }
    });
    AUDIO.addEventListener("loadedmetadata", () => {
      if (DUR) DUR.textContent = formatTime(AUDIO.duration);
    });
    AUDIO.addEventListener("timeupdate", () => {
      const pct = AUDIO.duration
        ? (AUDIO.currentTime / AUDIO.duration) * 100
        : 0;
      if (BAR) BAR.style.width = `${pct}%`;
      if (BAR_M) BAR_M.style.width = `${pct}%`;
      if (CURR) CURR.textContent = formatTime(AUDIO.currentTime);
    });

    // Seek sulla barra centrale
    const progContainer = BAR?.parentElement;
    if (progContainer) {
      progContainer.style.cursor = "pointer";
      progContainer.addEventListener("click", (e) => {
        const rect = progContainer.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        if (!isNaN(AUDIO.duration)) AUDIO.currentTime = ratio * AUDIO.duration;
      });
    }

    // Helpers: play corrente / next / prev
    function playCurrent() {
      if (currentIndex < 0 || currentIndex >= trackRows.length) return;
      const row = trackRows[currentIndex];
      const { preview, title, artist, cover } = row.dataset;
      AUDIO.src = preview;
      AUDIO.currentTime = 0;
      AUDIO.play().catch(() => {});
      updateUI(title, artist, cover);
      setPlayIcon(true);
    }

    function nextTrack() {
      if (shuffleOn && trackRows.length > 1) {
        let next;
        do {
          next = Math.floor(Math.random() * trackRows.length);
        } while (next === currentIndex);
        currentIndex = next;
      } else {
        currentIndex = (currentIndex + 1) % trackRows.length;
      }
      playCurrent();
    }

    function prevTrack() {
      if (shuffleOn && trackRows.length > 1) {
        let prev;
        do {
          prev = Math.floor(Math.random() * trackRows.length);
        } while (prev === currentIndex);
        currentIndex = prev;
      } else {
        currentIndex = (currentIndex - 1 + trackRows.length) % trackRows.length;
      }
      playCurrent();
    }
  })
  .catch(console.error);

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
