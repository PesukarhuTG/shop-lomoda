const headerCityButton = document.querySelector('.header__city-button');
const subheaderСart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartBtnClose = document.querySelector('.cart__btn-close');
let hash = location.hash.substring(1);
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');

// change a word in the cart
const declOfNum = (n, titles) => {
    return n + ' ' + titles[n % 10 === 1 && n % 100 !== 11 ?
        0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

/* =============== CREATE CART LIST =============================== */
const renderCart = () => {
    cartListGoods.textContent = '';

    const cartItems = getLocalStorage();

    let totalPrice = 0;

    cartItems.forEach((item, i) => {

        const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${i+1}</td>
                    <td>${item.brand} ${item.name}</td>
                    ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
                    ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
                    <td>${item.cost} &#8381;</td>
                    <td><button class="btn-delete" data-id=${item.id}>&times;</button></td>
                `;
        totalPrice += item.cost;
        cartListGoods.append(tr);
    });

    cartTotalCost.textContent = totalPrice + ' ₽';
};

const deleteItemCart = id => {
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter(item => item.id !== id);
    setLocalStorage(newCartItems);
    updateCountGoodsCard();
};

cartListGoods.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete')) {
        deleteItemCart(e.target.dataset.id);
        renderCart();
    };
});


/* =============== SET CITY =============================== */

//check the localStorage after refreshing the page
const updateLocation = () => {
    headerCityButton.textContent = 
        localStorage.getItem('lomoda-location') || 'Ваш город?';
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город').trim();

    if (city !== null) {
        localStorage.setItem('lomoda-location', city); //save customer's city in local storage
    } 
    updateLocation();
});

updateLocation();

/* =============== SET & GET A CART DATA WITH A LOCAL STORAGE =============================== */

const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lomoda')) || [];
const setLocalStorage = (data) => localStorage.setItem('cart-lomoda', JSON.stringify(data));

function updateCountGoodsCard() {
    if (getLocalStorage().length) {
        console.log(getLocalStorage().length);
        subheaderСart.textContent = declOfNum(getLocalStorage().length, ['товар', 'товара', 'товаров']);
    } else {
        
        subheaderСart.textContent = 'Корзина';
    }
}

updateCountGoodsCard();

/* =============== SCROLL BLOCKED =============================== */

const disabledScroll = () => {

    if (document.disableScroll) return;

    //find right scroll's width
    const widthScroll = window.innerWidth - document.body.offsetWidth; 

    //set new property disableScroll
    document.disableScroll = true;

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
    document.disableScroll = false;

    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY,
    });
};

/* =============== CART MODAL WINDOW =============================== */

const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disabledScroll();
    renderCart();
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

const getGoods = (callback, prop, value) => {

        //output data in a convenient format
        getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item[prop] === value)); 
            } else {
                callback(data); // output all products
            }
        })
        .catch(err => {
            console.error(err);
        })
};

/* =============== CREATE A GOODS PAGE FROM db =============================== */

try {

    //check page
    const goodsList = document.querySelector('.goods__list');
    
    if (!goodsList) {
        throw 'This is not a goods page'
    }

    const goodsTitle = document.querySelector('.goods__title');

    const changeTitle = () => {
        goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
    };

    

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
        getGoods(renderGoodsList, 'category', hash);
        changeTitle();
    });

    changeTitle();
    getGoods(renderGoodsList, 'category', hash);

} catch (err) {
    console.warn(err);
}

/* =============== CREATE A SINGLE GOOD PAGE =============================== */

try {
    if (!document.querySelector('.card-good')) {
        throw 'This is not a single good page!';
    }

    const cardGoodImage = document.querySelector('.card-good__image');
    const cardGoodBrand = document.querySelector('.card-good__brand');
    const cardGoodTitle = document.querySelector('.card-good__title');
    const cardGoodPrice = document.querySelector('.card-good__price');
    const cardGoodColor = document.querySelector('.card-good__color');
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
    const cardGoodColorList = document.querySelector('.card-good__color-list');
    const cardGoodSizes = document.querySelector('.card-good__sizes');
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
    const cardGoodBuy = document.querySelector('.card-good__buy');

    const generateList = (data) => data.reduce((html, item, i) => html + 
        `<li class="card-good__select-item"data-id="${i}">${item}</li>`, '');

    const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {

        //create an Object for the Cart
        const data = { brand, name, cost, id };

        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodImage.alt = `${brand} ${name}`
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;
        cardGoodPrice.textContent = `${cost} ₽`;

        if (color) {
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            cardGoodColorList.innerHTML = generateList(color); //generate color list
            } else {
                cardGoodColor.style.display = 'none';
            }

        if (sizes) {
            cardGoodSizes.textContent = sizes[0];
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes); //generate sizes list
            }  else {
                cardGoodSizes.style.display = 'none';
            }

        if (getLocalStorage().some(item => item.id === id)) {
            cardGoodBuy.classList.add('delete');
            cardGoodBuy.textContent = 'Удалить из корзины';
        }

        cardGoodBuy.addEventListener('click', () => {
            if (cardGoodBuy.classList.contains('delete')) {
                deleteItemCart(id);
                cardGoodBuy.classList.remove('delete');
                cardGoodBuy.textContent = 'Добавить в корзину';
                return;
            }

            if (color) data.color = cardGoodColor.textContent;
            if (sizes) data.size = cardGoodSizes.textContent;

            cardGoodBuy.classList.add('delete');
            cardGoodBuy.textContent = 'Удалить из корзины';
    
            const cardData = getLocalStorage();
            cardData.push(data);
            setLocalStorage(cardData);
            updateCountGoodsCard();
        });
    };

        cardGoodSelectWrapper.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.target;

                 //click - and the list will be opened
                if (target.closest('.card-good__select')) {
                    target.classList.toggle('card-good__select__open');
                }

                //click to element - and the list will be closed
                if (target.closest('.card-good__select-item')) {
                    const cardGoodSelect = item.querySelector('.card-good__select');
                    cardGoodSelect.textContent = target.textContent;
                    cardGoodSelect.dataset.id = target.dataset.id;
                    cardGoodSelect.classList.remove('card-good__select__open'); //closed list
                }
            });
        });

    getGoods(renderCardGood, 'id', hash);

} catch (err) {
    console.warn(err);
}