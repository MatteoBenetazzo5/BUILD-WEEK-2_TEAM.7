const API = "https://striveschool-api.herokuapp.com/api/deezer/artist/";
const params = new URLSearchParams(window.location.search).get("id");
console.log(API);



const getData = function () {
  fetch(API + params)
    .then((res) => {
      if (!res.ok) throw new Error("bro guarda il", res.status);
      return res.json();
    })
    .then((arr) => {
      console.table(arr);
      document.getElementById("banner").src;
    })
    .catch((err) => {
      console.log("attenzione,siamo nel catch", err);
    });
};

getData();
