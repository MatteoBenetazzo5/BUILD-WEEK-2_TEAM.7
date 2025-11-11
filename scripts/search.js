const API_BASE = "https://striveschool-api.herokuapp.com/api/deezer"
let currentTrack = null
let searchTimeout

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

async function searchTracks(query) {
  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    if (data.data && data.data.length > 0) {
      displaySearchResults(data.data)
      document.getElementById("defaultContent").style.display = "none"
    } else {
      document.getElementById("searchResults").innerHTML =
        '<p class="text-center text-secondary py-4">Nessun risultato trovato</p>'
      document.getElementById("defaultContent").style.display = "none"
    }
  } catch (error) {
    console.error("Errore nella ricerca:", error)
    document.getElementById("searchResults").innerHTML =
      '<p class="text-center text-danger py-4">Errore nella ricerca</p>'
  }
}

function displaySearchResults(tracks) {
  const searchResults = document.getElementById("searchResults")
  const html = `
        <h2 class="fs-3 fw-bold mb-3">Brani</h2>
        <div class="mb-5">
          ${tracks
            .slice(0, 12)
            .map(
              (track, i) => `
            <div class="track-item p-3 d-flex align-items-center gap-3" data-index="${i}">
              <img src="${track.album.cover_medium}" alt="${escapeHtml(
                track.title
              )}" style="width: 56px; height: 56px; border-radius: 4px;">
              <div class="flex-grow-1" style="min-width: 0;">
                <p class="mb-0 fw-normal text-truncate">${escapeHtml(
                  track.title
                )}</p>
                <small class="text-secondary d-block text-truncate">${escapeHtml(
                  track.artist.name
                )}</small>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `
  searchResults.innerHTML = html

  searchResults.querySelectorAll(".track-item").forEach((el) => {
    const idx = Number(el.getAttribute("data-index"))
    const track = tracks[idx]
    el.addEventListener("click", () => playTrack(track))
  })
}

function playTrack(track) {
  currentTrack = track

  // Update Desktop
  document.getElementById("playerCover").src = track.album.cover_medium
  document.getElementById("playerTitle").textContent = track.title
  document.getElementById("playerArtist").textContent = track.artist.name

  // Update Mobile
  document.getElementById("playerCoverMobile").src = track.album.cover_medium
  document.getElementById("playerTitleMobile").textContent = track.title
  document.getElementById("playerArtistMobile").textContent = track.artist.name

  const audioPlayer = document.getElementById("audioPlayer")

  if (!track.preview) {
    alert("Nessuna preview disponibile per questo brano.")
    return
  }

  audioPlayer.src = track.preview
  audioPlayer.play().catch((e) => console.error(e))

  // Update play buttons
  const playBtn = document.getElementById("playPauseBtn")
  const playBtnM = document.getElementById("playPauseBtnMobile")
  playBtn.classList.remove("bi-play-circle-fill")
  playBtn.classList.add("bi-pause-circle-fill")
  playBtnM.classList.remove("bi-play-circle-fill")
  playBtnM.classList.add("bi-pause-circle-fill")
}

function togglePlayPause() {
  const audioPlayer = document.getElementById("audioPlayer")
  const playBtn = document.getElementById("playPauseBtn")
  const playBtnM = document.getElementById("playPauseBtnMobile")

  if (audioPlayer.paused) {
    audioPlayer.play().catch((e) => console.error(e))
    playBtn.classList.remove("bi-play-circle-fill")
    playBtn.classList.add("bi-pause-circle-fill")
    playBtnM.classList.remove("bi-play-circle-fill")
    playBtnM.classList.add("bi-pause-circle-fill")
  } else {
    audioPlayer.pause()
    playBtn.classList.remove("bi-pause-circle-fill")
    playBtn.classList.add("bi-play-circle-fill")
    playBtnM.classList.remove("bi-pause-circle-fill")
    playBtnM.classList.add("bi-play-circle-fill")
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput")
  const audioPlayer = document.getElementById("audioPlayer")

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout)
    const query = e.target.value.trim()

    if (query.length === 0) {
      document.getElementById("searchResults").innerHTML = ""
      document.getElementById("defaultContent").style.display = "block"
      return
    }

    searchTimeout = setTimeout(() => searchTracks(query), 500)
  })

  // Play/Pause buttons
  document
    .getElementById("playPauseBtn")
    .addEventListener("click", togglePlayPause)
  document
    .getElementById("playPauseBtnMobile")
    .addEventListener("click", togglePlayPause)

  // Progress bar update
  audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration) {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100
      document.getElementById("progressBar").style.width = progress + "%"
      document.getElementById("progressBarMobile").style.width = progress + "%"
      document.getElementById("currentTime").textContent = formatDuration(
        audioPlayer.currentTime
      )
      document.getElementById("duration").textContent = formatDuration(
        audioPlayer.duration
      )
    }
  })

  audioPlayer.addEventListener("ended", () => {
    const playBtn = document.getElementById("playPauseBtn")
    const playBtnM = document.getElementById("playPauseBtnMobile")
    playBtn.classList.remove("bi-pause-circle-fill")
    playBtn.classList.add("bi-play-circle-fill")
    playBtnM.classList.remove("bi-pause-circle-fill")
    playBtnM.classList.add("bi-play-circle-fill")
    document.getElementById("progressBar").style.width = "0%"
    document.getElementById("progressBarMobile").style.width = "0%"
  })
})
