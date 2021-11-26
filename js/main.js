

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

/*SETUP OF THE GAME*/
const cardsQuantity = 20;
let cards;

/*Once the async function returns the array of images*/
fillWithImgs('car', cardsQuantity/2, 0, cardsQuantity*2).then((images) => {
    let imagesArr;
    imagesArr = images; 
    /*console.log(imagesArr);*/
    cards = generateCards(cardsQuantity, imagesArr);
    /*console.log(cards);*/
});

/*ENDS THE LOGIC OF THE GAME, NOT THE PRESENTATION*/




$d = document;
const $gameBoard = $d.querySelector('.game-board');

/*once the document is fully loaded, read the id from the clicked cards*/
document.addEventListener('DOMContentLoaded', () => {
    /* console.log("todo cargado");  */
    /*loadClickedCard();*/   
});


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


/*waiting for full load*/
let delay = 1000;
setTimeout(() => {
                    fillGameBoard($gameBoard, cards)
                 }, delay);


/*loads the gameboard with all the cards mixed*/
function fillGameBoard($gBoard, cards){            
    for (let i=0; i < cards.length ; i++){        
        cards.forEach((elem) => {
            if (elem.id == i){
                let $card = createCard(elem['imgUrl'], 'card', elem['id'], elem['idCard']);
                $gBoard.appendChild($card);         
            }    
        });
    }    
}



/*HASTA ACA REVISE E HICE LA REFACTORIZACION DEL CODIGO */





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

