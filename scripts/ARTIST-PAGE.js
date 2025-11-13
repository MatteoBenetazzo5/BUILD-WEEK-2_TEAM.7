const API = "https://striveschool-api.herokuapp.com/api/deezer/artist/";
const params = new URLSearchParams(window.location.search).get("id");

const getArtistInfo = function () {
  fetch(API + params)
    .then((res) => {
      if (!res.ok) throw new Error("bro guarda il", res.status);
      return res.json();
    })
    .then((artist) => {
      document.getElementById("banner").src = artist.picture_xl;
      document.getElementById("name-artist").innerText = artist.name;
      document.getElementById("little-icon").src = artist.picture;
      document.getElementById("little-icon-desktop").src = artist.picture;
      console.log(artist.tracklist);
      fetch(artist.tracklist)
        .then((resp) => {
          if (!resp.ok) throw new Error(resp.status, "not ok");
          return resp.json();
        })
        .then((tList) => {
          console.log(tList.data);
          const allTracks = tList.data;
          const olContainer = document.getElementById("ol-container");

          let visibleCount = 5;

          function renderTracks() {
            olContainer.innerHTML = "";

            const toShow = allTracks.slice(0, visibleCount);
            toShow.forEach((track, i) => {
              const minuti = Math.floor(track.duration / 60);
              const secondi = track.duration % 60;
              const tempoFormattato = `${minuti}:${secondi
                .toString()
                .padStart(2, "0")}`;

              const createLi = document.createElement("li");
              createLi.className = "d-flex li-hover align-items-center";
              createLi.innerHTML = `
                <div class="d-flex align-items-center">
                  <p class="uniform-numbers mb-0">${i + 1}</p>
                  <img src="${
                    track.album.cover
                  }" width="40" height="40" alt="img" class="ms-3 rounded-2" />
                </div>
                <p class="ms-3 m-0 w-25 flex-grow-1 d-flex flex-column text-white track-title">
                  ${track.title}
                  <span class="d-md-none">${track.rank}</span>
                </p>
                <p class="w-25 text-end d-none d-md-block m-0">${track.rank}</p>
                <p class="w-25 text-end d-none d-md-block m-0">${tempoFormattato}</p>
                <i class="d-md-none bi bi-three-dots-vertical fs-2"></i>
              `;
              olContainer.appendChild(createLi);
              createLi.addEventListener("mouseenter", () => {
                const numberEl = createLi.querySelector(".uniform-numbers");
                if (!numberEl) return;
                if (!numberEl.dataset.original) {
                  numberEl.dataset.original = numberEl.textContent;
                }
                const audio = document.getElementById("audioPlayer");
                const isPlaying =
                  audio &&
                  !audio.paused &&
                  audio.dataset.currentTrack === track.id.toString();
                if (!isPlaying) {
                  numberEl.innerHTML = `<i class="bi bi-play-fill"></i>`;
                } else {
                  numberEl.innerHTML = `<i class="bi bi-pause-fill"></i>`;
                }
                const icon = numberEl.querySelector("i");
                if (!numberEl.dataset.listenerAdded) {
                  numberEl.dataset.listenerAdded = "true";
                  numberEl.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!audio) {
                      audio = document.createElement("audio");
                      audio.id = "audioPlayer";
                      audio.style.display = "none";
                      document.body.appendChild(audio);
                    }
                    if (
                      audio.dataset.currentTrack === track.id.toString() &&
                      !audio.paused
                    ) {
                      audio.pause();
                      icon.classList.replace("bi-pause-fill", "bi-play-fill");
                    } else {
                      document
                        .querySelectorAll(".bi-pause-fill")
                        .forEach((el) => {
                          el.classList.replace("bi-pause-fill", "bi-play-fill");
                        });
                      audio.src = track.preview;
                      audio.dataset.currentTrack = track.id;
                      audio.play();
                      icon.classList.replace("bi-play-fill", "bi-pause-fill");
                    }
                  });
                }
              });

              createLi.addEventListener("mouseleave", () => {
                const numberEl = createLi.querySelector(".uniform-numbers");
                const audio = document.getElementById("audioPlayer");

                const isPlaying =
                  audio &&
                  !audio.paused &&
                  audio.dataset.currentTrack === track.id.toString();

                if (!isPlaying && numberEl && numberEl.dataset.original) {
                  numberEl.textContent = numberEl.dataset.original;
                }
              });

              createLi.addEventListener("mouseleave", () => {
                const numberEl = createLi.querySelector(".uniform-numbers");
                if (numberEl && numberEl.dataset.original) {
                  numberEl.textContent = numberEl.dataset.original;
                }
              });
            });
            const btn = document.getElementById("load-more");
            if (visibleCount >= allTracks.length) {
              btn.style.display = "none";
            } else {
              btn.style.display = "block";
            }
          }
          const loadMoreBtn = document.getElementById("load-more");
          loadMoreBtn.addEventListener("click", () => {
            visibleCount += 5;
            renderTracks();
          });

          renderTracks();
        })
        .catch((error) => {
          console.log("fetch dentro al fetch:", error);
        });
    })
    .catch((err) => {
      console.log("attenzione,siamo nel catch", err);
    });
};

getArtistInfo();
