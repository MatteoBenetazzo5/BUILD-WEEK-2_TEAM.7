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
