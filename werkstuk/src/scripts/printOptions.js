// navigo
import Navigo from 'navigo';

let router = new Navigo(window.location.origin, true, '#!'); // initiate router
router.updatePageLinks(); // detects data-navigo attribute and translate links to routed links

// de hele functie om de moeilijkheidsgraad en de categorieën te printen
export async function printOptions() {
  // items uit de DOM halen
  let diffOptions = document.querySelector('#diff #options');
  let optionsbtn = document.querySelector('#optionsbtn');
  let catOptions = document.querySelector('#diff #options-category');

  // hier fetch ik de categorieën 
  const response = await fetch('https://opentdb.com/api_category.php');
  let data = await response.json();

  data = data.trivia_categories;

  catOptions.innerHTML = '<option value="all">all</option>';

  //voor elke data die er in zit haal je de unieke ID eruit en de naam die erbij hoort
  data.forEach((cat) => {
    catOptions.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });

  // als je op de knop drukt steekt hij de value in de localstorage zodat je de volgende keer met dezelfde eigenschappen kunt verder doen.
  // de pagina wijzigd naar de quiz
  optionsbtn.addEventListener('click', function () {
    let difficultyValue = diffOptions.value;
    let categoryValue = catOptions.value;

    localStorage.setItem('diff', difficultyValue);
    localStorage.setItem('category', categoryValue);
    router.navigate('/quiz');
  })

    // set de waarde die in je localstorage staat als default
    if (localStorage.getItem('diff') !== null) {
      diffOptions.value = localStorage.getItem('diff');
    }
    if (localStorage.getItem('category') !== null) {
      catOptions.value = localStorage.getItem('category');
      console.log(catOptions);
    }
}