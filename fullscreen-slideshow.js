const createFullscreenSlideshow = (() => {
  const templateFullscreenSlideshow = document.createElement("template");
  templateFullscreenSlideshow.innerHTML = `
    <style>
      .container, .container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        -webkit-tap-highlight-color: transparent;
      }

      .container {
        --background: rgb(18 24 31);
        --color: #eee;
        --controlsDisplay: flex;
        display: none;
        position: fixed;
        inset: 0;
        z-index: 100;
        height: 100vh;
        background: var(--background);
        color: var(--color);
      }

      .open {
        display: flex;
      }

      .container button {
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        opacity: 0.8;
        -webkit-tap-highlight-color: transparent;
        outline: none;
        font-family: inherit;
      }

      .container button:active,
      .container button:focus {
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .container button:hover {
        opacity: 1;
      }

      .close {
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 100;
        width: 20px;
        height: 20px;
        transform: scale(0.95);
        transition: all 0.1s;
      }

      .close span, .close span::after {
        content: "";
        display: block;
        width: 100%;
        height: 2px;
        border-radius: 1px;
        background: var(--color);
      }

      .close span {
        transform: rotate(45deg);
      }

      .close span::after {
        transform: rotate(-90deg);
      }

      .close:hover {
        transform: scale(1);
      }

      .controls {
        position: fixed;
        z-index: 60;
        bottom: 1.8em;
        right: 5em;
        display: none;
      }

      .controls button {
        margin-inline: 0.2em;
        width: 30px;
        height: 30px;
        transform: scale(0.75);
      }

      .controls button:hover {
        transform: scale(0.85);
      }

      .content {
        margin: auto;
        display: inline-flex;
        scrollbar-width: none;
        height: 100vh;
        transform: translateX(0);
        will-change: transform;
        transition: all 0.36s cubic-bezier(0, 0, 0, 1);
        z-index: 50;
      }

      .item  {
        width: 100vw;
        height: auto;
        display: flex;
        overflow: hidden;
        transition: all 0.07s ease;
      }

      .item img {
        height: fit-content;
        width: fit-content;
        max-width: 100vw;
        max-height: 100vh;
        margin: auto;
        transform: scale(0.9);
        transition: all 0.2s ease-out;
        pointer-events: none;
      }

      .text {
        display: none;
        color: inherit;
        font-size: 0.8em;
        font-weight: bold;
        padding: 1em 0.5em;
        text-transform: lowercase;
        pointer-events: none;
      }

      .number {
        font-weight: normal;
        margin-right: 0.5em;
      }

      @media screen and (min-width: 992px){
        .content {
          height: 70vh;
          transition: all 0.3s ease-out;
        }

        .item {
          height: 100%;
          max-height: 68vh;
          width: auto;
          max-width: 90vw;
          display: block;
          overflow: visible;
          transition: all 0.2s;
        }

        .item img {
          height: 100%;
          width: auto;
          max-height: 68vh;
          transform: scale(1);
          filter: blur(3px) grayscale(80%);
          opacity: 0.3;
          transition: all 0.2s;
        }

        .active {
          z-index: 10;
          box-shadow: 0px 20px 30px -18px rgba(0,0,0,0.5);
          transform: scale(1.1);
        }

        .active .text {
          display: flex;
        }

        .active img {
          filter: none;
          opacity: 1;
        }

        .controls {
          display: var(--controlsDisplay);
        }
      }

      @media screen and (min-width: 992px) and (max-height: 500px){
        .content {
          height: 50vh;
        }

        .item {
          max-height: 48vh;
        }

        .item img {
          max-height: 48vh;
        }
      }
    </style>

    <div class="container">
      <button class="close"><span></span></button>
      <div class="content"></div>
      <div class="controls">
        <button class="prev">
          <svg width="30px" height="30px">
            <line x1="3" y1="15" x2="27" y2="15" stroke-linecap="round" stroke="black" stroke-width="2"></line>
            <line x1="3" y1="15" x2="12" y2="7" stroke-linecap="round" stroke="black" stroke-width="2"></line>
            <line x1="3" y1="15" x2="12" y2="23" stroke-linecap="round" stroke="black" stroke-width="2"></line>
          </svg>
        </button>
        <button class="next">
          <svg width="30px" height="30px">
            <line x1="3" y1="15" x2="27" y2="15" stroke-linecap="round" stroke="#eee" stroke-width="2"></line>
            <line x1="27" y1="15" x2="19" y2="7" stroke-linecap="round" stroke="#eee" stroke-width="2"></line>
            <line x1="27" y1="15" x2="19" y2="23" stroke-linecap="round" stroke="#eee" stroke-width="2"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  class FullscreenSlideshow extends HTMLElement {
    constructor(data, options){
      super();
      this.data = data;
      this.options = {
        background: "rgb(18 24 31)",
        fontColor: "#eee",
        controls: true,
        displayText: "tags",
        displayNumeration: true,
        ...options
      };
      
      this.activeIndex = 0;
      this.prevTranslate = 0;

      this.touchesEventData = {
        isDragging: false,
        startPosition: 0,
        currentPosition: 0
      };

      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(templateFullscreenSlideshow.content.cloneNode(true));
      this.updateStyleProperty();
      this.create();
    }

    updateStyleProperty(){
      this.shadowRoot.querySelector(".container").style.setProperty("--background", this.options.background);
      this.shadowRoot.querySelector(".container").style.setProperty("--color", this.options.fontColor);
      this.shadowRoot.querySelector(".container").style.setProperty("--controlsDisplay", this.options.controls ? "flex" : "none");
      this.shadowRoot.querySelectorAll(".controls line").forEach(item => item.setAttribute("stroke", this.options.fontColor));
    }

    getText(item){
      if(this.options.displayText === "name" && item.hasOwnProperty("name")) return item.name;
      if(!item.hasOwnProperty("tags")) return "";
      if(!Array.isArray(item.tags) && typeof item.tags !== "string") return "";

      const tags = Array.isArray(item.tags) ? item.tags : [item.tags];
      return tags.reduce((prev, curr) => prev + (curr === "" ? "" : ` #${curr.toLowerCase().split(" ").join("")}`), "");
    }

    create(){
      const content = this.shadowRoot.querySelector(".content");
      content.innerHTML = "";

      this.data.forEach((item, index) => {
        const element = document.createElement("div");
        element.classList.add("item");
        element.setAttribute("data-index", index);

        const paragraph = document.createElement("p");
        paragraph.classList.add("text");

        const text = this.getText(item);

        if(this.options.displayNumeration){
          paragraph.innerHTML += `<span class="number">${index + 1}/${this.data.length}</span>`
        }

        if(this.options.displayText){
          paragraph.innerHTML += `<span class="name">${text}</span>`;
        }

        const image = document.createElement("img");
        image.src = item.url;
        image.alt = text;

        element.appendChild(image);
        element.appendChild(paragraph);

        element.addEventListener("touchstart", this.touchStartHandler);
        element.addEventListener("touchmove", this.touchMoveHandler);
        element.addEventListener("touchend", this.touchEndHandler);
        element.addEventListener("click", this.clickItemHandler);

        content.appendChild(element);
      });

      this.shadowRoot.querySelector(".close").addEventListener("click", this.closeHandler);
      
      if(this.options.controls){
        this.shadowRoot.querySelector(".prev").addEventListener("click", this.prevItemHandler);
        this.shadowRoot.querySelector(".next").addEventListener("click", this.nextItemHandler);
      }
    }

    displayActive = () => {
      this.shadowRoot.querySelector(".active")?.classList.remove('active');
      const nextActiveElement = this.shadowRoot.querySelector(`div[data-index="${this.activeIndex}"]`);
      
      if(!nextActiveElement){
        this.activeIndex = 0;
        this.displayActive();
        return;
      } 

      nextActiveElement.classList.add("active");
      const translate = ((window.innerWidth - nextActiveElement.getBoundingClientRect().width) / 2) - nextActiveElement.getBoundingClientRect().left;
      this.shadowRoot.querySelector(".content").style.transform = `translateX(${this.prevTranslate + translate}px)`;
      this.prevTranslate += translate;
    }

    open(index = 0) {
      if(!this.shadowRoot.querySelector(".item")) this.create();
      this.activeIndex = index < 0 || index >= this.data.length ? 0 : index;
      this.shadowRoot.querySelector(".container").classList.add("open");
      this.displayActive();

      window.addEventListener("keyup", this.keyUpHandler);
      window.addEventListener("resize", this.displayActive);
    }

    close(){ 
      this.shadowRoot.querySelector(".container").classList.remove("open");
      this.shadowRoot.querySelector(".content").style.transform = "translateX(0px)";
      this.prevTranslate = 0;
      this.activeIndex = 0;
      this.touchesEventData.isDragging = false;
      this.touchesEventData.currentPosition = 0;
      this.touchesEventData.startPosition = 0;
      window.removeEventListener("keyup", this.keyUpHandler);
      window.removeEventListener("resize", this.displayActive);
    }

    update(data, options){
      this.close();

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

    //Events Handlers
    touchStartHandler = (e) => {
      this.touchesEventData.startPosition = e.touches[0].clientX;
      this.touchesEventData.isDragging = true;
    }

    touchMoveHandler = (e) => {
      if(this.touchesEventData.isDragging){
        this.touchesEventData.currentPosition = e.touches[0].clientX;
      }
    }

    touchEndHandler = () => {
      this.touchesEventData.isDragging = false;

      const movedBy = this.touchesEventData.startPosition - this.touchesEventData.currentPosition;

      if(movedBy > 50 && this.activeIndex < this.data.length - 1){
        this.activeIndex += 1;
      }else if(movedBy < -50 && this.activeIndex > 0){
        this.activeIndex -= 1;
      }

      this.touchesEventData.startPosition = 0;
      this.touchesEventData.currentPosition = 0;

      this.displayActive();
    }

    clickItemHandler = (e) => {
      if(!e.target.classList.contains("active")){
        this.activeIndex = +e.target.getAttribute("data-index");
        this.displayActive();
      }
    }

    keyUpHandler = (e) => {
      if(e.code === "ArrowRight"){
        this.nextItemHandler();
      }else if(e.code === "ArrowLeft"){
        this.prevItemHandler();
      }else if(e.code === "Escape"){
        this.close();
      }
    }

    prevItemHandler = () => {
      this.activeIndex = this.activeIndex === 0 ? this.data.length - 1 : this.activeIndex - 1;
      this.displayActive();
    }

    nextItemHandler = () => {
      this.activeIndex = this.activeIndex === this.data.length - 1 ? 0 : this.activeIndex + 1;
      this.displayActive();
    }

    //returned functions
    
    openHandler = (index = 0) => this.open(index);

    closeHandler = () => this.close();

    updateHandler = (data = [], options = {}) => this.update(data, options);
  }

  window.customElements.define("fullscreen-slideshow", FullscreenSlideshow);

  function createFullscreenSlideshow(data = [], options = {}){
    data.forEach(item => {
      if(typeof item?.url !== "string"){
        throw new Error('Invalid argument: each element in data should have the property "url" (path to the image).');
      }
    });

    const FS = new FullscreenSlideshow(data, options);
    document.body.appendChild(FS);
    
    return {open: FS.openHandler, close: FS.closeHandler, update: FS.updateHandler};
  }

  return createFullscreenSlideshow;
})();