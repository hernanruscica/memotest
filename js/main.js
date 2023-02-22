
/*******************************SETUP OF THE GAME**************************************************************/
const CARDS_QUANTITY = 20, 
LIFES_QUANTITY = 10, 
timeShowing = 8000, 
timeIntro = 3000,
LANG_ESP = 0, LANG_ENG = 1;

let lifes = null, score = null, language = LANG_ENG;
const imgBack = './imgs/tile.jpg';
const imagesArr2 = ['./imgs/card01.svg', './imgs/card02.svg', './imgs/card03.svg', './imgs/card04.svg', './imgs/card05.svg',
'./imgs/card06.svg', './imgs/card07.svg', './imgs/card08.svg', './imgs/card09.svg', './imgs/card10.svg'];                   
/*******************************SETUP OF THE GAME**************************************************************/


/*******************************HTML ELEMENTS**************************************************************/
const $d = document;
const $gameBoard = $d.querySelector('.game-board');
let $cards = ''; /*defined in fillGameBoard() */
const $gameStats = $d.querySelector('.header-stats');
const $h3Lifes = $d.querySelector('.stats-lifes');
const $h3Score = $d.querySelector('.stats-score');
const $timer = $d.querySelector('.timer');
const $messagesModal = $d.querySelector('.modal');
/*******************************HTML ELEMENTS**************************************************************/

/*******************************TEXTS IN DIFERENTES LANGUAGES**************************************************/
const welcomeMessages = [
                        'Bienvenido a MEMOTEST',
                        'Welcome to MEMOTEST'                        
                        ];
const  winnerMessageTitle = ['Ganaste!', 'You Win!']
const winnerMessages = [
                        'Felicitaciones! Encontraste todos los pares ! :)<br>',
                        'Congratulations! You have found all the pairs ! :).<br>',                        
                        ];
const  losserMessageTitle = ['Perdiste!', 'You Lose!']
const losserMessages = [
                        'No te quedan vidas, perdiste ... :(<br>',
                        'No more lives, you lost ... :(<br>',                        
                        ];
const tryAgainMessage = ['Podés probar de nuevo, dándole al botón de "reintentar" que esta arriba!',
                        'You can try it again, clicking in the "retry" button!'];
const hubLifesText = ['Vidas', 'Lifes'];
const hubScoreText = ['Puntos', 'Score'];
const hubStartingText = ['Comenzando en ...', 'Starting in ...'];
const hubRestartText = ['Reintentar', 'Retry']
/*******************************TEXTS IN DIFERENTES LANGUAGES**************************************************/


/*once the document is fully loaded, Do something*/
$d.addEventListener('DOMContentLoaded', () => {
    $gameBoard.innerHTML = '';    
    showHideMessages($messagesModal, 'MEMOTEST', welcomeMessages[language] , false);
    setTimeout(() => {        
        showHideMessages($messagesModal, 'MEMOTEST', welcomeMessages[language], false);        
    }, timeIntro);
    setTimeout(() => {
                        resetGame();
                        gamePlay();
                        }, timeIntro + 600);
});


/*generates an array fill with random numbers, no repetitives from min to max (inclusives)*/
function fillWithRandomNums(quantity, min, max){
    const arr = [];
    let i = 0;
    while (i<quantity){
        let randomNum = Math.floor(Math.random() * (max - min)) + min;
        if (!arr.includes(randomNum)){
            arr.push(randomNum);
            i++
        }
    }
    return arr;
}

function resetGame(){    
    /*reset this globals variables */
    lifes = LIFES_QUANTITY, score = 0;
    fillGameBoard($gameBoard, CARDS_QUANTITY, imagesArr2, imgBack);
    $cards = $d.getElementsByClassName('card');
    //gamePlay();    
}

function gamePlay(){
    
    showStats();    
    let currentCardId = '', lastCardId = '', currentCardIdPair = '', lastCardIdPair = '';    
    let clicksCounter = 0;        

    for (let i = 0; i < CARDS_QUANTITY; i++){
        ($d.getElementById(i)) ? $d.getElementById(i).classList.remove('clickeable') : null;
    }
    
    let j = timeShowing/1000 - 1;
    let startCountDown = setInterval(countDown, 1000);  

    function countDown(){
        $timer.innerHTML = `${hubStartingText[language]} ${j}`;
        j--;
    }    

    setTimeout(() => {
        //console.log('hidin all the cards');
        clearInterval(startCountDown);
        $d.querySelector('.btn-restart').innerHTML = hubRestartText[language];
        $d.querySelector('.btn-restart').classList.remove('btn-restart-hide');
        startTimer();       

        for (let i = 0; i < CARDS_QUANTITY; i++){
            rotateCard($gameBoard, i);    
            $d.getElementById(i).classList.add('clickeable');        
        }
    }, timeShowing);
    

    $d.addEventListener('click', (e) => {   
        /*If its is an img and the parent element (card) has the clickeable class*/
        if (e.target.classList.contains('cardImg') && e.target.parentElement.classList.contains('clickeable')){                       
            clicksCounter++;
            lastCardId = (currentCardId !== '') ? currentCardId : e.target.parentElement.id;
            currentCardId = e.target.parentElement.id;
            lastCardIdPair = (currentCardIdPair !== '') ? currentCardIdPair : e.target.parentElement.dataset.idpair;
            currentCardIdPair = e.target.parentElement.dataset.idpair;
            /*remove the clickable class */
            $d.getElementById(currentCardId).classList.remove('clickeable');

            if (clicksCounter%2 === 0){
                
                /*There is coincidence in one turn */
                if (currentCardId !== lastCardId && currentCardIdPair === lastCardIdPair){                                        
                    if (score < CARDS_QUANTITY/2){
                        //console.log('sumaste 1 punto!');   
                        $d.getElementById(lastCardId).classList.remove('clickeable');  
                        $d.getElementById('protection').classList.add('protectFromClicksGreen'); 
                        
                        setTimeout(() => {$d.getElementById('protection').classList.remove('protectFromClicksGreen')}, 500 );
                        score++;
                        showStats(); 
                        if (score === CARDS_QUANTITY/2){
                            //console.log('You Win !');
                            stopTimer();
                            $d.getElementById('protection').classList.add('protectFromClicksGreen');                            
                            showHideMessages($messagesModal, winnerMessageTitle[language], winnerMessages[language] + tryAgainMessage[language], false);                            
                        }
                    }                       
                
                /*There ISNT coincidence in one turn */
                }else{                    
                    if (lifes > 0){
                        //console.log('perdiste 1 vida!');
                        $d.getElementById('protection').classList.add('protectFromClicks');   
                        /*add the clickable class */
                        $d.getElementById(currentCardId).classList.add('clickeable');
                        $d.getElementById(lastCardId).classList.add('clickeable'); 
                        lifes = lifes - 1;                                            
                        setTimeout(() => {
                            rotateCard($gameBoard, currentCardId, currentCardIdPair);
                            rotateCard($gameBoard, lastCardId, lastCardIdPair);
                            $d.getElementById('protection').classList.remove('protectFromClicks');
                        }, 1000);                        
                        showStats();
                        if (lifes === 0){
                            //console.log('Game Over !');
                            stopTimer();
                            $d.getElementById('protection').classList.add('protectFromClicks');                            
                            showHideMessages($messagesModal,  losserMessageTitle[language], losserMessages[language] + tryAgainMessage[language], false);                            
                        }

                    }                                         
                }
            }
            /*
            console.log(`Last Card Id: ${lastCardId} - Last Card Id Pair: ${lastCardIdPair}
                    \nCurrent Card Id: ${currentCardId} - Current Card Id Pair: ${currentCardIdPair}\n
                    clickCounter: ${clicksCounter}\nlifes: ${lifes}\n`); 
                */
            rotateCard($gameBoard, currentCardId, currentCardIdPair);
            
            
        }    
        if (e.target.id == 'btn-restart'){
            //console.log("restarting");
            $d.location.reload(true);
        }
        if (e.target.id == 'lang'){            
           language = parseInt(e.target.value);
           //console.log("click en el idioma", language);
        }
    });    
    
}

/*STARTS THE PRESENTATION OF THE GAME*/

/* creates a square card. Needs the url of the image, 
the id (order in layout), and idPair wich is the pair number. returns a div with the card class.
Example:
<div class="card clickeable" id="1" data-idpair="1">
    <img src="https://cdn.pixabay.com/photo/2019/11/08/11/56/cat-4611189_150.jpg">
</div>
*/    
function createCard(imgUrl, id, idPair){      
    const $div = document.createElement("div");    
    $img = document.createElement("img");        
    $img.classList.add('cardImg'); 
    $img.setAttribute('src', imgUrl);    
    $div.appendChild($img);
    $div.classList.add('card');
    $div.classList.add('clickeable');
    $div.setAttribute('id', id);
    $div.setAttribute('data-idpair', idPair);    
    return $div;
}         

/*fills the gameboard with all the cards mixed with the order attribute.
recives the gameboard div, the quantity of cards, the array with the images.
dont returns nothing*/
function fillGameBoard($gBoard, quantity, imgArr){ 
    $gBoard.innerHTML = '';
    let j = 0;
    const randomNums = fillWithRandomNums(quantity, 0, 20);        
    for (let i=0; i < quantity ; i++){       
        let $card = createCard(imgArr[j], i, j);     
        $card.setAttribute('style', `order: ${randomNums[i]}`);   
        $gBoard.appendChild($card);                
        if (i%2 !== 0) j++;
    }   
}

/* rotates the card. if */
function rotateCard($gBoard, cardId, cardIdPair){    
     let $card = $d.getElementById(cardId);
     let $img = $card.querySelector('img');    
    /*If its image is the generic back card image...*/
    if ($img.src.includes('tile')){
        /*console.log('backImg');*/
        $card.classList.add('flip-out');
        setTimeout(() => {
            $img.setAttribute('src', imagesArr2[cardIdPair]);
            $card.classList.remove('flip-out');                        
        }, 200);
    }
    /*if its image is the front img of the  card*/
    else {
        /*console.log(`Img src= ${$img.src}`);        */
        $card.classList.add('flip-out');
        setTimeout(() => {
            $img.setAttribute('src', imgBack);
            $card.classList.remove('flip-out');                        
        }, 200);
    }        
}

function showStats(){
    $h3Lifes.innerHTML = '';   
    $h3Lifes.innerHTML = `${hubLifesText[language]}: ${lifes}`;
    $h3Score.innerHTML = '';
    $h3Score.innerHTML = `${hubScoreText[language]}: ${score}`;                     
}

///////////////////* HASTA ACA REFACTORIZADO *////////////////////////////


/*showMessages($messagesModal, points, lifes, time);*/
function showHideMessages($modal, title, message, wButton){ 
    const $title = $modal.querySelector('.modal-title');
    const $message = $modal.querySelector('.modal-paragraph');
    $title.innerHTML = '';
    $title.innerHTML = `${title}`
    $message.innerHTML = '';
    $message.innerHTML = `${message}`  
    if ($modal.querySelector('button')) $modal.querySelector('button').remove();

    if (wButton && !$modal.querySelector('button')  ){
        const $button = $d.createElement('button');
        $button.classList.add('modal-btn');
        $button.innerHTML = 'Volver a intentar!';
        $button.addEventListener('click', (e) => {
            $modal.classList.remove('show');
            $modal.classList.add('hide');
            $d.getElementById('protection').classList.remove('protectFromClicks');
            /*reloads the page*/
            $d.location.reload(true)
        });
        $modal.appendChild($button);
    }    
    if ($modal.classList.contains('hide')){
        $modal.classList.remove('hide');
        $modal.classList.add('show');
    }else if ($modal.classList.contains('show')){
        $modal.classList.remove('show');
        $modal.classList.add('hide');
    }
}

/*var hr = 0;*/
var min = 0;
var sec = 0;
var stoptime = true;

/////////////////////////////////////--------* TIMER *-----------//////////////////////////////////////

function startTimer() {
  if (stoptime == true) {
        stoptime = false;
        timerCycle();
    }
}
function stopTimer() {
  if (stoptime == false) {
    stoptime = true;
  }
}

function timerCycle() {
    
    if (stoptime == false) {
    sec = parseInt(sec);
    min = parseInt(min);
    /*hr = parseInt(hr);*/

    sec = sec + 1;

    if (sec == 60) {
      min = min + 1;
      sec = 0;
    }
    if (min == 60) {
      hr = hr + 1;
      min = 0;
      sec = 0;
    }

    if (sec < 10 || sec == 0) {
      sec = '0' + sec;
    }
    if (min < 10 || min == 0) {
      min = '0' + min;
    }
    /*if (hr < 10 || hr == 0) {
      hr = '0' + hr;
    }
    */
    $timer.innerHTML = '';
    $timer.innerHTML = min + ':' + sec;

    setTimeout("timerCycle()", 1000);
  }
}

function resetTimer() {    
    $timer.innerHTML = "00:00:00";
    stoptime = true;
    hr = 0;
    sec = 0;
    min = 0;
}




