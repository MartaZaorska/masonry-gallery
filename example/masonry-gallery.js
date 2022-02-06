const createMasonryGallery = (() => {
  const templateMasonryGallery = document.createElement("template");
  templateMasonryGallery.innerHTML = `
    <style>
      .container, .container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        -webkit-tap-highlight-color: transparent;
      }

      .container {
        --gap: 1em;
        --imageBorder: none;
        --items0: 1;
        --items1: 2;
        --items2: 3;
        --items3: 4;
        --items4: 5;
        --items5: 6;
        width: 100%;
        height: auto;
        column-count: var(--items0);
        -moz-column-count: var(--items0);
        -webkit-column-count: var(--items0);
        column-gap: var(--gap);
      }

      .item {
        margin: 0;
        display: grid;
        grid-template-rows: 1fr auto;
        break-inside: avoid;
        position: relative;
        overflow: hidden;
        box-shadow: 0px 10px 20px -9px rgba(0, 0, 0, 0.3);
        margin-bottom: var(--gap);
        border: var(--imageBorder);
      }

      .item p {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: fit-content;
        background: rgba(40, 40, 40, 0.4);
        backdrop-filter: blur(3px);
        color: #fff;
        padding: 0.7em;
        font-size: 0.9em;
        font-weight: bold;
        line-height: 1.3;

        transform: translateY(102%);
        transition: all 0.1s ease;

        display: none;
      }

      .item img {
        grid-row: 1 / -1;
        grid-column: 1;
        max-width: 100%;
        width: 100%;
        display: block;
        pointer-events: none;
      }

      .pointer .item {
        cursor: pointer;
      }

      @media screen and (min-width: 576px){
        .container {
          column-count: var(--items1);
          -moz-column-count: var(--items1);
          -webkit-column-count: var(--items1);
        }
      }

      @media screen and (min-width: 768px){
        .container {
          column-count: var(--items2);
          -moz-column-count: var(--items2);
          -webkit-column-count: var(--items2);
        }
      }

      @media screen and (min-width: 992px){
        .container {
          column-count: var(--items3);
          -moz-column-count: var(--items3);
          -webkit-column-count: var(--items3);
        }

        .item p {
          display: block;
        }
        
        .item:hover p{
          transform: translateY(0);
        }
      }

      @media screen and (min-width: 1200px){
        .container {
          column-count: var(--items4);
          -moz-column-count: var(--items4);
          -webkit-column-count: var(--items4);
        }
      }

      @media screen and (min-width: 1440px){
        .container {
          column-count: var(--items5);
          -moz-column-count: var(--items5);
          -webkit-column-count: var(--items5);
        }
      }
    </style>

    <div class="container"></div>
  `;

  class MasonryGallery extends HTMLElement {
    constructor(data, options, onClickHandler){
      super();
      this.data = [];

      //default options
      this.options = {
        responsive: [1,2,3,4,5,6],
        imageBorder: "none",
        gap: "12px",
        displayTextOnHover: false,
        cursorPointer: false,
      }

      this.onClickHandler = onClickHandler;

      this.attachShadow({mode: "open"});
      this.shadowRoot.appendChild(templateMasonryGallery.content.cloneNode(true));
      this.update(data, options);
    }

    updateStyleProperty(){
      const container = this.shadowRoot.querySelector(".container");
      container.style.setProperty("--gap", this.options.gap);
      container.style.setProperty("--imageBorder", this.options.imageBorder);
      this.options.responsive.forEach((value, index) => container.style.setProperty(`--items${index}`, value <= 0 ? index + 1 : value));
    }

    getText(item){
      if(this.options.displayTextOnHover === "name" && item.hasOwnProperty("name")) return item.name;
      if(!item.hasOwnProperty("tags")) return "";
      if(!Array.isArray(item.tags) && typeof item.tags !== "string") return "";

      const tags = Array.isArray(item.tags) ? item.tags : [item.tags];
      return tags.reduce((prev, curr) => prev + (curr !== "" ? ` #${curr.toLowerCase().split(" ").join("")}` : ""), "");
    }

    create(){
      const gallery = this.shadowRoot.querySelector(".container");
      gallery.innerHTML = "";

      this.data.forEach((item, index) => {
        const element = document.createElement("div");
        element.classList.add("item");

        const image = document.createElement("img");
        image.src = item.url;
        image.alt = item.name || "";
        element.appendChild(image);

        if(this.options.displayTextOnHover){
          const paragraph = document.createElement("p");
          const text = this.getText(item);
          paragraph.innerText = text;
          text !== "" && element.appendChild(paragraph);
        }

        element.addEventListener("click", () => this.onClickHandler(item, index));
        gallery.appendChild(element);
      });

      if(this.options.cursorPointer){
        gallery.classList.add("pointer"); 
      }
    }

    update(data, options){
      if(data?.length > 0){
        data.forEach(item => {
          if(typeof item?.url !== "string"){
            throw new Error('Invalid argument: each element in data should have the property "url" (path to the image).');
          }
        });
    
        this.data = data;
      }

      this.options = {
        ...this.options,
        ...options
      };

      this.updateStyleProperty();
      this.create();
    }

    updateHandler = (data = [], options = {}) => this.update(data, options);
  }

  window.customElements.define("masonry-gallery", MasonryGallery);

  function createMasonryGallery(elementOrSelector, data = [], options = {}, onClickHandler = (item, index) => {}){
    const element = typeof elementOrSelector === "string" ? document.querySelector(elementOrSelector) : elementOrSelector;
    
    if(Object.getPrototypeOf(element).toString().indexOf("HTML") < 0){
      throw new Error('Invalid argument: "elementOrSelector" must be an HTML element or a selector to an existing HTML element.');
    }
    
    const MG = new MasonryGallery(data, options, onClickHandler);
    element.appendChild(MG);

    return { update: MG.updateHandler };
  }

  return createMasonryGallery;
})();