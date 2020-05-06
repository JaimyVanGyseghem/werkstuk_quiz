// functie die de highscore ophaalt uit de localstorage om toe te voegen aan de DOM
export function showHighScore() {
  let myScoreHere = document.querySelector('#myScoreHere');

  let setScore = localStorage.getItem("points");

  myScoreHere.innerHTML = 'your highscore is ' + setScore + ' / 10';

}