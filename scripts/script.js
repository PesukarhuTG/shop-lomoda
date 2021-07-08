const headerCityButton = document.querySelector('.header__city-button');
const subheaderСart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartBtnClose = document.querySelector('.cart__btn-close');
let hash = location.hash.substring(1);

/* =============== SET CITY =============================== */

//check the localStorage after refreshing the page
const updateLocation = () => {
    headerCityButton.textContent = 
        localStorage.getItem('lomoda-location') || 'Ваш город?';
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');

    if (city !== null) {
        localStorage.setItem('lomoda-location', city); //save customer's city in local storage
    } 
    updateLocation();
});

updateLocation();

/* =============== SCROLL BLOCKED =============================== */
const disabledScroll = () => {

    //find right scroll's width
    const widthScroll = window.innerWidth - document.body.offsetWidth; 

    //set new property for Object 'dbScrollY' = how many px the customer scrolled from top
    document.body.dbScrollY = window.scrollY;

    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left:0;
        right:0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `;
};

const enabledScroll = () => {
    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY,
    });
};

/* =============== CART MODAL WINDOW =============================== */
const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disabledScroll();
}

const cartModalClose = () => {
    cartOverlay.classList.remove('cart-overlay-open');
    enabledScroll();
}

subheaderСart.addEventListener('click', cartModalOpen);

//close modal window through delegation
cartOverlay.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
        cartModalClose();
    }
});

//close modal window if pressed Escape button
document.addEventListener('keydown', function(e) {
    if (e.code == 'Escape') {
        cartModalClose();
    }
    });

/* =============== GET DATA FROM SERVER /db.json / =============================== */
const getData = async () => {
    const data = await fetch('db.json');

    if (data.ok) {
        return data.json();
    } else {
        throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`);
    }
};

const getGoods = (callback, value) => {

        //output data in a convenient format
        getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item.category === value));
            } else {
                callback(data);
            }
        })
        .catch(err => {
            console.error(err);
        })
};


/* =============== CREATE GOODS PAGE FROM db =============================== */

try {

    //check page
    const goodsList = document.querySelector('.goods__list');
    const goodsTitle = document.querySelector('.goods__title');
    const navigationLink = document.querySelectorAll('.navigation__link');
    
    if (!goodsList) {
        throw 'This is not a goods page'
    }

    //change title
    goodsTitle.textContent = '';

    navigationLink.forEach(item => {
        item.addEventListener('click', (e) => {
        goodsTitle.textContent = e.target.textContent;
        })
    });


    //create the element from db
    const createCard = ({ id, preview, cost, brand, name, sizes }) => {
        
        const li =document.createElement('li');

        li.classList.add('goods__item');
        li.innerHTML = `
                <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="${name}">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ? 
                        `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                        ''
                    }
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
                </article>
        `;

        return li;
    }

    //rendering on the page
    const renderGoodsList = data => {

        goodsList.textContent = ''; //clear the goods page

        data.forEach(item => {
            const card = createCard(item);
            goodsList.append(card);
            
        });
        
    };

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1);
        console.log(hash);
        getGoods(renderGoodsList, hash);

    });

    getGoods(renderGoodsList, hash);

} catch (err) {
    console.warn(err);
}