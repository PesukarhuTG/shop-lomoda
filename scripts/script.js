const headerCityButton = document.querySelector('.header__city-button');
const subheaderСart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartBtnClose = document.querySelector('.cart__btn-close');

/* =============== SET CITY =============================== */

//check the localStorage after refreshing the page
headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');
    localStorage.setItem('lomoda-location', city); //save customer's city in local storage
    headerCityButton.textContent = city;
    
});

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


