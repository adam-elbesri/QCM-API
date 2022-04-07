/* globals renderQuizzes renderUserBtn */

// //////////////////////////////////////////////////////////////////////////////
// LE MODELE, a.k.a, ETAT GLOBAL
// //////////////////////////////////////////////////////////////////////////////

// un objet global pour encapsuler l'état de l'application
// on pourrait le stocker dans le LocalStorage par exemple
const state = {
  // la clef de l'utilisateur
  xApiKey: '', //73f2c434-fd73-4f88-a818-2dea71830363

  // l'URL du serveur où accéder aux données
  serverUrl: 'https://lifap5.univ-lyon1.fr',

  // la liste des quizzes
  quizzes: [],
  // booléen pour le websocket 
  bool:false,

  // le quizz actuellement choisi
  currentQuizz:	undefined,
  
  // une méthode pour l'objet 'state' qui va générer les headers pour les appel à fetch
	headers(){
		const headers = new Headers();
		headers.set('X-API-KEY', this.xApiKey);
		headers.set('Accept', 'application/json');
		headers.set('Content-Type', 'application/json');
		return headers;
	}
};



// //////////////////////////////////////////////////////////////////////////////
// OUTILS génériques
// //////////////////////////////////////////////////////////////////////////////

// un filtre simple pour récupérer les réponses HTTP qui correspondent à des
// erreurs client (4xx) ou serveur (5xx)
// eslint-disable-next-line no-unused-vars
function filterHttpResponse(response) {
  return response
    .json()
    .then((data) => {
      if (response.status >= 400 && response.status < 600) {
        throw new Error(`${data.name}: ${data.message}`);
      }
      return data;
    })
    .catch((err) => console.error(`Error on json: ${err}`));
}

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES UTILISATEURS
// //////////////////////////////////////////////////////////////////////////////

// mise-à-jour asynchrone de l'état avec les informations de l'utilisateur
// l'utilisateur est identifié via sa clef X-API-KEY lue dans l'état
// eslint-disable-next-line no-unused-vars
const getUser = () => {
  console.debug(`@getUser()`);
  const url = `${state.serverUrl}/users/whoami`;
  return fetch(url, { method: 'GET', headers: state.headers() })
    .then(filterHttpResponse)
    .then((data) => {
      // /!\ ICI L'ETAT EST MODIFIE /!\
      state.user = data;
      // on lance le rendu du bouton de login
      return renderUserBtn();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES QUIZZES
// //////////////////////////////////////////////////////////////////////////////

// mise-à-jour asynchrone de l'état avec les informations de l'utilisateur
// getQuizzes télécharge la page 'p' des quizzes et la met dans l'état
// puis relance le rendu
// eslint-disable-next-line no-unused-vars
const getQuizzes = (p = 1) => 
{
  console.debug(`@getQuizzes(${p})`);
  const url = `${state.serverUrl}/quizzes/?page=${p}`;

  // le téléchargement est asynchrone, là màj de l'état et le rendu se fait dans le '.then'
  return fetch(url, { method: 'GET', headers: state.headers() })
    .then(filterHttpResponse)
    .then((data) => {
      // /!\ ICI L'ETAT EST MODIFIE /!\
      state.quizzes = data;

      // on a mis à jour les donnés, on peut relancer le rendu
      // eslint-disable-next-line no-use-before-define
      return renderQuizzes();
    });
};


//Recupère un quizz sur le serveur
const getQuizzesUser = () => 
{	
  console.debug(`@getQuizzesUser()`);	
  const url = `${state.serverUrl}/users/quizzes/`;	
  // le téléchargement est asynchrone, là màj de l'état et le rendu se fait dans le '.then'	
  return fetch(url, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
	.then((data) => {	
	  // /!\ ICI L'ETAT EST MODIFIE /!\	
	  state.quizzesUser = data;	
	
	  // on a mis à jour les donnés, on peut relancer le rendu	
	  // eslint-disable-next-line no-use-before-define	
	  return renderQuizzesUser();	
	});	
};	
	
//Recupère les propositions du quizz sur le serveur		
const getAnswersUser = () => 
{	
  console.debug(`@getQuizzesUser()`);	
  const url = `${state.serverUrl}/users/answers/`;	
	
  // le téléchargement est asynchrone, là màj de l'état et le rendu se fait dans le '.then'	
  return fetch(url, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
  .then((data) => 
  {	
	  // /!\ ICI L'ETAT EST MODIFIE /!\	
	  state.answersUser = data;	
	
	  // on a mis à jour les donnés, on peut relancer le rendu	
	  // eslint-disable-next-line no-use-before-define	
	  return renderAnswersUser();	
	});	
};
   

// Catégorie Forumulaire de Recherche/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const btn4 = document.getElementById('id-search');   //  bouton cliquable loupe barre de recherche
const btn3 = document.getElementById('id-close-search'); // bouton cliquable croix barre de recherche

  // fonction de recherche d'un élement saisi dans la barre de recherche 
        function Search() {                                                 
          var string = document.getElementById ("search").value;  // recupère la saisie du champ search
          if (window.find && window.getSelection) { // teste si window.find() est compatible avec le navigateur
              document.designMode = "on";
              var sel = window.getSelection();
              sel.collapse(document.body,0);
              while (window.find(string)) {
                  document.execCommand("HiliteColor", false, "Yellow");   // change le background de l'élément selectionné en jaune 
                  sel.collapseToEnd();
              }
              document.designMode = "off";
          }            
      }
  // fonction de renitialisation de la recherche : tous les élements séléctionnés précdemment sont reset avec le background par défaut
        function removeSearchResults() {
          var spans = document.getElementsByTagName('span'), i;
          for( i=0; i<spans.length; i++) {
            if( spans[i].style.backgroundColor == "yellow") {
             spans[i].style.backgroundColor = "transparent";
              spans[i].parentNode.replaceChild(spans[i].firstChild,spans[i]);
              i--;
            }
          } 
          window.scrollTo(0,0);  // defile la page vers le haut 
        }

      
      btn3.onclick = () => {removeSearchResults();
        document.getElementById("search").value = '';
      };
      btn4.onclick = () => {
        if( document.getElementById ("search").value ==="")
        alert("Veuillez saisir votre recherche");
        else
        Search();};

      


    