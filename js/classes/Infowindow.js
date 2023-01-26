

export class Infowindow {
    constructor() {
        //user can choose to show info about where data is stored...his decision ist stored here:
        this.storage_key_info_about_data = localStorage.getItem("info_about_data");
        //stores the indice of bottom-btns here, whenever info-window is opened:
        this.active_bottom_buttons = [];
        this.infoIcon = document.querySelector("#info-window h2");
        this.closeBtn = document.querySelector("#info-window .close-window-button");
    }

    firstTimeOpen() {
        if(this.storage_key_info_about_data !== "true")
        {
            this.openIWin();
        }
    }
    openIWin() {
        let iWin = document.getElementById("info-window");
        iWin.style.opacity = "1";
        iWin.style.pointerEvents = "auto";

        this._deactivateButtons();

        this.closeBtn.addEventListener("click", () => {
            this._closeIWin();
        });
    }
    _closeIWin() {
        let iWin = document.getElementById("info-window");
        iWin.style.opacity = "0";
        iWin.style.pointerEvents = "none";

        this._activateButtons();
        this.active_bottom_buttons.length = 0;
    }
    _deactivateButtons() {
        let bBtns = document.querySelectorAll(".bottom-buttons");
        for(let i = 0 ; i < bBtns.length ; i++)
        {
            if(bBtns[i].classList.contains("active"))
            {
                this.active_bottom_buttons.push(i);
                bBtns[i].classList.remove("active");
            }
        }
    }
    _activateButtons() {
        let bBtns = document.querySelectorAll(".bottom-buttons");
        for(let i = 0 ; i < this.active_bottom_buttons.length ; i++)
        {
            bBtns[this.active_bottom_buttons[i]].classList.add("active");
        }
    }
}