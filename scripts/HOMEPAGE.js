const searchInput = document.getElementById("searchInput")
const searchResults = document.getElementById("searchResults")
const defaultContent = document.getElementById("defaultContent")
const audioPlayer = document.getElementById("audioPlayer")
const playPauseBtn = document.getElementById("playPauseBtn")
const progressBar = document.getElementById("progressBar")
const currentTimeEl = document.getElementById("currentTime")
const durationEl = document.getElementById("duration")

let currentTrack = null
let searchTimeout

// Search functionality
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout)
  const query = e.target.value.trim()

  if (query.length === 0) {
    searchResults.innerHTML = ""
    defaultContent.style.display = "block"
    return
  }

  searchTimeout = setTimeout(() => {
    searchTracks(query)
  }, 500)
})

async function searchTracks(query) {
  try {
    const response = await fetch(
      `https://striveschool-api.herokuapp.com/api/deezer/search?q=${encodeURIComponent(
        query
      )}`
    )
    const data = await response.json()

    if (data.data && data.data.length > 0) {
      displaySearchResults(data.data)
      defaultContent.style.display = "none"
    } else {
      searchResults.innerHTML =
        '<p class="text-center text-secondary">Nessun risultato trovato</p>'
      defaultContent.style.display = "none"
    }
  } catch (error) {
    console.error("Errore nella ricerca:", error)
    searchResults.innerHTML =
      '<p class="text-center text-danger">Errore nella ricerca</p>'
  }
}

function displaySearchResults(tracks) {
  const resultsHTML = `
          <div class="mx-2 mt-3">
            <h2 class="my-3">Risultati della ricerca</h2>
            <div class="row g-2">
              ${tracks
                .slice(0, 12)
                .map(
                  (track) => `
                <div class="col-12">
                  <div class="track-item p-3 rounded d-flex align-items-center gap-3" onclick='playTrack(${JSON.stringify(
                    track
                  )})'>
                    <img src="${track.album.cover_medium}" alt="${
                    track.title
                  }" class="rounded" style="width: 50px; height: 50px;">
                    <div class="flex-grow-1">
                      <p class="mb-0 fw-semibold">${track.title}</p>
                      <small class="text-secondary">${track.artist.name}</small>
                    </div>
                    <small class="text-secondary d-none d-md-block">${formatDuration(
                      track.duration
                    )}</small>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
  searchResults.innerHTML = resultsHTML
}

function playTrack(track) {
  currentTrack = track

  // Update player UI Desktop
  document.getElementById("playerCover").src = track.album.cover_medium
  document.getElementById("playerTitle").textContent = track.title
  document.getElementById("playerArtist").textContent = track.artist.name

  // Update player UI Mobile
  document.getElementById("playerCoverMobile").src = track.album.cover_medium
  document.getElementById("playerTitleMobile").textContent = track.title
  document.getElementById("playerArtistMobile").textContent = track.artist.name

  // Set audio source
  audioPlayer.src = track.preview
  audioPlayer.play()

  // Update both play buttons
  document
    .getElementById("playPauseBtn")
    .classList.remove("bi-play-circle-fill")
  document.getElementById("playPauseBtn").classList.add("bi-pause-circle-fill")
  document
    .getElementById("playPauseBtnMobile")
    .classList.remove("bi-play-circle-fill")
  document
    .getElementById("playPauseBtnMobile")
    .classList.add("bi-pause-circle-fill")
}

// Play/Pause functionality Desktop
document
  .getElementById("playPauseBtn")
  .addEventListener("click", togglePlayPause)

// Play/Pause functionality Mobile
document
  .getElementById("playPauseBtnMobile")
  .addEventListener("click", togglePlayPause)

function togglePlayPause() {
  if (audioPlayer.paused) {
    audioPlayer.play()
    document
      .getElementById("playPauseBtn")
      .classList.remove("bi-play-circle-fill")
    document
      .getElementById("playPauseBtn")
      .classList.add("bi-pause-circle-fill")
    document
      .getElementById("playPauseBtnMobile")
      .classList.remove("bi-play-circle-fill")
    document
      .getElementById("playPauseBtnMobile")
      .classList.add("bi-pause-circle-fill")
  } else {
    audioPlayer.pause()
    document
      .getElementById("playPauseBtn")
      .classList.remove("bi-pause-circle-fill")
    document.getElementById("playPauseBtn").classList.add("bi-play-circle-fill")
    document
      .getElementById("playPauseBtnMobile")
      .classList.remove("bi-pause-circle-fill")
    document
      .getElementById("playPauseBtnMobile")
      .classList.add("bi-play-circle-fill")
  }
}

// Update progress bar
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

// Auto pause at end
audioPlayer.addEventListener("ended", () => {
  document
    .getElementById("playPauseBtn")
    .classList.remove("bi-pause-circle-fill")
  document.getElementById("playPauseBtn").classList.add("bi-play-circle-fill")
  document
    .getElementById("playPauseBtnMobile")
    .classList.remove("bi-pause-circle-fill")
  document
    .getElementById("playPauseBtnMobile")
    .classList.add("bi-play-circle-fill")
  document.getElementById("progressBar").style.width = "0%"
  document.getElementById("progressBarMobile").style.width = "0%"
})

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
