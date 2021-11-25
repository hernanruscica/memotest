const $gameBoard = document.querySelector('.game-board');
const cardsQuantity = 10, photosQuantity = 100, query = 'cars';

/*https://pixabay.com/api/docs/
busca las imagenes de pixabay para llenar las cards.
*/
async function start(){
    

    const response = await fetch(`https://pixabay.com/api/?key=24469039-f2a18081cb188fd1a6f5434af&q=${query}&image_type=photo&per_page=${photosQuantity}`);
    const data = await response.json();
    
    let cards = loadCards(data, cardsQuantity, photosQuantity);   
    /*console.log(cards);*/

    fillGameBoard($gameBoard, cards);
}
start();


/*load cards from the data*/
function loadCards(data, cardsQuantity, photosQuantity){
    const cards = [];
    const randomCardsIndex = [];
    let i = 0;
    while (i < cardsQuantity) {
        let randomNum = Math.floor(Math.random() * (photosQuantity - 1)) + 0;

        if (!randomCardsIndex.includes(randomNum)) {
            randomCardsIndex.push(randomNum);                
            i++;
        }
    }
    /*console.log(randomCardsIndex);*/    
    randomCardsIndex.forEach((elem) => {
        /*console.log(data['hits'][elem]['previewURL']);*/
        cards.push({'id' : elem, 'imgUrl' : data['hits'][elem]['previewURL']});
        cards.push({'id' : elem, 'imgUrl' : data['hits'][elem]['previewURL']});
    });
    /*console.log(cards);*/
    return cards;
}

/* creates a square card. Needs the url of the image ande size of the sides. returns a node of the card*/
function createCard(imgUrl, classCard, id){      
    const $div = document.createElement("div"),
          $img = document.createElement("img");          
    $img.setAttribute('src', imgUrl);    
    $div.appendChild($img);
    $div.classList.add(classCard);
    $div.setAttribute('id', id);
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
    randomOrder.forEach((elem) => {
       /* console.log(cards[elem]);*/

        const $card01 = createCard(cards[elem]['imgUrl'], 'card', cards[elem]['id']);
        
        $gameBoard.appendChild($card01);             
        
    });    
}



