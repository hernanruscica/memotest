const $gameBoard = document.querySelector('.game-board');
const cardsQuantity = 10, photosQuantity = 100, query = 'trees';
let cards;

/*https://pixabay.com/api/docs/
busca las imagenes de pixabay para llenar las cards.
*/
async function start(){
    

    const response = await fetch(`https://pixabay.com/api/?key=24469039-f2a18081cb188fd1a6f5434af&q=${query}&image_type=photo&per_page=${photosQuantity}`);
    const data = await response.json();
    
    cards = loadCards(data, cardsQuantity, photosQuantity);   
    /*console.log(cards);*/

    fillGameBoard($gameBoard, cards);
    setTimeout( hideCardsAll(), 8000);
    
}
start();


/*load cards from the data*/
function loadCards(data, cardsQuantity, photosQuantity){
    const cards = [];
    const randomCardsIndex = [];

    /*Loads an array of random numbers and uniques*/
    let i = 0;
    while (i < cardsQuantity) {
        let randomNum = Math.floor(Math.random() * (photosQuantity - 1)) + 0;
        if (!randomCardsIndex.includes(randomNum)) {
            randomCardsIndex.push(randomNum);                
            i++;
        }
    }
    /*console.log(randomCardsIndex);*/    

    /*for each random number, add a card to the cards array*/
    randomCardsIndex.forEach((elem) => {
        /*console.log(data['hits'][elem]['previewURL']);*/
        elem = parseFloat(elem);
        cards.push({'id' : elem, 'imgUrl' : data['hits'][elem]['previewURL']});
        cards.push({'id' : elem, 'imgUrl' : data['hits'][elem]['previewURL']});
    });
    /*  Cards structure
        [{id: number,  imgUrl: string},...] */
    /*console.log(cards);*/

    return cards;
}

/* creates a square card. Needs the url of the image ande size of the sides. returns a node of the card.
    */
function createCard(imgUrl, classCard, id, idOrder){      
    const $div = document.createElement("div");    
        $img = document.createElement("img");          
        $img.setAttribute('src', imgUrl);    
        $div.appendChild($img);
        $div.classList.add(classCard);
        $div.setAttribute('id', id);
        $div.setAttribute('data-idorder', idOrder);    
    return $div;
}
/*console.log(createCard('https://cdn.pixabay.com/photo/2016/02/26/16/32/bulldog-1224267_150.jpg', 'card', 1));*/

function fillGameBoard($gameBoard, cards){    
    
    const randomOrder = [];
    let i = 0;
    while (i < cards.length ){
        let randomNum = Math.floor(Math.random() *  parseFloat(cards.length ));
        if (!randomOrder.includes(randomNum)) {
            randomOrder.push(randomNum);                
            i++;
        }
    }      
    i = 0;
    randomOrder.forEach((elem) => {
       /* console.log(cards[elem]);*/

        const $card01 = createCard(cards[elem]['imgUrl'], 'card', cards[elem]['id'], i);
        
        $gameBoard.appendChild($card01);             
        i++;
    });    
    
}

/*once the document is fully loaded, read the id from the clicked cards*/
document.addEventListener('DOMContentLoaded', () => {
        /* console.log("todo cargado");  */

        loadClickedCard();
       
    });

let currentCardId = '', lastCardId = '', currentCardIdOrder = '';

function loadClickedCard(){
    document.addEventListener('click', (e) => {
        
        if ( e.target.classList.contains('card')) {
            lastCardId = currentCardId;
            currentCardId = e.target.id;     
            currentCardIdOrder = e.target.dataset.idorder;
        }else {
            lastCardId = currentCardId;
            currentCardId = e.target.parentElement.id;
            currentCardIdOrder = e.target.parentElement.dataset.idorder;
        }
        console.clear();             
        (currentCardId !== '') ? console.log(`Current Card: ${currentCardId}\nLast Card: ${lastCardId}\nCurrent Card Order: ${currentCardIdOrder}`) : console.log('click outside a card');              
        
        /*hideCard(currentCardId, currentCardIdOrder);*/
        
        
        showCard(currentCardId, currentCardIdOrder)
    })
}

function resetSelectedCards(){
    currentCardId = '', lastCardId = '';
}

function hideCard(cardId, cardIdOrder){
    /*found the selected card*/
    const $cards = document.querySelectorAll('.card');
    const $card = $cards[cardIdOrder];

    /*turn the card to disapear */
    $card.classList.add('flip-out');    
    setTimeout(() => {$card.children[0].setAttribute('src', './imgs/tile.jpg')}, 200);
    setTimeout(() => {$card.classList.add('flip-in')}, 200);        
}

function hideCardsAll(){
    /*found the selected card*/
    const $cards = document.querySelectorAll('.card');
    $cards.forEach((elem) => {
        /*turn the card to disapear */
        elem.classList.add('flip-out');    
        setTimeout(() => {elem.children[0].setAttribute('src', './imgs/tile.jpg')}, 200);
        setTimeout(() => {elem.classList.add('flip-in');}, 200);
    })    
}

function showCard(cardId, cardIdOrder){
    
    const $cards = document.querySelectorAll('.card');
    const $card = $cards[cardIdOrder];
    const imgURL = cards[cardIdOrder]['imgUrl'];
    /*turn the card to disapear */
    $card.classList.remove('flip-in'); 
    setTimeout(() => {$card.children[0].setAttribute('src', `${imgURL}`)}, 200);
    setTimeout(() => {$card.classList.remove('flip-out')}, 200);        

    console.log(`show card ${cardIdOrder} ${imgURL}`);
}

