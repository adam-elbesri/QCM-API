/* global state getQuizzes getUser */

// //////////////////////////////////////////////////////////////////////////////
// HTML : fonctions génération de HTML à partir des données passées en paramètre
// //////////////////////////////////////////////////////////////////////////////
let nbQuestion;
let numQuestion=[];
let idMyCUrrentQuizz;

// génération d'une liste de quizzes avec deux boutons en bas
const htmlQuizzesList = (quizzes, curr, total) => {
  console.debug(`@htmlQuizzesList(.., ${curr}, ${total})`);

  // un élement <li></li> pour chaque quizz. Noter qu'on fixe une donnée
  // data-quizzid qui sera accessible en JS via element.dataset.quizzid.
  // On définit aussi .modal-trigger et data-target="id-modal-quizz-menu"
  // pour qu'une fenêtre modale soit affichée quand on clique dessus
  // VOIR https://materializecss.com/modals.html
  const quizzesLIst = quizzes.map(
    (q) =>
      `<li class="collection-item modal-trigger cyan lighten-5" data-target="id-modal-quizz-menu" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        ${q.description} <a class="chip">${q.owner_id}</a>
      </li>`
  );

  // le bouton "<" pour revenir à la page précédente, ou rien si c'est la première page
  // on fixe une donnée data-page pour savoir où aller via JS via element.dataset.page
  const prevBtn =
    curr !== 1
      ? `<button id="id-prev-quizzes" data-page="${curr -
          1}" class="btn"><i class="material-icons">navigate_before</i></button>`
      : '';

  // le bouton ">" pour aller à la page suivante, ou rien si c'est la première page
  const nextBtn =
    curr !== total
      ? `<button id="id-next-quizzes" data-page="${curr +
          1}" class="btn"><i class="material-icons">navigate_next</i></button>`
      : '';

  // La liste complète et les deux boutons en bas
  const html = `
  <ul class="collection">
    ${quizzesLIst.join('')}
  </ul>
  <div class="row">      
    <div class="col s6 left-align">${prevBtn}</div>
    <div class="col s6 right-align">${nextBtn}</div>
  </div>
  `;
  return html;
};

// //////////////////////////////////////////////////////////////////////////////
// RENDUS : mise en place du HTML dans le DOM et association des événemets
// //////////////////////////////////////////////////////////////////////////////

// met la liste HTML dans le DOM et associe les handlers aux événements
// eslint-disable-next-line no-unused-vars
function renderQuizzes() 
{
  console.debug(`@renderQuizzes()`);
  

  // les éléments à mettre à jour : le conteneur pour la liste des quizz
  const usersElt = document.getElementById('id-all-quizzes-list');
  // une fenêtre modale définie dans le HTML
  const modal = document.getElementById('id-modal-quizz-menu');

  // on appelle la fonction de généraion et on met le HTML produit dans le DOM
  usersElt.innerHTML = htmlQuizzesList
  (
    state.quizzes.results,
    state.quizzes.currentPage,
    state.quizzes.nbPages
  );

  // /!\ il faut que l'affectation usersElt.innerHTML = ... ait eu lieu pour
  // /!\ que prevBtn, nextBtn et quizzes en soient pas null
  // les éléments à mettre à jour : les boutons
  const prevBtn = document.getElementById('id-prev-quizzes');
  const nextBtn = document.getElementById('id-next-quizzes');
  // la liste de tous les quizzes individuels
  const quizzes = document.querySelectorAll('#id-all-quizzes-list li'); //  const quizzes = document.querySelectorAll('#id-all-quizzes-list li');


  // les handlers quand on clique sur "<" ou ">"
  function clickBtnPager() {
    // remet à jour les données de state en demandant la page
    // identifiée dans l'attribut data-page
    // noter ici le 'this' QUI FAIT AUTOMATIQUEMENT REFERENCE
    // A L'ELEMENT AUQUEL ON ATTACHE CE HANDLER
  
    state.currentPage=this.dataset.page;
    getQuizzes(this.dataset.page);
  }
  if (prevBtn) prevBtn.onclick = clickBtnPager;
  if (nextBtn) nextBtn.onclick = clickBtnPager;

  // qd on clique sur un quizz, on change sont contenu avant affichage
  // l'affichage sera automatiquement déclenché par materializecss car on
  // a définit .modal-trigger et data-target="id-modal-quizz-menu" dans le HTML
function clickQuiz() {
    if(state.xApiKey=='')
    alert('Veuillez vous connecter pour accèder aux quiz');
    else
    {
    getMESREPONSES();
    const quizzId = this.dataset.quizzid;
    console.debug(`@clickQuiz(${quizzId})`);
    const addr = `${state.serverUrl}/quizzes/${quizzId}`;
    return fetch(addr, { method: 'GET', headers: state.headers })	                
	      .then(filterHttpResponse)	
	      .then((data) => {	
	        const html = `<p><h2>Voici le ${data.title}</h2> </br> <i classe="green darken-3">Thème: ${data.description}</i></p>`;	
	        modal.children[0].innerHTML = html;	
	        state.currentQuizz = quizzId;	
	        state.currentQuizzNbQuestions = data.questions_number;	
	        // eslint-disable-next-line no-use-before-define	
	        renderCurrentQuizz();
        });	
      }
        
	  }
	
  // pour chaque quizz, on lui associe son handler
  quizzes.forEach((q) => {
    q.onclick = clickQuiz;
  });
}

function renderQuizzesUser()	
{	
  const userQuizzes = document.getElementById('id-my-quizzes');	
  userQuizzes.innerHTML = htmlQuizzesList(state.quizzesUser,1,1);	
}	
	
function renderAnswersUser()	
{	
  const userAnswers = document.getElementById('id-my-answers');	
  userAnswers.innerHTML = 'Bientôt';	
}
    
// Catégorie Gestion de Réponses //////////////////////////////////////////////////////////////////////////////////////////////////


function renderCurrentQuizz(){   
  window.scrollTo(0,0);  // defile la page vers le haut /////////////////////////////////////////////////////////////////////////////////

  state.bool=false;  // on réinitialise l'état du booléen à faux ///////////////////////////////////////////////////////////////////////////
  
  console.debug(`@renderCurrentQuizz()`);
  const addr = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;    
  fetch(addr, { method: 'GET', headers: state.headers })    
    .then(filterHttpResponse)    
    .then((data) => {    

      const main = document.getElementById('id-all-quizzes-main');    
      var html = `</br><form>`;    
      for(let z=0; z<state.MESREPONSES.length;z++){        //teste si le quiz actuel a déjà été répondu ////////////////////////////////////////////////////////////////////////////////////////
        if (state.currentQuizz == state.MESREPONSES[z].quiz_id){  
          state.bool=true;  // on met le booléen à VRAI si c'est le cas //////////////////////////////////////////////////////////////////////////////////////////////////////////
            
          for (let i = 0; i < state.currentQuizzNbQuestions; i++) {     // si une question n'avait pas été répondu on affiche aucune réponse cochée////////////////////////////////////////////////////////////////
              html = html + `<fieldset id="formulaire` + i + `">`    
              html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;  
              if (state.MESREPONSES[z].answers[i]==undefined) 
              {
                for (let j = 0; j < data[i].propositions_number; j++) 	
                {	
                  html = html + `<p><label><input type="radio" id="` + j + `"onclick= "envoirep(${i}, ${j})""`+ `"name="` 
                  + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` 
                  + data[i].propositions[j].content + `</span> </label> </p>`;	
                }	
                html = html + `</fieldset>`;		
              }
              else {         // sinon affichage des réponses en mettant la valeur des radio boutons à "checked" = cochée/////////////////////////////////////////////////////////////////////////////////////////
    
                for( let j = 0; j < data[i].propositions_number; j++)     
                {           
                if (j != state.MESREPONSES[z].answers[i].proposition_id)
                {
                  html = html + `<p><label><input onclick="envoirep(${i},${j})" class="btn` + i + `-`+ j +`" type="radio" id="` + j + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;}
                 else
                 {  html = html + `<p><label><input onclick="envoirep(${i},${j})" class="btn` + i + `-`+ j +`" type="radio" id="` + j 
                    + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"checked/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;}
                }
              }    

              html = html + `</fieldset>`;    
            
          }    
        }
      }

  if (state.bool ==true)  // si le booléen a changé d'état alors le quiz actuel a déjà été répondu et on laisse l'affichage ci dessus /////////////////////////////////////////
  console.log('Le quiz actuel a déjà été répondu ');
  else{  // sinon on lance l'affichage normal d'un quiz /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (let i = 0; i < state.currentQuizzNbQuestions; i++) {	
	  	html = html + `<fieldset id="formulaire` + i + `">`	
		  html = html + `<p>Question ` + (i + 1) + ` : ` + data[i].sentence + `</p>`;	 
		    for (let j = 0; j < data[i].propositions_number; j++) 	
        {	
        html = html + `<p><label><input type="radio" id="` + j + `"onclick= "envoirep(${i}, ${j})""`+ `"name="` 
        + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` 
        + data[i].propositions[j].content + `</span> </label> </p>`;	
        }	
		  html = html + `</fieldset>`;			
   }	
  }
      main.innerHTML = html;
});
    
}
// Les réponses de l'utilisateur avec un fetch ////////////////////////////////////////////////////////////////////////////////////////////

const getMESREPONSES = (p = 1) => {

  console.debug(`@getMESREPONSES(${p})`);
  const url = `${state.serverUrl}/users/answers`;

  return fetch(url, { method: 'GET', headers: state.headers() })
    .then(filterHttpResponse)
    .then((data) => {   
      state.MESREPONSES= data;
    });  
        
};

// Envoi des réponses à chaque clique sur le bouton radio avec les parametre de boucle i et j //////////////////////////////////////////////////////////////////////////

function envoirep(a,b){
  console.debug('@envoirep()');
  fetch( `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/${a}/answers/${b}`, { method: 'POST', headers: state.headers() })
  .then(res => console.log(res));
  getMESREPONSES();
  }

// quand on clique sur le bouton de login, il nous dit qui on est
// eslint-disable-next-line no-unused-vars
const renderUserBtn = () => {
 
  const btn = document.getElementById('id-login');
  const btn1 = document.getElementById('id-btn-login');

  // Bouton en haut à droite
  btn.onclick = () => {                                
    if (state.user) 
    {
      // eslint-disable-next-line no-
        const res= confirm(`Bonjour ${state.user.firstname} ${state.user.lastname.toUpperCase()}.\n \nAppuyez sur OK pour vous déconnecter `)
        if (res)
        {
          state.xApiKey = '';
          alert("Déconnexion réussie");
          getUser();
        }
    } 
    else 
      {
        // eslint-disable-next-line no-alert
        const saisie = prompt('Pour vous connecter, veuillez saisir votre xApiKey');
	      state.xApiKey = saisie;
        getUser(); 
      }
  };

// bouton de connexion mes quizz
  
btn1.onclick = () => {     
    


    if (state.user) 
    {
      // eslint-disable-next-line no-
      
    } 
    else 
      {
        // eslint-disable-next-line no-alert
        const saisie = prompt('Pour vous connecter, veuillez saisir votre xApiKey');
	      state.xApiKey = saisie;
        getUser(); 
      }
  };
};
