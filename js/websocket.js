/* eslint-disable no-console */

// Cette fonction permet d'installer un websocket natif navigateur en écoute
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
// A chaque message recu, le callback sera appellé avec son contenu
// eslint-disable-next-line no-unused-vars
function installWebSocket(callbackOnMessage) {
  // Server's address
  // const socket = new WebSocket('ws://localhost:3000/stream/');
  const socket = new WebSocket('wss://lifap5.univ-lyon1.fr:443/stream/');

  console.debug(`installWebSocket@`);
  // the global heartbeat's ID
  let heartbeatInterval;

  // Connection opened
  socket.onopen = (event) => {
    // Set some heartbeat to the server. WebSocket native API does not support ping yet.
    // Nginx's timeout is 60s, so we take the half
    console.debug(`socket.onopen@${JSON.stringify(event)}`);
    heartbeatInterval = setInterval(() => {
      const heartbeat = { type: 'heartbeat', time: Date.now() };
      console.info(`Sent: ${JSON.stringify(heartbeat)}`);
      socket.send(JSON.stringify(heartbeat));
      console.log('SOCKET OUVERT');
    }, 30000);
    
  
  };

  // Connection closed
  socket.onclose = (event) => {
    clearInterval(heartbeatInterval);
    console.debug(`socket.onclose@${event.code}`);
    console.log('SOCKET FERME');

  };

  // Listen for messages
  socket.onmessage = (event) => {
    
    // console.info(`Received: ${event.data}`);
    callbackOnMessage("Message:", event.data);

      var str = event.data  //recupère le message de event.data dans un string
      var typequiz = str.slice(9, 13); // récupère le type  quiz de event.data  grâce à slice() qui permet de scindé un string 
      var typeproposition= str.slice(9,20); // recupère le type propositin de event.data, on ne récupère pas le type question car à chaque modification d'une question/proposition on a un message type proposition
      var quizidproposition=str.slice(53,58); // recupère l'id du quiz dans un message de proposition

      if(typequiz=="quiz")  // si le type du message est égal à "quiz"
        getQuizzes(state.currentPage);  // on met à jour la liste des quizz en restant sur la page actuelle
    


      function clickQuiz(id) {    //  Clone de la fonction clickQuiz pour pouvoir passer en paramètre l'id du quiz actuel /////////////////////////////////////////////////////////////////////////////////

      const modal = document.getElementById('id-modal-quizz-menu');
      const quizzId = id 
      console.debug(`@clickQuiz(${quizzId})`);
      const addr = `${state.serverUrl}/quizzes/${quizzId}`;
      return fetch(addr, { method: 'GET', headers: state.headers })	                
          .then(filterHttpResponse)	
          .then((data) => {	
            if (data===undefined){
            alert('Malheureusement ce QCM nest plus disponible, veuillez en choisir un autre ! ');   // Si le quiz est supprimé pendant que l'utilisateur est dessus cette alerte s'affiche 
            }
            else {
              const html = `<p><h2>Voici le ${data.title}</h2> </br> <i classe="green darken-3">Thème: ${data.description}</i></p>`;	
              modal.children[0].innerHTML = html;	
              state.currentQuizz = quizzId;	
              state.currentQuizzNbQuestions = data.questions_number;	
              // eslint-disable-next-line no-use-before-define	
              renderCurrentQuizz();
            }
          });
      }


    if(typeproposition=="proposition" && state.currentQuizz==quizidproposition){  // si le type est proposition et l'utilisateur est sur le quiz concerné par le message
    clickQuiz(quizidproposition) ;     // appel de clickQuiz avec l'id du quiz actuel pour mettre à jour l'affichage 
    ;}

    
  };

  window.addEventListener('beforeunload', () => {
    // here a 1005 code is sent
    clearInterval(heartbeatInterval);
    console.log('TEST4');

    socket.close();
  });

  function sendMessage(msg) {
    if (socket.readyState === WebSocket.OPEN) {
      console.info(`sendMessage@${JSON.stringify(msg)}`);
      // See https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
      console.log('TEST5');

      socket.send(JSON.stringify(msg));
    } else console.error(`sendMessage@state is ${socket.readyState}`);
  }

  return sendMessage;


  
}


