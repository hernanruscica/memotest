
/*******************************SETUP OF THE GAME**************************************************************/
const cardsQuantity = 20;
let cards;
const imgBack = './imgs/tile.jpg';
$d = document;
const $gameBoard = $d.querySelector('.game-board');
const $gameStats = $d.querySelector('.header-stats');
const $messagesModal = $d.querySelector('#messages');
const states = ['intro', 'showCards', 'play', 'gameOver', 'youWin' ];
let stateIndex = 0;
let lifes = 10, points = 0;
/*******************************SETUP OF THE GAME**************************************************************/


/*STARTS THE LOGIC OF THE GAME, NOT THE PRESENTATION*/

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
const randomNums =  fillWithRandomNums(10, 0, 10);
/*console.log(randomNums);*/


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

/*generates cards */
function generateCards(quantity, imgsArr){    
    /*  Cards structure : [{id: number, idCard: number, visible: boolean, paired: boolean, imgUrl: string},...] */
    const arr = [];
    const randomNums =  fillWithRandomNums(quantity, 0, quantity);
    let j = 0;
    for (let i = 0 ; i < quantity ; i++){
        arr.push({'id': randomNums[i], 'idCard': j, 'visible': true, 'paired': false, 'imgUrl': imgsArr[j] })  
        /*si es impar*/
        if (i%2 !== 0) j++;      
    }    
    return arr;
}

/*Once the async function returns the array of images*/
fillWithImgs('cat', cardsQuantity/2, 0, cardsQuantity*2).then((images) => {
    let imagesArr;
    imagesArr = images; 
    /*console.log(imagesArr);*/
    cards = generateCards(cardsQuantity, imagesArr);
    /*console.log(cards);*/
});

function changeVisibilityAll(cards, value){
    cards.forEach((elem) => {
        elem['visible'] = value;
    });
}

/*ENDS THE LOGIC OF THE GAME, NOT THE PRESENTATION*/

function updateState(i){
    
    switch (i){
        case 0:         
            /* INTRO */    
            showHideMessages($messagesModal, 'Mira las cartas', 'y memoriza los pares', false);
            console.clear();
            console.log(`current state: ${states[stateIndex]}`);
            setTimeout(() => {
                showHideMessages($messagesModal, 'Mira las cartas', 'y memoriza los pares', false);
                stateIndex++;
                updateState(stateIndex);
            }, 2000);            
        break;
        case 1:
            /* SHOWCARDS */
            let timeShowing = 4000;
            console.clear();
            console.log(`current state: ${states[stateIndex]}`);
            fillGameBoard($gameBoard, cards, imgBack);
            
            /*duration of this state, until its changes to the next*/
            setTimeout(() => {
                changeVisibilityAll(cards, false);
                fillGameBoard($gameBoard, cards, imgBack);
                stateIndex++;
                updateState(stateIndex);
            }, timeShowing);                       
            
        break;
        case 2:
            /* PLAY */            
            
            console.clear();
            console.log(`current state: ${states[stateIndex]}`);
            let currentCardId = '', lastCardId = '';
            let clicksCounter = 0;
            let currentCard, lastCard;
          
            startClock();
            $d.addEventListener('click', (e) => {
                
                const getCurrentCard = (id) => {return cards.filter(elem => elem.id === parseFloat(id))[0];};
                
                /*Only if the event was on the card element */
                if (e.target.parentElement.classList.contains('card')){
                    clicksCounter++;
                    lastCardId = (currentCardId !== '') ? currentCardId : e.target.parentElement.id;
                    currentCardId = e.target.parentElement.id;   
                    
                    currentCard = getCurrentCard(currentCardId);  
                    lastCard = getCurrentCard(lastCardId);    
                    /*if the clicked cards is not visible then rotate */
                    currentCard = (currentCard['visible'] == false) ? rotateCard($gameBoard, currentCard, imgBack) : currentCard;     
                
                    if (clicksCounter > 0 && clicksCounter%2 == 0 && currentCardId !== '' && currentCardId !== lastCardId){
                        /*si el contador de clicks es par y mayor a cero*/
                        if(currentCard['idCard'] == lastCard['idCard'] && currentCard['id'] !== lastCard['id'] ){
                            console.log('Sumaste 1 punto');                            
                            points++;
                            if (points * 2 == cardsQuantity){
                                /*you completed the boards*/                                
                                stateIndex = 4;
                                updateState(stateIndex);
                            }
                        }else{
                            console.log('Perdiste una vida');
                            $d.getElementById('protection').classList.add('protectFromClicks');
                            currentCardId = '', lastCardId = '';
                            lifes--;
                            if (lifes > 0){
                                /*keep playing */
                                
                                setTimeout(() => {                                            
                                    currentCard = rotateCard($gameBoard, currentCard, imgBack);
                                    lastCard = rotateCard($gameBoard, lastCard, imgBack);
                                    $d.getElementById('protection').classList.remove('protectFromClicks');
                                }, 1000);
                            }else{
                                /* you lose */                                
                                stateIndex++;
                                updateState(stateIndex);
                                
                            }
                        }
                    }
                }
            });
            /*PROBLEMA --- gano puntos clickeando en los mismos pares ya dados vuelta */

        break;
        case 3:
            /* GAME OVER */
            showHideMessages($messagesModal, 'Game Over !', 'Perdiste todos los intentos.', true);
            console.clear();
            console.log(`current state: ${states[stateIndex]}`);            
            console.log(`GAME OVER!\nYour score : ${points}`)
        break;
        case 4:
            /* YOU WIN */
            showHideMessages($messagesModal, 'Ganaste !', 'Completaste el tablero.', true);
            console.clear();
            console.log(`current state: ${states[stateIndex]}`);            
            console.log(`YOU WIN!\nYour score : ${points}`)
        break;
    }
}


/*once the document is fully loaded, Do something*/
$d.addEventListener('DOMContentLoaded', () => {
     console.log('fully loaded');      
     /**/updateState(stateIndex);    
});

/*
function resetGame(){
    stateIndex = 0;
    updateState(stateIndex);
}
*/
/*STARTS THE PRESENTATION OF THE GAME*/

/* creates a square card. Needs the url of the image ande size of the sides. returns a node of the card.*/    
function createCard(imgUrl, classCard, id, idCard){      
    const $div = document.createElement("div");    
    $img = document.createElement("img");          
    $img.setAttribute('src', imgUrl);    
    $div.appendChild($img);
    $div.classList.add(classCard);
    $div.setAttribute('id', id);
    $div.setAttribute('data-idcard', idCard);    
    return $div;
}                


/*loads the gameboard with all the cards mixed*/
function fillGameBoard($gBoard, cards, imgBack){ 
    $gBoard.innerHTML = '';
    for (let i=0; i < cards.length ; i++){        
        cards.forEach((elem) => {
            let img = (elem['visible'] == true) ? elem['imgUrl'] : imgBack;
            if (elem.id == i){
                let $card = createCard(img, 'card', elem['id'], elem['idCard']);
                $gBoard.appendChild($card);                     
            }    
        });
    }    
}

function rotateCard($gBoard, card, imgBack){    
    if (card['visible']){
        let $card = $d.getElementById(card['id']);
        let $img = $card.children[0];        
        $card.classList.add('flip-out');
        setTimeout(() => {
            $img.setAttribute('src', imgBack);
            $card.classList.remove('flip-out');            
            card['visible'] = false;
        }, 300);
    }else{
        let $card = $d.getElementById(card['id']);
        let $img = $card.children[0];        
        $card.classList.add('flip-out');
        setTimeout(() => {
            $img.setAttribute('src', card['imgUrl']);
            $card.classList.remove('flip-out');            
            card['visible'] = true;
        }, 300);
    }
    return card;    
}

function showStats($gStats, score, lifes, time){
    const $h3Score = document.createElement("h3");
    const $h3Lifes = document.createElement("h3");
    const $h3Time = document.createElement("h3");

    $gStats.innerHTML = '';
    
    
    $h3Lifes.innerText = `Lifes: ${lifes}`;
    $gStats.appendChild($h3Lifes);
    $h3Score.innerText = `Score: ${score}`;
    $gStats.appendChild($h3Score);
    $h3Time.innerText = `Time: ${time}`;
    $gStats.appendChild($h3Time);              
}

/*showMessages($messagesModal, points, lifes, time);*/
function showHideMessages($modal, title, message, wButton){
  

    const $title = $modal.querySelector('.modal-title');
    const $message = $modal.querySelector('.modal-paragraph');
    
   
    $title.innerHTML = '';
    $title.innerHTML = `${title}`
    $message.innerHTML = '';
    $message.innerHTML = `${message}`  

    if (wButton){
        const $button = $d.createElement('button');
        $button.classList.add('modal-btn');
        $button.innerHTML = 'Volver a intentar!';
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

/*deberia usar esto clearInterval(clockTempo); */
function startClock(){
    let cont = 0;
    let TimeFraction = 100, seconds = 0, minutes = 0, time = '';
    setInterval(() => {
        cont++;
        seconds = cont/(1000/TimeFraction);    
        minutes = Math.trunc(seconds / 60);
        
        seconds = (seconds%60).toFixed(2).toString();
        if (seconds.includes('.') === false){
            seconds = seconds + '.0';
        }
        if (seconds.indexOf('.') === 1){
            seconds = '0' + seconds;
        }    
        minutes = minutes.toString();
        if (minutes.length === 1){
            minutes = '0' + minutes;
        }
        time = `${minutes}:${seconds}`;

        showStats($gameStats, points, lifes, time);    
    }, TimeFraction); 
}

/*ENDS THE PRESENTATION OF THE GAME*/


