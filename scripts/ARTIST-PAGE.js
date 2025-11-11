const API = "https://striveschool-api.herokuapp.com/api/deezer/";
const params = new URLSearchParams(window.location.search).get("id");

const getArtistInfo = function (endpoint) {
  fetch(API + endpoint + "/" + params)
    .then((res) => {
      if (!res.ok) throw new Error("bro guarda il", res.status);
      return res.json();
    })
    .then((artist) => {
      console.log(artist);
      if (endpoint === "artist") {
        document.getElementById("banner").src = artist.picture_xl;
        document.getElementById("name-artist").innerText = artist.name;
        document.getElementById("little-icon").src = artist.picture;
        document.getElementById("little-icon-desktop").src = artist.picture;
      }
      if (endpoint === "album") {
      }
    })
    .catch((err) => {
      console.log("attenzione,siamo nel catch", err);
    });
};

getArtistInfo("artist");
getArtistInfo("album");
