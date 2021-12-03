
/*******************************SETUP OF THE GAME**************************************************************/
const cardsQuantity = 20, maxLifes = 10, timeShowing = 8000, timeIntro = 2000, defaultQuery = 'cats';
let lifes, score, query;
const imgBack = './imgs/tile.jpg';
let imagesArr;
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


/*once the document is fully loaded, Do something*/
$d.addEventListener('DOMContentLoaded', () => {
    console.log('fully loaded');      
    /*console.log($gameBoard, $gameStats, $messagesModal); */
    console.log('intro');
    $gameBoard.innerHTML = '';
    
    showHideMessages($messagesModal, 'Bienvenido a MemoTest', 'Recuerde las parejas de imagenes, para ganar puntos!', false);
    setTimeout(() => {        
        showHideMessages($messagesModal, 'Bienvenido a MemoTest', 'Recuerde las parejas de imagenes, para ganar puntos!', false);        
    }, timeIntro);
    setTimeout(() => {resetGame()}, timeIntro + 600);
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

/*returns an array with random images from API pixabay, with a query string, a min a max index, and the quantity of images needed (https://pixabay.com/api/docs)*/
async function fillWithImgs(query, quantity, min, max){
    const apiKey = '24469039-f2a18081cb188fd1a6f5434af';
    const arr = [];
    max = (quantity <= max) ? max : quantity;
    const randomNumsImgs = fillWithRandomNums(quantity, min, max);

    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&per_page=${max - min}`);
    const data = await response.json();    

    randomNumsImgs.forEach((elem) => {        
        arr.push(data['hits'][elem]['previewURL'])
    });
    return arr;
}

function resetGame(){    
    /*reset this globals variables */
    lifes = maxLifes, score = 0, query = defaultQuery;
    /*Once the async function returns the array of images*/
    fillWithImgs(query, cardsQuantity/2, 0, cardsQuantity*2).then((images) => {
        
        imagesArr = images; 
        /*console.log(imagesArr);*/              
        fillGameBoard($gameBoard, cardsQuantity, imagesArr, imgBack);
        $cards = $d.getElementsByClassName('card');
        gamePlay();
    }); 
}

function gamePlay(){
    
    showStats();
    
    let currentCardId = '', lastCardId = '', currentCardIdPair = '', lastCardIdPair = '';    
    let clicksCounter = 0;    
    console.clear();

    for (let i = 0; i < cardsQuantity; i++){
        $d.getElementById(i).classList.remove('clickeable');
    }
    
    let j = timeShowing/1000 - 1;
    let startCountDown = setInterval(countDown, 1000);  

    function countDown(){
        $timer.innerHTML = `Comenzando en ${j}`;
        j--;
    }    

    setTimeout(() => {
        console.log('hidin all the cards');
        clearInterval(startCountDown);
        $d.querySelector('.btn-restart').classList.remove('btn-restart-hide');
        startTimer();
        /*$d.location.reload(true)
        para agregar un boton al lado del titulo
         .btn-restart-hide*/

        for (let i = 0; i < cardsQuantity; i++){
            rotateCard($gameBoard, i);    
            $d.getElementById(i).classList.add('clickeable');        
        }
    }, timeShowing);
    

    $d.addEventListener('click', (e) => {   
        /*If its is an img and the parent element (card) has the clickeable class*/
        if (e.target.classList.contains('cardImg') && e.target.parentElement.classList.contains('clickeable')){            
            /*console.log(e.target.parentElement.id);*/
            clicksCounter++;
            lastCardId = (currentCardId !== '') ? currentCardId : e.target.parentElement.id;
            currentCardId = e.target.parentElement.id;
            lastCardIdPair = (currentCardIdPair !== '') ? currentCardIdPair : e.target.parentElement.dataset.idpair;
            currentCardIdPair = e.target.parentElement.dataset.idpair;
            
            console.clear();      

            if (clicksCounter%2 === 0){
                
                /*There is coincidence in one turn */
                if (currentCardId !== lastCardId && currentCardIdPair === lastCardIdPair){                                        
                    if (score < cardsQuantity/2){
                        console.log('sumaste 1 punto!');                       
                        /*remove the clickable class */      
                        $d.getElementById(currentCardId).classList.remove('clickeable');                  
                        $d.getElementById(lastCardId).classList.remove('clickeable');   
                        $d.getElementById('protection').classList.add('protectFromClicksGreen'); 
                        setTimeout(() => {$d.getElementById('protection').classList.remove('protectFromClicksGreen')}, 500 );
                        score++;
                        showStats(); 
                        if (score === cardsQuantity/2){
                            console.log('You Win !');
                            stopTimer();
                            $d.getElementById('protection').classList.add('protectFromClicksGreen');
                            showHideMessages($messagesModal, 'You Win', 'Completaste el tablero, podes intentar de nuevo en un nuevo tablero!', true);
                        }
                    }                       
                
                /*There ISNT coincidence in one turn */
                }else{                    
                    if (lifes > 0){
                        console.log('perdiste 1 vida!');
                        $d.getElementById('protection').classList.add('protectFromClicks');   
                        lifes = lifes - 1;                                            
                        setTimeout(() => {
                            rotateCard($gameBoard, currentCardId, currentCardIdPair);
                            rotateCard($gameBoard, lastCardId, lastCardIdPair);
                            $d.getElementById('protection').classList.remove('protectFromClicks');
                        }, 1000);                        
                        showStats();
                        if (lifes === 0){
                            console.log('Game Over !');
                            stopTimer();
                            $d.getElementById('protection').classList.add('protectFromClicks');
                            showHideMessages($messagesModal, 'Game Over', 'No tenes mas vidas, podes intentar de nuevo en un nuevo tablero!', true);
                        }

                    }                                         
                }
            }
            
            console.log(`Last Card Id: ${lastCardId} - Last Card Id Pair: ${lastCardIdPair}
                    \nCurrent Card Id: ${currentCardId} - Current Card Id Pair: ${currentCardIdPair}\n
                    clickCounter: ${clicksCounter}\nlifes: ${lifes}\n`); 
                
            rotateCard($gameBoard, currentCardId, currentCardIdPair);
            
            
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
            $img.setAttribute('src', imagesArr[cardIdPair]);
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
    $h3Lifes.innerHTML = `Lifes: ${lifes}`;
    $h3Score.innerHTML = '';
    $h3Score.innerHTML = `Score: ${score}`;                     
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






