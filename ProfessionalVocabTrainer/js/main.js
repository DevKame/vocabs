"use strict";


//object managing everything about the #info-window:
import {Infowindow} from "./classes/Infowindow.js";
let iWin = new Infowindow();

//manages the handling of the topics
import { Topicmanager } from "./classes/Topicmanager.js";
let tMan = new Topicmanager(localStorage.getItem("kamedin-vocab-trainer"));

//generates DOM-Elements for main menu
import {DOMGenerator} from "./classes/DOMGenerator.js";
let DOMGen = new DOMGenerator(tMan);
// alert("Als nächstes dafür sorgen, dass topics mit klick auf dem schwrzen Button auch gelöscht werden können und das Interface neu aktualisiert wird");



botButtonListeners();
//first time genrating the main Menu:
DOMGen.getmMenuDOM();
DOMGen.mMenuListeners();
//poppin up the information about data-storage:

// iWin.firstTimeOpen();

let body = document.querySelector("body");


function botButtonListeners() {
    let bBtns = document.querySelectorAll(".bottom-buttons");

    let btnHome = bBtns[0];
    let btnBack = bBtns[1];
    let btnConfirm = bBtns[2];
    let btnInfo = bBtns[3];
    let btnDelStorage = bBtns[4];


    btnHome.addEventListener("click", e => {
        if(e.target.classList.contains("active")) 
        {
            let progBar = document.getElementById("tM-actual-progress-bar");
            if(progBar !== null) progBar.style.width = "0%";
            
            DOMGen._clearDOM();
            setBodyClass("body-mMenu");
            DOMGen.getmMenuDOM();
            DOMGen.mMenuListeners();
            DOMGen._refreshBottomButtons([3, 4]);
            DOMGen.currently_shown_topic = 0;
            DOMGen.currently_shown_vocab = 0;
            tMan.currently_learned_vocab = 0;
            tMan.random_learn_order = false;
            tMan.reverse_query = false;
            tMan.check_array_already_learned.forEach(el => {
                el.forEach(item => {
                    item = false;
                });
            })
            tMan.learn_array.length = 0;
        }
    });

    btnBack.addEventListener("click", e => {
        if(e.target.classList.contains("active"))
        {
            if(DOMGen.previous_side === "eMenu")
            {
                DOMGen._clearDOM();
                setBodyClass("body-eMenu");
                DOMGen.eMenu_getDOM();
                DOMGen._eMenuRefreshInterface();
                DOMGen._refreshBottomButtons([0,3,4]);
                DOMGen.previous_side = "";
            }
        }
    })
    btnConfirm.addEventListener("click", e => {
        let areaFront = document.getElementById("addV-tArea-front");
        let areaBack = document.getElementById("addV-tArea-back");
        let alertText = document.getElementById("addV-alert-text");
        let popWin = document.getElementById("addV-popup");
        let pText = document.querySelector("#addV-popup p");



        function animatePopup() {
            popWin.animate(
                [
                    {opacity: "0"},
                    {opacity: "1"},
                    {opacity: "1"},
                    {opacity: "1"},
                    {opacity: "1"},
                    {opacity: "0"}
                ],
                {
                    duration: 1000,
                    iterations: 1
                }
            )
        }

        if(e.target.classList.contains("active"))
        {
            if(!DOMGen.edit_mode)
            {
                DOMGen.tMan.topics[DOMGen.currently_shown_topic].vocabs.push(DOMGen.tMan.createNewVocab(areaFront.value.trim(), areaBack.value.trim()));
                DOMGen.tMan.topics[DOMGen.currently_shown_topic].vocabs.forEach(vocab => {
                    vocab.belongs_to_topic = DOMGen.tMan.topics[DOMGen.currently_shown_topic].topicname;
                });
                DOMGen.tMan.saveAllTopics();
                pText.innerText = "Succesfully created vocab card!!";
                popWin.style.backgroundColor = "var(--bottom-button-confirm-bg)";
                popWin.style.outline = "4px solid var(--bottom-button-confirm-bg)";
                animatePopup();
                areaFront.value = "";
                areaBack.value = "";
                e.target.classList.remove("active");
                alertText.style.opacity = "1";
            }
            else {
                DOMGen.applyVocabChanges();
                DOMGen.tMan.saveAllTopics();
                e.target.classList.remove("active");

                DOMGen._clearDOM();
                setBodyClass("body-eMenu");
                DOMGen.eMenu_getDOM();
                DOMGen._eMenuRefreshInterface();
                DOMGen._refreshBottomButtons([0,3,4]);
                DOMGen.previous_side = "";
                DOMGen.edit_mode = false;
            }
        }
        else if(!e.target.classList.contains("active"))
        {
            if(areaFront !== null && areaBack !== null)
            {
                pText.innerText = "Fill BOTH textareas please!!";
                popWin.style.backgroundColor = "var(--error-bg)";
                popWin.style.outline = "4px solid var(--error-bg)";
                animatePopup();
            }
        }

    });
    btnInfo.addEventListener("click", e => {
        if(e.target.classList.contains("active")) 
        {
            iWin.openIWin();
        }
    });

    btnDelStorage.addEventListener("click", e => {
        if(e.target.classList.contains("active")) 
        {
            DOMGen._deactivateButtons();
            DOMGen._getDangerZoneDOM(false);
        }
    });
}

function setBodyClass(className) {
    for(let i = 0; i < body.classList.length ; i++)
    {
        body.classList.remove(body.classList[i]);
    }
    body.classList.add(className);
}