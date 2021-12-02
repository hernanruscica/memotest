
/*******************************SETUP OF THE GAME**************************************************************/
const cardsQuantity = 20, maxLifes = 3, defaultQuery = 'cats';
let lifes, score, query;
const imgBack = './imgs/tile.jpg';
let imagesArr;
/*******************************SETUP OF THE GAME**************************************************************/


/*******************************HTML ELEMENTS**************************************************************/
const $d = document;
const $gameBoard = $d.querySelector('.game-board');
let $cards = ''; /*defined in fillGameBoard() */
const $gameStats = $d.querySelector('.header-stats');
const $messagesModal = $d.querySelector('.modal');

/*******************************HTML ELEMENTS**************************************************************/


/*once the document is fully loaded, Do something*/
$d.addEventListener('DOMContentLoaded', () => {
    console.log('fully loaded');      
    /*console.log($gameBoard, $gameStats, $messagesModal); */
    resetGame()
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
    showStats($gameStats, score, lifes, '00:01:12')
    let currentCardId = '', lastCardId = '', currentCardIdPair = '', lastCardIdPair = '';    
    let clicksCounter = 0;
    
    $d.addEventListener('click', (e) => {   
        if (e.target.classList.contains('cardImg')){            
            /*console.log(e.target.parentElement.id);*/
            lastCardId = (currentCardId !== '') ? currentCardId : e.target.parentElement.id;
            currentCardId = e.target.parentElement.id;
            lastCardIdPair = (currentCardIdPair !== '') ? currentCardIdPair : e.target.parentElement.dataset.idpair;
            currentCardIdPair = e.target.parentElement.dataset.idpair;
            
            console.clear();      

            if (lastCardId !== '' && clicksCounter%2 !== 0){
                if (currentCardId !== lastCardId && currentCardIdPair === lastCardIdPair){
                    console.log('sumaste 1 punto!');
                }else{
                    console.log('perdiste 1 vida!');
                }
            }

            rotateCard($gameBoard, currentCardId, currentCardIdPair);
            clicksCounter++;
            
        }
        
        console.log(`Last Card Id: ${lastCardId} - Last Card Id Pair: ${lastCardIdPair}
                    \nCurrent Card Id: ${currentCardId} - Current Card Id Pair: ${currentCardIdPair}\n`);      
    });    
    
}
function updateState(i){
    
    switch (i){
        case 0:         
            /* INTRO */                
            showHideMessages($messagesModal, 'Mira las cartas', 'y memoriza los pares', false);
            $gameBoard.innerHTML = '';
            console.log('restarting the game');
            lifes = 3; score = 0, stateIndex = 0;
            /*Once the async function returns the array of images*/
            fillWithImgs('cat', cardsQuantity/2, 0, cardsQuantity*2).then((images) => {
                let imagesArr;
                imagesArr = images; 
                /*console.log(imagesArr);*/
                cards = generateCards(cardsQuantity, imagesArr);
                changeVisibilityAll(cards, true); 
                console.clear();
                console.log(`current state: ${states[stateIndex]}`);
            }); 
            setTimeout(() => {
                showHideMessages($messagesModal, 'Mira las cartas', 'y memoriza los pares', false);
                stateIndex++;
                updateState(stateIndex);
            }, 3000);            
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
                            score++;
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

///////////////////* HASTA ACA REFACTORIZADO *////////////////////////////


/*showMessages($messagesModal, points, lifes, time);*/
function showHideMessages($modal, title, message, wButton){ 
    const $title = $modal.querySelector('.modal-title');
    const $message = $modal.querySelector('.modal-paragraph');
    $title.innerHTML = '';
    $title.innerHTML = `${title}`
    $message.innerHTML = '';
    $message.innerHTML = `${message}`  
    if (wButton && !$modal.querySelector('button')  ){
        const $button = $d.createElement('button');
        $button.classList.add('modal-btn');
        $button.innerHTML = 'Volver a intentar!';
        $button.addEventListener('click', (e) => {
            $modal.classList.remove('show');
            $modal.classList.add('hide');
            $d.getElementById('protection').classList.remove('protectFromClicks');
            stateIndex = 0;
            updateState(stateIndex);
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


