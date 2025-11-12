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
              createLi.className = "d-flex mb-3 li-height";
              createLi.innerHTML = `
                <div class="d-flex align-items-center">
                  <p class="uniform-numbers">${i + 1}</p>
                  <img src="${
                    track.album.cover
                  }" width="50" height="50" alt="img" class="ms-4" />
                </div>
                <p class="ms-3 m-0 w-25 flex-grow-1 d-flex flex-column">
                  ${track.title}
                  <span class="d-md-none">300.440.213</span>
                </p>
                <p class="w-25 text-end d-none d-md-block m-0">${track.rank}</p>
                <p class="w-25 text-end d-none d-md-block m-0">${tempoFormattato}</p>
                <i class="d-md-none bi bi-three-dots-vertical fs-2"></i>
              `;
              olContainer.appendChild(createLi);
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
