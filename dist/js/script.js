/* global Handlebars, utils, AmountWidget */





  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settingsAPI = {
  url: 'http://localhost:3131',
  products: 'products',
  orders: 'orders',
};


  const templates = {
  menuProduct: Handlebars.compile(
    document.querySelector(select.templateOf.menuProduct).innerHTML
  ),
  cartProduct: Handlebars.compile(
    document.querySelector('#template-cart-product').innerHTML
  ),
};

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

 thisProduct.renderInMenu();
thisProduct.initAccordion();
thisProduct.initOrderForm();
thisProduct.processOrder();
thisProduct.processImages();

  }

 renderInMenu() {
  const thisProduct = this;

  const generatedHTML = templates.menuProduct(thisProduct.data);
  thisProduct.element = utils.createDOMFromHTML(generatedHTML);

  thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

  const menuContainer = document.querySelector(select.containerOf.menu);
  menuContainer.appendChild(thisProduct.element);
}

initAccordion() {
  const thisProduct = this;

  const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

  clickableTrigger.addEventListener('click', function(event){
    event.preventDefault();

    const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

    for(let activeProduct of activeProducts){
      activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
    }

    thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
  });
}



  initOrderForm() {
    const thisProduct = this;

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    

  thisProduct.form.addEventListener('submit', function(event){
  event.preventDefault();
  thisProduct.processOrder();
  thisProduct.addToCart();
});
thisProduct.cartButton.addEventListener('click', function(event){
  event.preventDefault();
  thisProduct.processOrder();
  thisProduct.addToCart();
});



    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    thisProduct.amountWidget = new AmountWidget(
  thisProduct.element.querySelector(select.menuProduct.amountWidget)
);
thisProduct.amountWidget.dom.wrapper.addEventListener('updated', function(){
  thisProduct.processOrder();
});


  }

  processOrder() {
    const thisProduct = this;
    


    const formData = utils.serializeFormToObject(thisProduct.form);
     thisProduct.params = formData;
    
    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options){
        const option = param.options[optionId];

        const optionSelected =
          formData[paramId] &&
          formData[paramId].includes(optionId);

        if(optionSelected && !option.default){
          price += option.price;
        }

        if(!optionSelected && option.default){
          price -= option.price;
        }
      }
    }

    thisProduct.priceSingle = price;
  thisProduct.priceElem.innerHTML = price;
  thisProduct.processImages();


  }

  processImages() {
  const thisProduct = this;

  if (!thisProduct.data.params) {
    return;
  }

  for (let paramId in thisProduct.data.params) {
    const param = thisProduct.data.params[paramId];

    for (let optionId in param.options) {
      const optionSelected =
        thisProduct.form.querySelector(
          `input[name="${paramId}"][value="${optionId}"]:checked`
        );

      const images = thisProduct.element.querySelectorAll(
        `.product__images [data-option="${optionId}"]`
      );

      for (let image of images) {
        if (optionSelected) {
          image.classList.add(classNames.menuProduct.imageVisible);
        } else {
          image.classList.remove(classNames.menuProduct.imageVisible);
        }
      }
    }
  }
}

 prepareCartProduct() {
  const thisProduct = this;

  return {
    id: thisProduct.id,
    name: thisProduct.data.name,
    amount: thisProduct.amountWidget.value,
    price: thisProduct.priceSingle * thisProduct.amountWidget.value,
    priceSingle: thisProduct.priceSingle,
    params: thisProduct.params,
  };
}

prepareCartProductParams() {
  return {};
}
addToCart() {
  const thisProduct = this;

  const event = new CustomEvent('add-to-cart', {
    bubbles: true,
    detail: {
      product: thisProduct.prepareCartProduct(),
    },
  });

  thisProduct.element.dispatchEvent(event);
}


}

class Cart {
  constructor(element) {
  const thisCart = this;

 thisCart.dom = {};
thisCart.dom.wrapper = element;

thisCart.products = [];

thisCart.getElements();
thisCart.initActions();



  console.log('new Cart', thisCart);
}

  getElements() {
  const thisCart = this;

  thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector('.cart__summary');
  thisCart.dom.productList = thisCart.dom.wrapper.querySelector('.cart__order-summary');
  thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector('.cart__order-price-sum');
  thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector('.cart__order-price li:nth-child(2) .cart__order-price-sum');
  thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector('.cart__order-price li:nth-child(3) .cart__order-price-sum');
  thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector('.cart__total-number');
  thisCart.dom.form = thisCart.dom.wrapper.querySelector('form');
  thisCart.dom.address = thisCart.dom.wrapper.querySelector('input[name="address"]');
  thisCart.dom.phone = thisCart.dom.wrapper.querySelector('input[name="phone"]');
  
  thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector('.cart__total-price strong');
  
}
initActions() {
  const thisCart = this;

  thisCart.dom.toggleTrigger.addEventListener('click', function(event){
    event.preventDefault();
    thisCart.dom.wrapper.classList.toggle('active');
  });

  thisCart.dom.form.addEventListener('submit', function(event){
    event.preventDefault();
    console.log('submit cart');
  });
document.addEventListener('add-to-cart', function(event){
  thisCart.add(event.detail.product);
});


thisCart.dom.wrapper.addEventListener('updated', function(){
  thisCart.update();
});


}
add(menuProduct) {
  const thisCart = this;

  const cartProduct = new CartProduct(menuProduct, thisCart.dom.productList);
  thisCart.products.push(cartProduct);

  thisCart.update();
}
update() {
  const thisCart = this;

  let totalNumber = 0;
  let subtotalPrice = 0;

  for(let product of thisCart.products){
    totalNumber += product.amount;
    subtotalPrice += product.price;
  }

  const deliveryFee = totalNumber > 0 ? 20 : 0;
  const totalPrice = subtotalPrice + deliveryFee;

  thisCart.dom.subtotalPrice.innerHTML = `$${subtotalPrice}`;
  thisCart.dom.deliveryFee.innerHTML = `$${deliveryFee}`;
  

  thisCart.dom.totalPrice.innerHTML = `$${totalPrice}`;
  thisCart.dom.totalNumber.innerHTML = totalNumber;


}


}

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    
    thisCartProduct.dom = {};

    
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;

    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

    
    thisCartProduct.renderInCart(element);
    thisCartProduct.dom.wrapper = thisCartProduct.element;

    
    thisCartProduct.initAmountWidget();
  }


  renderInCart(element) {
    const thisCartProduct = this;

    const generatedHTML = templates.cartProduct(thisCartProduct);
    thisCartProduct.element = utils.createDOMFromHTML(generatedHTML);

    element.appendChild(thisCartProduct.element);
  }
  
  initAmountWidget() {
  const thisCartProduct = this;

  thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.element.querySelector('.widget-amount'));

  thisCartProduct.amountWidget.dom.input.addEventListener('change', function(){
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

    thisCartProduct.element.querySelector('.cart__order-summary__price').innerHTML = `$${thisCartProduct.price}`;

    const event = new CustomEvent('updated', { bubbles: true });
thisCartProduct.dom.wrapper.dispatchEvent(event);

  });
}


}


const app = {
  init: function(){
    console.log('*** App starting ***');
    this.initMenu();
    this.initCart();
  },

  initMenu: function(){
    const url = settingsAPI.url + '/' + settingsAPI.products;

    fetch(url)
      .then(response => response.json())
      .then(products => {
        const menuContainer = document.querySelector(select.containerOf.menu);
        menuContainer.innerHTML = '';

        for (let product of products) {
          new Product(product.id, product);
        }
      });
  },

  initCart: function(){
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);
  },
};

app.init();




