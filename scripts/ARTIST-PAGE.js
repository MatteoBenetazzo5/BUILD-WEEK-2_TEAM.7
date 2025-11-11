const API = "https://striveschool-api.herokuapp.com/api/deezer";
const SEEDS = [
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
];

const params = new URLSearchParams(window.location.search).get("id");
console.log(params)

const getData = function () {
  fetch(API)
    .then((arr) => {
      console.log(arr);
    })
    .catch((err) => {
      console.log("attenzione,siamo nel catch", err);
    });
};
