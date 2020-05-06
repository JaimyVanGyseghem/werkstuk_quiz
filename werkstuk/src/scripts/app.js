import '../styles/main.css';
import './highScore';
import './printOptions';

//global variables
let app = document.querySelector('#app');
let voorkeuren = document.querySelector('#voorkeuren');
let showMyScore = document.querySelector('#showMyScores');
let api = 'https://opentdb.com/api.php?amount=10&type=multiple';

// navigo router
import Navigo from 'navigo';
import nunjucks from 'nunjucks';

nunjucks.configure('templates', {
  autoescape: true
});
let router = new Navigo(window.location.origin, true, '#!'); // initiate router
router.updatePageLinks(); // detects data-navigo attribute and translate links to routed links

router.on({
  '/': () => {
    console.log('home');
    app.style.display = "none";
    voorkeuren.style.display = "block";
    showMyScore.style.display = "none";
    printOptions();
  },
  'quiz': () => {
    console.log('quiz');
    app.style.display = "block";
    voorkeuren.style.display = "none";
    showMyScore.style.display = "none";
    quiz();
  },
  'topscore': () => {
    showMyScore.style.display = "block";
    app.style.display = "none";
    voorkeuren.style.display = "none";
    showHighScore()
  },
}).resolve();

let arrForWrongAnswers = [];

function quiz() {
  // items uit de DOM halen
  let app = document.querySelector('#app');
  let awnsers = document.querySelector('.awnsers');
  let question = document.querySelector('#question');
  let pointsOnScreen = document.querySelector('#points');
  let currentQuestion = document.querySelector('#currentQuestion');
  // globale variable (in deze functie);
  let points = 0;
  let questions = [];

  // als ze gegevens uit de localstorage kunnen halen gaan zie die gebruiken bij de volgende keer ze de quiz bezoeken
  function checkForDifficultyAndCategory() {
    let category = localStorage.getItem('category');
    let diff = localStorage.getItem('diff');

    if (category !== null) {
      if (category !== 'all') {
        api += `&category=${category}`;
      }
    }

    if (diff !== null) {
      if (diff !== 'all') {
        api += `&difficulty=${diff}`;
      }
    }

    console.log(api);
  }
  // API ophalen
  function getTheQuestions() {
    checkForDifficultyAndCategory();
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', api);
    xhr.send();
    xhr.onerror = () => {
      console.log('jammer kameraad, het is niet gelukt');
    }
    xhr.onprogress = () => {
      console.log('wachteuuuuh');
    }
    xhr.onload = () => {
      console.log('succes');
      let status = xhr.status;
      console.log(status)
      if (status == 200) {
        let result = xhr.response;
        questions = result.results;
        console.log(result);
        addToDOM();
      } else {
        console.log('nope');
      }
    }
  }

  let questionCount = 1;
  let index = 0;


  // functie om al de gegevens in de dom te zetten
  function addToDOM() {
    // array voor al de antwoorden
    let allTheAnswers = [];

    // loop door de foute antwoorden en push die in de array 'allTheAnswers'
    for (let i = 0; i < 3; i++) {
      allTheAnswers.push(questions[index].incorrect_answers[i]);
    }
    // push het juiste antwoord ook in de array 'allTheAnswers'
    allTheAnswers.push(questions[index].correct_answer);
    // console.log(questions[index].correct_answer);
    // shuffle de antwoorden in de array zodat ze op andere posities staan
    shuffle(allTheAnswers);

    // hier komt de vraag in de DOM
    question.innerHTML = `${questions[index].question}`;
    // hier komt het nummer van de vraag in de DOM
    currentQuestion.innerHTML = `Question: ${questionCount} <span>/ 10 </span>`
    // hier komen de mogelijke antwoorden in de DOM
    awnsers.innerHTML = ` 
      <div>
      <div>
      <input type="radio" name="radioAnswer" value="${allTheAnswers[0]}">
      <label >${allTheAnswers[0]}</label>
      </div>
      <div>
      <input type="radio" name="radioAnswer" value="${allTheAnswers[1]}"">
      <label>${allTheAnswers[1]}</label>
      </div>
      </div>
      <div>
      <div>
      <input type="radio" name="radioAnswer" value="${allTheAnswers[2]}"">
      <label>${allTheAnswers[2]}</label>
      </div>
      <div>
      <input type="radio" name="radioAnswer" value="${allTheAnswers[3]}"">
      <label>${allTheAnswers[3]}</label>
      </div>
      </div>
      <input id="submit" type="submit" value="submit">
 
  `;
    // de error message komt altijd op none te staan behalve als de user geen antwoord geselecteerd heeft en toch verder wilt gaan
    error.style.display = 'none';

    let selectedValue;
    console.log(points);

    //als je op de submit butten druk moeten er bepaalde acties gebeuren
    let submitBtn = document.querySelector('#submit');
    let timer = document.querySelector('#timer');

    // uitbereiding

      let timerForQuestions = setTimeout(function () {
        if (questionCount < 10) {
          console.log('test');
          questionCount += 1;
          index += 1;
          addToDOM();
        } else {
          // toon uw score maar heb geen tijd meer want het is nu 16:28 (voor de volledige quiz deze interval dus uitzetten)
        }
      }, 5000);
    
    submitBtn.addEventListener('click', function () {
      clearTimeout(timerForQuestions);
      let radioBtn = document.getElementsByName('radioAnswer');

      // als er een antwoord aangeduid is moet het bepaalde acties ondergaan
      if (radioBtn[0].checked || radioBtn[1].checked || radioBtn[2].checked || radioBtn[3].checked) {
        radioBtn.forEach(radio => {
          if (radio.checked) {
            // als je een antwoord aangeduid hebt steek die in een variable, als het aangeduide antwoord juist is = +1 anders steek je het in de array 'arrForWrongAnswers'
            selectedValue = radio.value;
            if (selectedValue == questions[index].correct_answer) {
              points += 1;
            } else {
              arrForWrongAnswers.push([questions[index].question, questions[index].correct_answer, selectedValue]);
            }
          }
        });

        console.log(points);

        // als je je 10 vragen gehad hebt moet het bepaalde acties ondergaan
        if (questionCount >= 10) {

          // Hier decladeer je wat er in de DOM moet komen: je punten, alle foute antwoorden en een knop
          pointsOnScreen.innerHTML = '<p>Your score is: ' + points + ' / 10 </p> <button id="refresBtn">Try again </button>';
          pointsOnScreen.innerHTML += '<p id="wrongTitle">Wrong answers:</p>'
          for (let i = 0; i < arrForWrongAnswers.length; i++) {

            pointsOnScreen.innerHTML += `<div class="wrong"><h2>${arrForWrongAnswers[i][0]}</h2> <p> <span id="false">Your answer: ${arrForWrongAnswers[i][2]}</span> <span id="correct">correct answer: ${arrForWrongAnswers[i][1]}</p></span></div>`;

          }

          // als je op de knop drukt reset de quiz terug naar het begin
          let refresBtn = document.querySelector('#refresBtn');
          refresBtn.addEventListener('click', function () {
            questionCount = 1;
            index = 0;
            points = 0;
            getTheQuestions();
            pointsOnScreen.style.display = 'none';
            app.style.display = 'block';
          });
          // overgang van quiz naar de totale score
          pointsOnScreen.style.display = 'block';
          app.style.display = 'none';

          // als er al een score zit in je localstorage, vergelijk die dan met de punten dat je gescoord hebt. Als het groter is vervang je de hogere score
          if (localStorage.getItem('points') !== null) {
            const topscorePoints = parseInt(localStorage.getItem('points'));
            if (points > topscorePoints) {
              localStorage.setItem("points", points);
            } else {
              console.log('je hebt niet meer punten gescoord');
            }
          } // zit er nog geen score in de localstorage? zet dan je eerste score er in
          else {
            localStorage.setItem("points", points);
          }

        } // is de vragen minder dan 10? dan geef je de volgende vraag
        else {
          questionCount += 1;
          index += 1;
          addToDOM();
        }
      } // als er geen antwoord aangeduid is moet het een error message weergeven
      else {
        let error = document.querySelector('#error');
        error.style.display = 'block';
      }
    });

  }

  // functie om je array te shuffelen
  function shuffle(array) {
    let myIndexOfArray = array.length,
      someValue, randomIndex;

    while (0 !== myIndexOfArray) {

      randomIndex = Math.floor(Math.random() * myIndexOfArray);
      myIndexOfArray -= 1;

      someValue = array[myIndexOfArray];
      array[myIndexOfArray] = array[randomIndex];
      array[randomIndex] = someValue;
    }
    return array;
  }

  // run
  getTheQuestions();
  // if (questionCount == 1) {
  //   setTimeout(function() {getTheQuestions()}, 10000);
  //   questionCount += 1;
  //   console.log('het')
  // } else {
  //   getTheQuestions();
  // }
}

// imports van de andere 2 pagina's
import {
  printOptions
} from './printOptions';

import {
  showHighScore
} from './highScore';