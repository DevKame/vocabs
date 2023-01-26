


export class DOMGenerator {
    constructor(topicmanager) {
        /* Object to handle topics: */
        this.tMan = topicmanager;
        // Helps me keep track of currently active bButtons before deactivating
        this.active_bottom_buttons = [];
        /* Index to keep track of the currently shown topic in eMenu: */
        this.currently_shown_topic = 0;
        /* Index to keep track of the currently shown vocab in eMenu: */
        this.currently_shown_vocab = 0;
        //to know where to go back after clikcing the bottom-back-button:
        this.previous_side = "";
        //if true,addVocabDOM edits a vocab, it doesnt create a new one:
        this.edit_mode = false;
    }
    // ############ MAIN MENU START #############
    //creates the DOM of the main menu:
    getmMenuDOM() {
        let body = document.querySelector("body");
        body.setAttribute("class", "body-mMenu");

        let title = document.createElement("h1");
        title.setAttribute("id", "titleMainMenu");
        title.innerHTML = "VOCAB<br>TRAINER";

        let learnBtn = document.createElement("button");
        learnBtn.setAttribute("class", "mMenu-buttons");
        //only clickable if there are ANY vocabularies:
        let totalVocabs = 0;
        let allTopics = this.tMan.topics;
        allTopics.forEach(topicname => {
            totalVocabs += topicname.vocabs.length;
        });
        if(totalVocabs === 0) learnBtn.classList.add("no-learning-possible");
        learnBtn.setAttribute("id", "mMenu-btn-learn");
        learnBtn.innerText = "Learn";

        let editBtn = document.createElement("button");
        editBtn.setAttribute("class", "mMenu-buttons");
        editBtn.setAttribute("id", "mMenu-btn-edit");
        editBtn.innerText = "Edit sets";

        body.insertAdjacentElement("afterbegin", editBtn);
        body.insertAdjacentElement("afterbegin", learnBtn);
        body.insertAdjacentElement("afterbegin", title);

    }
    mMenuListeners() {
        let mM_btn_learn = document.getElementById("mMenu-btn-learn");
        mM_btn_learn.addEventListener("click", e => {
            if(!e.target.classList.contains("no-learning-possible"))
            {
                this._clearDOM();
                this._tMenuSelectionDOM();
                this._refreshBottomButtons([0,3,4]);
                this._tMenuSelectionListeners();
            }

        });
        let mM_btn_edit = document.getElementById("mMenu-btn-edit");
        mM_btn_edit.addEventListener("click", () => {
            this._clearDOM();
            this.eMenu_getDOM();
            this._refreshBottomButtons([0,3,4]);

        });
    }
    // ############ MAIN MENU END #############

    // ############ TRAIN MENU START #############

    _tMenuSelectionDOM() {
        let body = document.querySelector("body");
        body.setAttribute("class", "body-tMenu");

        let tInterface = document.createElement("div");
        tInterface.setAttribute("id", "trainer-selection-interface");
            let chooseTopicP = document.createElement("p");
            chooseTopicP.innerText = "Choose what topic(s) you want to learn:";
            //Omni holder for EVERY Selection:
            let selHolder = document.createElement("div");
            selHolder.setAttribute("id", "selections-holder");
                //Container explicitly done for the "train all option"
                let allContainer = document.createElement("div");
                allContainer.setAttribute("class", "selection-container");
                    let allSelector = document.createElement("div");
                    allSelector.setAttribute("class", "trainer-checkbox all-selector");
                    allSelector.setAttribute("id", "all-selector");
                    let allSelP = document.createElement("p");
                    allSelP.innerText = "ALL CARDS";
                allContainer.append(allSelector);
                allContainer.append(allSelP);
            
            selHolder.append(allContainer);

                //Container explicitly done for the "marked ones option":
                let countOfMarkedVocabs = 0;
                let topics = this.tMan.topics;
                topics.forEach(topic => {
                    for(let i = 0 ; i < topic.vocabs.length ; i++)
                    {
                        if(topic.vocabs[i].marked) countOfMarkedVocabs++;
                    }
                });
                if(countOfMarkedVocabs > 0)
                {
                    let markedContainer = document.createElement("div");
                    markedContainer.setAttribute("class", "selection-container");
                        let markedSelector = document.createElement("div");
                        markedSelector.setAttribute("class", "trainer-checkbox marked-selector");
                        markedSelector.setAttribute("id", "marked-selector");
                        let markedSelP = document.createElement("p");
                        markedSelP.innerText = "ONLY marked vocabs";
                    markedContainer.append(markedSelector);
                    markedContainer.append(markedSelP);

                    selHolder.append(markedContainer);
                }

                

                for(let i = 0 ; i < this.tMan.topics.length ; i++)
                {
                    if(this.tMan.topics[i].vocabs.length === 0)
                    {
                        continue;
                    }
                    else if(this.tMan.topics[i].vocabs.length > 0)
                    {
                        let selectionContainer = document.createElement("div");
                        selectionContainer.setAttribute("class", "selection-container");
                            let markedOnes = 0;
                            this.tMan.topics[i].vocabs.forEach(vocab => {
                                if(vocab.marked) markedOnes++;
                            });

                            let onlyMarkedSelector = document.createElement("div");
                            onlyMarkedSelector.setAttribute("class", "only-marked-selector");
                            if(markedOnes > 0) onlyMarkedSelector.setAttribute("class", "only-marked-selector not-marked only-marked-clickable");

                            let selectionSelector = document.createElement("div");
                            selectionSelector.setAttribute("class", "trainer-checkbox simple-topics");
                            let selectionP = document.createElement("p");
                            selectionP.innerText = this.tMan.topics[i].topicname;
                        selectionContainer.append(onlyMarkedSelector);
                        selectionContainer.append(selectionSelector);
                        selectionContainer.append(selectionP);

                        selHolder.append(selectionContainer);
                    }
                }


            //Button to start the learning:
            let startLearnBtn = document.createElement("div");
            startLearnBtn.setAttribute("id", "start-learning-button");
            startLearnBtn.setAttribute("class", "invalid-input");
                let btnLight = document.createElement("div");
                btnLight.setAttribute("class", "light-ellipse");
            startLearnBtn.append(btnLight);
            
        tInterface.append(chooseTopicP);
        tInterface.append(selHolder);
        tInterface.append(startLearnBtn);

        body.insertAdjacentElement("afterbegin", tInterface);
        

    }
    _tMenuSelectionListeners() {
        let learnArrayTopics = [];

        let body = document.querySelector("body");
        let allBtn = document.querySelector(".all-selector");

        let checkboxes = document.querySelectorAll(".trainer-checkbox");

        let startLearnBtn = document.getElementById("start-learning-button");

        let index, indexP;
        let markedSelector = document.querySelector(".marked-selector");
        let onlyMarkedSelectors = document.querySelectorAll(".only-marked-clickable");

        //listener for Selector of marked Vocabs(if there are any):
        if(markedSelector === null)
        {
            index = 1;
            indexP = 1;
        }
        else
        {
            index = 2;
            indexP = 2;
            //eventlistener for the "ONLY marked" Selection:
            markedSelector.addEventListener("click", e => {
                e.target.classList.contains("topic-selected") ? e.target.classList.remove("topic-selected") : e.target.classList.add("topic-selected");
                //mark the learning Button based on the existence of learnable Content:
                //either there is at least 1 topic selected OR the markedSelector is selected:
                if(learnArrayTopics.length > 0)
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector === null)
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                //if it IS selected, is have to add every marked vocab to learnArray
                //before i need to find out if same named topics are already there and delete them:
                if (e.target.classList.contains("topic-selected"))
                {
                    onlyMarkedSelectors.forEach(el => {
                        let elName = el.nextElementSibling.nextElementSibling.innerText;
                        if(learnArrayTopics.length > 0)
                        {
                            learnArrayTopics.forEach(topic => {
                                if(elName === topic.topicname) learnArrayTopics.splice(learnArrayTopics.indexOf(topic), 1);
                            });
                        }
                        learnArrayTopics.push(this._tMenu_appendMarkedOnes(elName));
                        if(!el.classList.contains("marked"))
                        {
                            el.classList.remove("not-marked");
                            el.classList.add("marked");
                        }
                    });
                    //de-select all simple-topics:
                    let trainSelectors = document.querySelectorAll(".simple-topics");
                    trainSelectors.forEach(sel => {
                        if(sel.classList.contains("topic-selected")) sel.classList.remove("topic-selected");
                    });
                    //deselect the all-btn:
                    if(allBtn.classList.contains("topic-selected")) allBtn.classList.remove("topic-selected");
                    //make sure to delete topics for,m learnArray, that where previously pushed by pressing the ALL Btn:
                    learnArrayTopics.forEach(top => {
                        let markedCount = 0;
                        top.vocabs.forEach(voc => {
                            if(voc.marked) markedCount++;
                        });
                        if(markedCount === 0) learnArrayTopics.splice(learnArrayTopics.indexOf(top), 1);
                    });
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else
                {
                    onlyMarkedSelectors.forEach(el => {
                        let elName = el.nextElementSibling.nextElementSibling.innerText;
                        if(learnArrayTopics.length > 0)
                        {
                            learnArrayTopics.forEach(topic => {
                                if(elName === topic.topicname) learnArrayTopics.splice(learnArrayTopics.indexOf(topic), 1);
                            });
                        }
                        if(el.classList.contains("marked"))
                        {
                            el.classList.remove("marked");
                            el.classList.add("not-marked");
                        }
                    });
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                
            });
            //listener for the associated p-Element:
            markedSelector.nextElementSibling.addEventListener("click", e => {
                e.target.previousElementSibling.classList.contains("topic-selected") ? e.target.previousElementSibling.classList.remove("topic-selected") : e.target.previousElementSibling.classList.add("topic-selected");
                //mark the learning Button based on the existence of learnable Content:
                //either there is at least 1 topic selected OR the markedSelector is selected:
                if(learnArrayTopics.length > 0)
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector === null)
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                //if it IS selected, is have to add every marked vocab to learnArray
                //before i need to find out if same named topics are already there and delete them:
                if (e.target.previousElementSibling.classList.contains("topic-selected"))
                {
                    onlyMarkedSelectors.forEach(el => {
                        let elName = el.nextElementSibling.nextElementSibling.innerText;
                        if(learnArrayTopics.length > 0)
                        {
                            learnArrayTopics.forEach(topic => {
                                if(elName === topic.topicname) learnArrayTopics.splice(learnArrayTopics.indexOf(topic), 1);
                            });
                        }
                        learnArrayTopics.push(this._tMenu_appendMarkedOnes(elName));
                        if(!el.classList.contains("marked"))
                        {
                            el.classList.remove("not-marked");
                            el.classList.add("marked");
                        }
                    });
                    //de-select all simple-topics:
                    let trainSelectors = document.querySelectorAll(".simple-topics");
                    trainSelectors.forEach(sel => {
                        if(sel.classList.contains("topic-selected")) sel.classList.remove("topic-selected");
                    });
                    //deselect the all-btn:
                    if(allBtn.classList.contains("topic-selected")) allBtn.classList.remove("topic-selected");
                    //make sure to delete topics for,m learnArray, that where previously pushed by pressing the ALL Btn:
                    learnArrayTopics.forEach(top => {
                        let markedCount = 0;
                        top.vocabs.forEach(voc => {
                            if(voc.marked) markedCount++;
                        });
                        if(markedCount === 0) learnArrayTopics.splice(learnArrayTopics.indexOf(top), 1);
                    });
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else
                {
                    onlyMarkedSelectors.forEach(el => {
                        let elName = el.nextElementSibling.nextElementSibling.innerText;
                        if(learnArrayTopics.length > 0)
                        {
                            learnArrayTopics.forEach(topic => {
                                if(elName === topic.topicname) learnArrayTopics.splice(learnArrayTopics.indexOf(topic), 1);
                            });
                        }
                        if(el.classList.contains("marked"))
                        {
                            el.classList.remove("marked");
                            el.classList.add("not-marked");
                        }
                    });
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
            });
        }
        //its associated p-Element:
        let paragraphSelectors = document.querySelectorAll(".trainer-checkbox + p");

        //listeners for the p-Elements
        for(indexP ; indexP < paragraphSelectors.length ; indexP++ )
        {
            paragraphSelectors[indexP].addEventListener("click", e => {
                    //check if topic is already existent:
                    e.target.previousElementSibling.classList.contains("topic-selected") ? e.target.previousElementSibling.classList.remove("topic-selected") : e.target.previousElementSibling.classList.add("topic-selected");
                    if(learnArrayTopics.length === 0)
                    {
                        learnArrayTopics.push(this._tMenu_appendTopics(e.target.innerText));
                    }
                    else if(learnArrayTopics.length > 0)
                    {
                        //more than 2 Items within the array..now check for duplicates
                        let duplicateAtIndex =
                        learnArrayTopics.find(topic => {
                            return topic.topicname === e.target.innerText;
                        });
                        if(learnArrayTopics.indexOf(duplicateAtIndex) === -1)
                        {
                            learnArrayTopics.push(this._tMenu_appendTopics(e.target.innerText));
                        }
                        else
                        {
                            //there is an object with the same name, check if it has the same length as this one:
                            if(learnArrayTopics[learnArrayTopics.indexOf(duplicateAtIndex)].vocabs.length === this._tMenu_appendTopics(e.target.innerText).vocabs.length)
                            {
                                if(learnArrayTopics[learnArrayTopics.indexOf(duplicateAtIndex)].vocabs.length === 1 && this._tMenu_appendTopics(e.target.innerText).vocabs.length === 1)
                                {
                                    learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                                    learnArrayTopics.push(this._tMenu_appendTopics(e.target.innerText));
                                }
                                else learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                            }
                            else 
                            {
                                learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                                learnArrayTopics.push(this._tMenu_appendTopics(e.target.innerText));
                            }

                            if (markedSelector !== null && markedSelector.classList.contains("topic-selected"))
                            {
                                markedSelector.classList.remove("topic-selected");
                            }
                            if(e.target.previousElementSibling.previousElementSibling.classList.contains("marked"))
                            {
                                e.target.previousElementSibling.previousElementSibling.classList.remove("marked");
                                e.target.previousElementSibling.previousElementSibling.classList.add("not-marked");
                            }
                            // learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                            // if (allBtn.classList.contains("topic-selected"))
                            // {
                            //     allBtn.classList.remove("topic-selected");
                            // }
                        }
                    }
                //mark the learning Button based on the existence of learnable Content:
                //either there is at least 1 topic selected OR the markedSelector is selected:
                if(learnArrayTopics.length > 0)
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector === null)
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("invalid-input"))
                    {
                        startLearnBtn.classList.remove("invalid-input");
                        startLearnBtn.classList.add("valid-input");
                    }
                }
                else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
                {
                    if (startLearnBtn.classList.contains("valid-input"))
                    {
                        startLearnBtn.classList.remove("valid-input");
                        startLearnBtn.classList.add("invalid-input");
                    }
                }
                if(!e.target.previousElementSibling.classList.contains("topic-selected") && allBtn.classList.contains("topic-selected")) allBtn.classList.remove("topic-selected");
            });
        }
        
        // listener for if user wants to learn EVERY Topic:
        allBtn.addEventListener("click", e => {

            learnArrayTopics.length = 0;
            if(e.target.classList.contains("topic-selected"))
            {
                e.target.classList.remove("topic-selected");

                checkboxes.forEach(box => {
                    if(box.classList.contains("topic-selected")) box.classList.remove("topic-selected");
                });
            }
            else
            {
                e.target.classList.add("topic-selected");

                checkboxes.forEach(box => {

                    if(!box.hasAttribute("id")) learnArrayTopics.push(this._tMenu_appendTopics(box.nextElementSibling.innerText));
                    if(!box.classList.contains("topic-selected") && !box.hasAttribute("id")) box.classList.add("topic-selected");
                });

                if(markedSelector !== null)
                {
                    if(markedSelector.classList.contains("topic-selected")) markedSelector.classList.remove("topic-selected");
                    onlyMarkedSelectors.forEach(marker => {
                        if(marker.classList.contains("marked"))
                        {
                            marker.classList.remove("marked");
                            marker.classList.add("not-marked");
                        }
                    });
                }
            }

            // e.target.classList.contains("topic-selected") ? e.target.classList.remove("topic-selected") : e.target.classList.add("topic-selected");


            //mark the learning Button based on the existence of learnable Content:
            //either there is at least 1 topic selected OR the markedSelector is selected:
            if(learnArrayTopics.length > 0)
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector === null)
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }

        });
        //listener for all-Selector´s associated p-Element:
        allBtn.nextElementSibling.addEventListener("click", e => {
            learnArrayTopics.length = 0;

            if(e.target.previousElementSibling.classList.contains("topic-selected"))
            {
                e.target.previousElementSibling.classList.remove("topic-selected");

                checkboxes.forEach(box => {
                    if(box.classList.contains("topic-selected")) box.classList.remove("topic-selected");
                });
            }
            else
            {
                e.target.previousElementSibling.classList.add("topic-selected");

                checkboxes.forEach(box => {

                    if(!box.hasAttribute("id")) learnArrayTopics.push(this._tMenu_appendTopics(box.nextElementSibling.innerText));
                    if(!box.classList.contains("topic-selected")) box.classList.add("topic-selected");
                });
                if(markedSelector !== null)
                {
                    if(markedSelector.classList.contains("topic-selected")) markedSelector.classList.remove("topic-selected");
                    onlyMarkedSelectors.forEach(marker => {
                        if(marker.classList.contains("marked"))
                        {
                            marker.classList.remove("marked");
                            marker.classList.add("not-marked");
                        }
                    });
                }
            }
            //mark the learning Button based on the existence of learnable Content:
            //either there is at least 1 topic selected OR the markedSelector is selected:
            if(learnArrayTopics.length > 0)
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector === null)
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
        });


        //listeners for just the marked Ones:
        onlyMarkedSelectors.forEach(selectorFlag => {
            selectorFlag.addEventListener("click", e => {

                // FOR THE GRAPHIC ILLUSTRATION-------START
                if (e.target.classList.contains("marked"))
                {
                    e.target.classList.remove("marked");
                    e.target.classList.add("not-marked");
                }
                else if(e.target.classList.contains("not-marked"))
                {
                    e.target.classList.remove("not-marked");
                    e.target.classList.add("marked");
                    e.target.nextElementSibling.classList.remove("topic-selected");
                    if(allBtn.classList.contains("topic-selected")) allBtn.classList.remove("topic-selected");
                }
                // FOR THE GRAPHIC ILLUSTRATION-------END

                if(learnArrayTopics.length === 0)
                {
                    // learnArrayTopics.push(e.target.nextElementSibling.innerText);
                    learnArrayTopics.push(this._tMenu_appendMarkedOnes(e.target.nextElementSibling.nextElementSibling.innerText));
                }
                else if(learnArrayTopics.length > 0)
                {
                    //more than 2 Items within the array..now check for duplicates
                    let duplicateAtIndex =
                    learnArrayTopics.find(topic => {
                        return topic.topicname === e.target.nextElementSibling.nextElementSibling.innerText;
                    });
                    if(learnArrayTopics.indexOf(duplicateAtIndex) === -1)
                    {   
                        learnArrayTopics.push(this._tMenu_appendMarkedOnes(e.target.nextElementSibling.nextElementSibling.innerText));
                    }
                    else
                    {
                        //there is an object with the same name, check if it has the same length as the marked ones:
                        if(learnArrayTopics[learnArrayTopics.indexOf(duplicateAtIndex)].vocabs.length === this._tMenu_appendMarkedOnes(e.target.nextElementSibling.nextElementSibling.innerText).vocabs.length)
                        {
                            learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                        }
                        else 
                        {
                            learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                            learnArrayTopics.push(this._tMenu_appendMarkedOnes(e.target.nextElementSibling.nextElementSibling.innerText));
                        }

                        if (markedSelector.classList.contains("topic-selected"))
                        {
                            markedSelector.classList.remove("topic-selected");
                        }
                    }
                }
            //mark the learning Button based on the existence of learnable Content:
            //either there is at least 1 topic selected OR the markedSelector is selected:
            if(learnArrayTopics.length > 0)
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector === null)
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            });
        });


        //listeners for every single topic thats selectable
        for(index ; index < checkboxes.length; index++)
        {
            checkboxes[index].addEventListener("click", e => {
                //check if topic is already existent:
                e.target.classList.contains("topic-selected") ? e.target.classList.remove("topic-selected") : e.target.classList.add("topic-selected");
                if(learnArrayTopics.length === 0)
                {
                    // learnArrayTopics.push(e.target.nextElementSibling.innerText);
                    learnArrayTopics.push(this._tMenu_appendTopics(e.target.nextElementSibling.innerText));
                }
                else if(learnArrayTopics.length > 0)
                {
                    //more than 2 Items within the array..now check for duplicates
                    let duplicateAtIndex =
                    learnArrayTopics.find(topic => {
                        return topic.topicname === e.target.nextElementSibling.innerText;
                    });
                    if(learnArrayTopics.indexOf(duplicateAtIndex) === -1)
                    {
                        learnArrayTopics.push(this._tMenu_appendTopics(e.target.nextElementSibling.innerText));
                    }
                    else
                    {
                        //there is an object with the same name, check if it has the same length as this one:
                        if(learnArrayTopics[learnArrayTopics.indexOf(duplicateAtIndex)].vocabs.length === this._tMenu_appendTopics(e.target.nextElementSibling.innerText).vocabs.length)
                        {
                            if(learnArrayTopics[learnArrayTopics.indexOf(duplicateAtIndex)].vocabs.length === 1 && this._tMenu_appendTopics(e.target.innerText).vocabs.length === 1)
                            {
                                learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                                learnArrayTopics.push(this._tMenu_appendTopics(e.target.innerText));
                            }
                            else learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                        }
                        else 
                        {
                            learnArrayTopics.splice(learnArrayTopics.indexOf(duplicateAtIndex), 1);
                            learnArrayTopics.push(this._tMenu_appendTopics(e.target.nextElementSibling.innerText));
                        }

                        if (markedSelector !== null && markedSelector.classList.contains("topic-selected"))
                        {
                            markedSelector.classList.remove("topic-selected");
                        }
                        if(e.target.previousElementSibling.classList.contains("marked"))
                        {
                            e.target.previousElementSibling.classList.remove("marked");
                            e.target.previousElementSibling.classList.add("not-marked");
                        }
                    }
                }
                if(!e.target.classList.contains("topic-selected") && allBtn.classList.contains("topic-selected")) allBtn.classList.remove("topic-selected");
            //mark the learning Button based on the existence of learnable Content:
            //either there is at least 1 topic selected OR the markedSelector is selected:
            if(learnArrayTopics.length > 0)
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector === null)
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("invalid-input"))
                {
                    startLearnBtn.classList.remove("invalid-input");
                    startLearnBtn.classList.add("valid-input");
                }
            }
            else if(learnArrayTopics.length === 0 && markedSelector !== null && !markedSelector.classList.contains("topic-selected"))
            {
                if (startLearnBtn.classList.contains("valid-input"))
                {
                    startLearnBtn.classList.remove("valid-input");
                    startLearnBtn.classList.add("invalid-input");
                }
            }
            });
            
        }

        startLearnBtn.addEventListener("click", e => {
            if(e.target.classList.contains("valid-input"))
            {
                learnArrayTopics.forEach(topic => {
                    this.tMan.learn_array.push(...topic.vocabs);
                });
                this._clearDOM();
                body.classList.add("body-tMenu");
                this._tMenuTrainingDOM();
                this._tMenuTrainingListeners();
            }
        });
    }
    _tMenuTrainingDOM() {
        this.tMan.check_array_already_learned.length = 0;
        this.tMan.learn_array.forEach(el => {
            this.tMan.check_array_already_learned.push([false, false]);
        });
        this.tMan.currently_learned_vocab = this._nextIndexWhileRandom();
        let body = document.querySelector("body");

        let cardWrapper = document.createElement("div");
        cardWrapper.setAttribute("id", "tM-card-wrapper");
        cardWrapper.setAttribute("class", "tWrapper");

            let innerCard = document.createElement("div");
            innerCard.setAttribute("class", "inner-card");
                let frontSide = document.createElement("div");
                frontSide.setAttribute("class", "front-side");
                    let headlineCon = document.createElement("div");
                    headlineCon.setAttribute("class", "tM-headline-container");
                        let hl = document.createElement("p");
                        hl.innerText = `Topic: ${this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic}`;
                        let marker1 = document.createElement("div");
                        marker1.setAttribute("class", "tM-headline-marker");
                    headlineCon.append(hl);
                    headlineCon.append(marker1);
                    if(!this.tMan.learn_array[this.tMan.currently_learned_vocab].marked)
                    {
                        marker1.style.opacity = "1";
                        marker1.style.pointerEvents = "auto";
                    }
                    else
                    {
                        marker1.style.opacity = "0";
                        marker1.style.pointerEvents = "none";

                    }
                    let frontCon = document.createElement("div");
                    frontCon.setAttribute("class", "tM-f-content-container");
                        let fContent = document.createElement("p");
                        fContent.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].back;
                        if(this.tMan.reverse_query)
                        fContent.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].front;
                    frontCon.append(fContent);
                frontSide.append(headlineCon);
                frontSide.append(frontCon);

                let backSide = document.createElement("div");
                backSide.setAttribute("class", "back-side");
                    let headlineCon2 = document.createElement("div");
                    headlineCon2.setAttribute("class", "tM-headline-container");
                        let hl2 = document.createElement("p");
                        hl2.innerText = `Topic: ${this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic}`;
                        let marker2 = document.createElement("div");
                        marker2.setAttribute("class", "tM-headline-marker");
                    headlineCon2.append(hl2);
                    headlineCon2.append(marker2);
                    if(!this.tMan.learn_array[this.tMan.currently_learned_vocab].marked)
                    {
                        marker2.style.opacity = "1";
                        marker2.style.pointerEvents = "auto";
                    }
                    else
                    {
                        marker2.style.opacity = "0";
                        marker2.style.pointerEvents = "none";

                    }
                    let frontCon2 = document.createElement("div");
                    frontCon2.setAttribute("class", "tM-f-content-container");
                        let bContent = document.createElement("p");
                        bContent.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].front;
                        if(this.tMan.reverse_query)
                        bContent.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].back;
                    frontCon2.append(bContent);
            backSide.append(headlineCon2);
            backSide.append(frontCon2);

            innerCard.append(frontSide);
            innerCard.append(backSide);
        cardWrapper.append(innerCard);

            let buttonWrapper = document.createElement("div");
            buttonWrapper.setAttribute("id", "tM-button-wrapper");
            buttonWrapper.setAttribute("class", "tWrapper");
                let btnsHeadlineContainer = document.createElement("div");
                btnsHeadlineContainer.setAttribute("id", "tM-button-headline-container");
                    let btnHeadline = document.createElement("p");
                    btnHeadline.setAttribute("id", "tM-button-headline");
                    btnHeadline.innerText = "Think about the answer and then spin the card to check yourself";
                btnsHeadlineContainer.append(btnHeadline);
                let btnsContainer = document.createElement("div");
                btnsContainer.setAttribute("id", "tM-buttons-container")
                    let correctBtn = document.createElement("div");
                    correctBtn.setAttribute("id", "tM-correct-button");
                    correctBtn.setAttribute("class", "tM-correct-button tM-training-buttons");
                        let light2 = document.createElement("div");
                        light2.setAttribute("class", "light-ellipse");
                    correctBtn.append(light2);
                    let spinBtn = document.createElement("div");
                    spinBtn.setAttribute("id", "tM-spin-button");
                    spinBtn.setAttribute("class", "tM-spin-button tM-training-buttons active");
                        let light1 = document.createElement("div");
                        light1.setAttribute("class", "light-ellipse");
                    spinBtn.append(light1);
                    let wrongBtn = document.createElement("div");
                    wrongBtn.setAttribute("id", "tM-wrong-button");
                    wrongBtn.setAttribute("class", "tM-wrong-button tM-training-buttons");
                        let light3 = document.createElement("div");
                        light3.setAttribute("class", "light-ellipse");
                    wrongBtn.append(light3);
                    let nextBtn = document.createElement("div");
                    nextBtn.setAttribute("id", "tM-next-button");
                    nextBtn.setAttribute("class", "tM-next-button tM-training-buttons");
                        let light4 = document.createElement("div");
                        light4.setAttribute("class", "light-ellipse");
                    nextBtn.append(light4);
                    
                    let repeatBtn = document.createElement("div");
                    repeatBtn.setAttribute("id", "tM-repeat-button");
                    repeatBtn.setAttribute("class", "tM-repeat-button tM-training-buttons");
                        let light5 = document.createElement("div");
                        light5.setAttribute("class", "light-ellipse");
                    repeatBtn.append(light5);

                btnsContainer.append(correctBtn);
                btnsContainer.append(spinBtn);
                btnsContainer.append(wrongBtn);
                btnsContainer.append(nextBtn);
                btnsContainer.append(repeatBtn);

            buttonWrapper.append(btnsHeadlineContainer);
            buttonWrapper.append(btnsContainer);

            let progressWrapper = document.createElement("div");
            progressWrapper.setAttribute("id", "tM-progress-wrapper");
            progressWrapper.setAttribute("class", "tWrapper");
                let progressP = document.createElement("p");
                progressP.innerText = "Progress:";
                let maxBar = document.createElement("div");
                maxBar.setAttribute("id", "tM-progress-max-bar");
                    let actualBar = document.createElement("div");
                    actualBar.setAttribute("id", "tM-actual-progress-bar");
                        let bgBar = document.createElement("div");
                        bgBar.setAttribute("id", "tM-background-bar");
                    actualBar.append(bgBar);
                maxBar.append(actualBar);
            progressWrapper.append(progressP);
            progressWrapper.append(maxBar);

        let cbWrapper = document.createElement("iv");
        cbWrapper.setAttribute("id", "tM-checkbox-wrapper");
        cbWrapper.setAttribute("class", "tWrapper");
            let cbRandomContainer = document.createElement("div");
            cbRandomContainer.setAttribute("class", "tM-checkbox-container");
                let randomCB = document.createElement("div");
                randomCB.setAttribute("id", "tM-random-order");
                randomCB.setAttribute("class", "trainer-checkbox tM-random-order");
                if(this.tMan.random_learn_order) randomCB.classList.add("topic-selected");
                let randomP = document.createElement("p");
                randomP.innerText = "random order";
            cbRandomContainer.append(randomCB);
            cbRandomContainer.append(randomP);
            
            let cbReverseContainer = document.createElement("div");
            cbReverseContainer.setAttribute("class", "tM-checkbox-container");
                let reverseCB = document.createElement("div");
                reverseCB.setAttribute("id", "tM-reverse-query");
                reverseCB.setAttribute("class", "trainer-checkbox tM-reverse-query");
                if(this.tMan.reverse_query) reverseCB.classList.add("topic-selected");
                let reverseP = document.createElement("p");
                reverseP.innerText = "reverse query";
            cbReverseContainer.append(reverseCB);
            cbReverseContainer.append(reverseP);

        cbWrapper.append(cbRandomContainer);
        cbWrapper.append(cbReverseContainer);
        body.insertAdjacentElement("afterbegin", cbWrapper);
        body.insertAdjacentElement("afterbegin", progressWrapper);
        body.insertAdjacentElement("afterbegin", buttonWrapper);
        body.insertAdjacentElement("afterbegin", cardWrapper);
    }
    _tMenuTrainingListeners() {

        let body = document.querySelector("body");


        this.tMan.scoreAquired = true;
        let mainButtons = document.querySelectorAll(".tM-training-buttons");
        let [rightAButton, spinButton, wrongAButton, nextButton, repeatButton] = mainButtons;

        let card = document.querySelector(".inner-card");
        let bSide = document.querySelector(".back-side");

        let rOrder = document.querySelector(".tM-random-order");
        let rQuery = document.querySelector(".tM-reverse-query");

        //dynamic changing elements within the card:
        let topicDescriberBack = document.querySelector(".back-side .tM-headline-container  p");
        let topicDescriberFront = document.querySelector(".front-side .tM-headline-container  p");
        let backP = document.querySelector(".back-side .tM-f-content-container p");
        let frontP = document.querySelector(".front-side .tM-f-content-container p");

        let buttonHeadline = document.getElementById("tM-button-headline");
        //Think about the answer and then spin the card to check yourself
        //Be honest with yourself!! Was your answer right?
        //Press the blue button to learn the next card or re-check the actual one
        //Session completed! Press the yellow button to repeat or back to menu

        let allMarkers = document.querySelectorAll(".tM-headline-marker");
        allMarkers.forEach(mark => {
            mark.addEventListener("click", e => {
                for(let i = 0 ; i < allMarkers.length ; i++)
                {
                    allMarkers[i].style.opacity = "0";
                    allMarkers[i].style.pointerEvents = "none";
                    this.tMan.learn_array[this.tMan.currently_learned_vocab].marked = true;
                }
            });
        });

        let progBar = document.getElementById("tM-actual-progress-bar");

        spinButton.addEventListener("click", e => {
            if(e.target.classList.contains("active"))
            {
                if(card.style.transform !== "rotateY(180deg)")
                {
                    card.style.transform = "rotateY(180deg)";
                    bSide.style.opacity = "0";
                    bSide.style.pointerEvents = "none";
                    //if its the first time user spins the card, make sure to not spin it again until score is chosen:
                    if(this.tMan.scoreAquired)
                    {
                        e.target.classList.remove("active");
                        if(nextButton.classList.contains("active")) nextButton.classList.remove("active");
                        this._deactivateButtons();
                        rightAButton.classList.add("active");
                        wrongAButton.classList.add("active");
                        buttonHeadline.innerText = "Be honest with yourself!! Was your answer right?";
                    }
                    else
                    {
                        if(!e.target.classList.contains("active")) e.target.classList.add("active");
                        if(rightAButton.classList.contains("active")) e.target.classList.remove("active");
                        if(wrongAButton.classList.contains("active")) e.target.classList.remove("active");
                    }
                }
                else
                {
                    card.style.transform = "rotateY(0deg)";
                    bSide.style.opacity = "1";
                    bSide.style.pointerEvents = "auto";
                }
            }
        });

        rightAButton.addEventListener("click", e => {
            if(e.target.classList.contains("active"))
            {
                buttonHeadline.innerText = "Press the blue button to learn the next card or re-check the actual one";

                this.tMan.learn_array[this.tMan.currently_learned_vocab].tests++;
                this.tMan.learn_array[this.tMan.currently_learned_vocab].rights++;
                this._updateTopicStats(this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic, "right");
                
                
                // this._setTopicLevel(this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic);
                this._setVocabLevel(this.tMan.learn_array[this.tMan.currently_learned_vocab]);
                this.tMan.saveAllTopics();

                this._activateButtons();

                e.target.classList.remove("active");
                wrongAButton.classList.remove("active");
                this.tMan.scoreAquired = false;
                spinButton.classList.add("active");
                nextButton.classList.add("active");


                this._setLearnedVocabs();
                
            }
        });
        wrongAButton.addEventListener("click", e => {
            if(e.target.classList.contains("active"))
            {
                buttonHeadline.innerText = "Press the blue button to learn the next card or re-check the actual one";
                
                this.tMan.learn_array[this.tMan.currently_learned_vocab].tests++;
                this.tMan.learn_array[this.tMan.currently_learned_vocab].wrongs++;
                this._updateTopicStats(this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic, "wrong");

                // this._setTopicLevel(this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic);
                this._setVocabLevel(this.tMan.learn_array[this.tMan.currently_learned_vocab]);
                this.tMan.saveAllTopics();
                this._activateButtons();

                e.target.classList.remove("active");
                rightAButton.classList.remove("active");
                this.tMan.scoreAquired = false;
                spinButton.classList.add("active");
                nextButton.classList.add("active");

                this._setLearnedVocabs();
                // this.tMan.check_array_already_learned[this.tMan.currently_learned_vocab][0] = true;

            }
        });

        rOrder.addEventListener("click", e => {
            if (e.target.classList.contains("topic-selected"))
            {
                e.target.classList.remove("topic-selected")
                this.tMan.random_learn_order = false;
            }
            else
            {
                e.target.classList.add("topic-selected");
                this.tMan.random_learn_order = true;
            }
        });
        rQuery.addEventListener("click", e => {
            if (e.target.classList.contains("topic-selected"))
            {
                e.target.classList.remove("topic-selected")
                this.tMan.reverse_query = false;
            }
            else
            {
                e.target.classList.add("topic-selected");
                this.tMan.reverse_query = true;
            }
        });

        nextButton.addEventListener("click", e => {
            if(e.target.classList.contains("active"))
            {
                if(card.style.transform !== "rotateY(0deg)")
                {
                    card.style.transform = "rotateY(0deg)";
                    bSide.style.opacity = "1";
                }
                setTimeout(() => {
                    if(this.tMan.currently_learned_vocab !== undefined) {
                        frontP.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].back;
                        if(this.tMan.reverse_query) frontP.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].front;
                    }
                },250);

                e.target.classList.remove("active");
                progBar.style.width = this._changeProgressBar();

                
                    //is learnOrder RANDOM?
                    if(!this.tMan.random_learn_order)
                    {
                        //if user is NOT at THE END of learn-array:
                        this.tMan.currently_learned_vocab = this._lowestIndexToLearn();
                          
                    }
                    else if(this.tMan.random_learn_order)
                    {
                        if(!this._lSessionOver())
                        {
                            this.tMan.scoreAquired = true;
                            this.tMan.currently_learned_vocab = this._nextIndexWhileRandom();
                            buttonHeadline.innerText = "Think about the answer and then spin the card to check yourself";
                        }
                        else
                        {
                            this.tMan.scoreAquired = false;
                            buttonHeadline.innerText = "Session completed! Press the yellow button to repeat or back to menu";
                        }
                    }

                    if(this._lSessionOver()) {
                        e.target.classList.remove("active");
                        repeatButton.classList.add("active");
                        buttonHeadline.innerText = "Session completed! Press the yellow button to repeat or back to menu";
                    }
                    

                if(this.tMan.currently_learned_vocab !== undefined)
                {
                    rightAButton.classList.remove("active");
                    wrongAButton.classList.remove("active");
                    topicDescriberBack.innerText = `Topic: ${this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic}`;
                    topicDescriberFront.innerText = `Topic: ${this.tMan.learn_array[this.tMan.currently_learned_vocab].belongs_to_topic}`;
                    backP.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].front;
                    this._toggleMarkerOnUnmarked();
                    // if(this.tMan.reverse_query && this.tMan.check_array_already_learned[this.tMan.currently_learned_vocab][0] === false)
                    if(this.tMan.reverse_query)
                    backP.innerText = this.tMan.learn_array[this.tMan.currently_learned_vocab].back;
                    
                    buttonHeadline.innerText = "Think about the answer and then spin the card to check yourself";
                }

            }
        });
        repeatButton.addEventListener("click", e => {
            if(e.target.classList.contains("active"))
            {
                buttonHeadline.innerText = "Think about the answer and then spin the card to check yourself";
                if(!this.tMan.random_learn_order)
                {
                    this._resetLeanArrayToFalse();
                    this.tMan.currently_learned_vocab = this._nextIndexWhileRandom();
                }
                progBar.style.width = "0%";
                e.target.classList.remove("active");
                this._clearDOM();
                body.classList.add("body-tMenu");
                this._tMenuTrainingDOM();
                this._toggleMarkerOnUnmarked();
                this._tMenuTrainingListeners();

            }
        });
    }
    _toggleMarkerOnUnmarked() {
        let allMarkers = document.querySelectorAll(".tM-headline-marker");

        if(this.tMan.learn_array[this.tMan.currently_learned_vocab].marked)
        {
            allMarkers.forEach(mark => {
                mark.style.opacity = "0";
                mark.style.pointerEvents = "none";
            });
        }
        else
        {
            allMarkers.forEach(mark => {
                mark.style.opacity = "1";
                mark.style.pointerEvents = "auto";
            });
        }
    }
    _resetLeanArrayToFalse() {
        this.tMan.check_array_already_learned.forEach(el => {
            el[0] = false;
            el[1] = false;
        });
    }
    _lowestIndexToLearn() {
        
        for(let i = 0 ; i < this.tMan.check_array_already_learned.length ; i++)
        {
            if (this.tMan.check_array_already_learned[i][0])
            {
                continue;
            } else
            {
                this.tMan.scoreAquired = true;
                return i;
            }
        }
    }
    _lSessionOver() {
        let lSessionCount = 0;
        this.tMan.check_array_already_learned.forEach(el => {
            if(el[0]) lSessionCount++;
        });
        if(lSessionCount === this.tMan.check_array_already_learned.length)
        {
            return true;
        }
        else {
            return false;
        }
    }
    //returns a random Number thats NOT already learned as Index:
    _nextIndexWhileRandom() {
        // let x = Math.floor(Math.random() * (max - min + 1)) + min;
        let randIndex = Math.floor(Math.random() * ((this.tMan.check_array_already_learned.length - 1) - 0 + 1)) + 0;
        while(this.tMan.check_array_already_learned[randIndex][0])
        {
            randIndex = Math.floor(Math.random() * ((this.tMan.check_array_already_learned.length - 1) - 0 + 1)) + 0;
        }
        return randIndex

    }
    _updateTopicStats(tName, answer) {
        this.tMan.topics.forEach(topic => {
            if(topic.topicname === tName)
            {
                switch(answer)
                {
                    case "right":
                        topic.total_tests++;
                        topic.total_rights++;
                        break;
                    case "wrong":
                        topic.total_tests++;
                        topic.total_wrongs++;
                        break;
                    default:
                        break;
                }

                let total_vocabs = topic.vocabs.length;
                let total_levels = 0;
                topic.vocabs.forEach(vocab => {
                    total_levels += vocab.level;
                });
                let avLevel = Math.floor(total_levels / total_vocabs);
                topic.average_level = avLevel;
            }
        });
    }
    //sets already learned vocabs to true:
    _setLearnedVocabs() {
        if(!this.tMan.check_array_already_learned[this.tMan.currently_learned_vocab][0])
        {
            this.tMan.check_array_already_learned[this.tMan.currently_learned_vocab][0] = true;
        }
    }
    //returns a string with the exact % for the CSS-width of progressBar:
    _changeProgressBar() {
        let learning_length = this.tMan.check_array_already_learned.length;
        let number_of_learned = this._howManyLearnedAsNumber();
        let percent;
        
        let progBar = document.getElementById("tM-actual-progress-bar");
        if(number_of_learned === 0) return "0%";
        else
        {
            percent = number_of_learned * 100 / learning_length;
            return percent+"%";
        }
    }
    //returns a number with amount of already learned vocabs:
    _howManyLearnedAsNumber() {
        let count = 0;
        this.tMan.check_array_already_learned.forEach(arr => {
            if(arr[0]) count++;
        });
        return count;
    }
    _tMenu_appendMarkedOnes(tName) {
        let obj = {};
        obj.vocabs = [];
        for(let i = 0 ; i < this.tMan.topics.length ; i++)
        {
            if (this.tMan.topics[i].topicname === tName)
            {
                obj.topicname = tName;
                this.tMan.topics[i].vocabs.forEach(vocab => {
                    if(vocab.marked) obj.vocabs.push(vocab);
                });
                return obj;
            }
        }
    }
    _tMenu_appendTopics(tName) {
        for(let i = 0 ; i < this.tMan.topics.length ; i++)
        {
            if (this.tMan.topics[i].topicname === tName)
            {
                return this.tMan.topics[i];
            }
        }
    }
    _setVocabLevel(vocabObj) {
        if(vocabObj.tests >= 10)
        {
            let hundred = vocabObj.tests / 100;
            let percent = vocabObj.rights / hundred;
            if(percent === 100 && percent >= 80) vocabObj.level = 4;
            if(percent <= 80 && percent > 60) vocabObj.level = 3;
            if(percent <= 60 && percent > 40) vocabObj.level = 2;
            if(percent <= 40 && percent > 20) vocabObj.level = 1;
            if(percent <= 20 && percent > 0) vocabObj.level = 0;
        }
    }
    // ############ TRAIN MENU END #############


    // ############ EDIT MENU START #############
    /*decides what eMenu DOM to create, dependent of the count of topics/vocabs: */
    eMenu_getDOM() {
        //user has ZERO Topics:
        if(this.tMan.topics.length === 0)
        {
            this._eMenuDOM_noTopics();
        }
        //User has at least ONE Topic:
        else if(this.tMan.topics.length > 0)
        {
            //user has ZERO Vocabs in currently shown Topic:
            if(this.tMan.topics[this.currently_shown_topic].vocabs.length === 0)
            {
                this._eMenuDOM_onlyTopics();
            }
            //User has more than ZERO Vocabs in currently shown topic:
            else if(this.tMan.topics[this.currently_shown_topic].vocabs.length > 0)
            {
                this._eMenuDOM_withVocabs();
            }
        }
        this._eMenuListeners();
    }
    /**sets all listeners in the edit menu */
    _eMenuListeners() {
        //listeners that will ALWAYS need to be made:
        let input = document.getElementById("textinput-new-topic");
        let cButton = document.getElementById("confirm-button-new-topic");
        input.addEventListener("input", () => {
            this._refreshReadOnlyInterface();
        });
        cButton.addEventListener("click", e => {
            if(e.target.classList.contains("invalid-input"))
            {
                if(this._topicTwice(input.value))
                {
                    this._getErrorDOM("This topic already exists in your collection", false);
                }
                else
                {
                    this._getErrorDOM("No whitespace!<br>Use characters from 0-9 and a-z or special characters like '-', '#', etc.", false)
                }
            }
            else if(e.target.classList.contains("valid-input"))
            {
                this.tMan.createTopic(input.value);
                input.value = "";
                // this._eMenuRefreshInterface();
                this.tMan.saveAllTopics();
                this._getErrorDOM(`You successfully created the new topic<br>"${this.tMan.topics[this.tMan.topics.length - 1].topicname}"!`, true);
            }
        });

        
        if(this.tMan.topics.length > 0)
        {
            let aLeftTopic = document.querySelector("#eMenu-global-topic-container .arrow-left");
            let aRightTopic = document.querySelector("#eMenu-global-topic-container .arrow-right");
            aRightTopic.addEventListener("click", () => {
                this.swipeTopicRight();
                setTimeout(() => {
                    this._clearDOM();
                    this.eMenu_getDOM();
                }, 350);
                this._eMenuRefreshInterface();
                });
            aLeftTopic.addEventListener("click", () => {
                this.swipeTopicLeft();
                setTimeout(() => {
                    this._clearDOM();
                    this.eMenu_getDOM();
                }, 350);
                this._eMenuRefreshInterface();
            });

            let editBtn = document.getElementById("edit-topic-button");
            editBtn.addEventListener("click", () => {
                this._getRenameTopicDOM();
                this._renameTopicListeners();
                this._deactivateButtons();
            });

            let addVBtn = document.getElementById("add-vocab-to-topic-button");
            addVBtn.addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._getAddVocabDOM();
                this._refreshBottomButtons([0,1,3,4]);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            })

            let delBtn = document.getElementById("delete-topic-button");
            delBtn.addEventListener("click", () => {
                this._getDangerZoneDOM(true);
                this._deactivateButtons();
            });
            if(this.tMan.topics[this.currently_shown_topic].vocabs.length === 0)
            {
                let firstTimeNewVocab = document.getElementById("eMenu-noVocabs-button-newVocab");
                firstTimeNewVocab.addEventListener("click", () => {
                    this._clearDOM();
                    this._setBodyClass("body-eMenu");
                    this._getAddVocabDOM();
                    this._refreshBottomButtons([0,1,3,4]);
                    this._addVocabListeners();
                    this.previous_side = "eMenu";
                });
            }
            else if(this.tMan.topics[this.currently_shown_topic].vocabs.length > 0)
            {
                let voc_aLeftTopic = document.querySelector("#eMenu-global-vocab-container .arrow-left");
                let voc_aRightTopic = document.querySelector("#eMenu-global-vocab-container .arrow-right");
                voc_aRightTopic.addEventListener("click", () => {
                    this.swipeVocabRight();
                    setTimeout(() => {
                        this._clearDOM();
                        this.eMenu_getDOM();
                    }, 350);
                    this._eMenuRefreshInterface();
                });
                voc_aLeftTopic.addEventListener("click", () => {
                    this.swipeVocabLeft();
                    setTimeout(() => {
                        this._clearDOM();
                        this.eMenu_getDOM();
                    }, 350);
                    this._eMenuRefreshInterface();
                });

                let marker = document.querySelector(".vocab-marker");
                marker.addEventListener("click", e => {
                    if(e.target.classList.contains("marked"))
                    {
                        e.target.classList.remove("marked");
                        e.target.classList.add("not-marked");
                        this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].marked = false;
                        this.tMan.saveAllTopics();
                    }
                    else
                    {
                        e.target.classList.remove("not-marked");
                        e.target.classList.add("marked");
                        this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].marked = true;
                        this.tMan.saveAllTopics();
                    }
                });
                let vocEditBtn = document.getElementById("edit-vocab-button");
                vocEditBtn.addEventListener("click", () => {
                    this._clearDOM();
                    this._setBodyClass("body-eMenu");
                    this._refreshBottomButtons([0,1,3,4]);
                    this._getAddVocabDOM(true);
                    this._addVocabListeners();
                    this.previous_side = "eMenu";

                });
                let vocDelBtn = document.getElementById("delete-vocab-button");
                vocDelBtn.addEventListener("click", () => {

                    this.tMan.topics[this.currently_shown_topic].total_tests -= this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].tests;
                    this.tMan.topics[this.currently_shown_topic].total_rights -= this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].rights;
                    this.tMan.topics[this.currently_shown_topic].total_wrongs -= this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].wrongs;

                    this.tMan.topics[this.currently_shown_topic].vocabs.splice(this.currently_shown_vocab, 1);
                    if (this.currently_shown_vocab === this.tMan.topics[this.currently_shown_topic].vocabs.length) this.currently_shown_vocab--;
                    if(this.currently_shown_vocab < 0) this.currently_shown_vocab = 0;

                    this.tMan.saveAllTopics();
                    this._clearDOM();
                    this.eMenu_getDOM();
                });


            }
            
        }
    }
    /**creates the DOM for the edit menu (NO TOPICS): */
    _eMenuDOM_noTopics() {
        let body = document.querySelector("body");
        body.classList.remove("body-mMenu");
        body.classList.add("body-eMenu");

        let p1 = document.createElement("p");
        p1.setAttribute("class", "p-no-topic");
        p1.innerText = "You dont have any topics yet";

        let p2 = document.createElement("p");
        p2.setAttribute("class", "p-no-topic");
        p2.innerText = "To start learning, create your first topic now:";

        let addContainer = document.createElement("div");
        addContainer.setAttribute("class", "add-container");
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("class", "add-textinput");
            input.setAttribute("id", "textinput-new-topic");
            input.setAttribute("placeholder", "enter topic here");
            let confContainer = document.createElement("div");
            confContainer.setAttribute("class", "confirm-container");
                let confBtn = document.createElement("div");
                confBtn.setAttribute("class", "add-container-confirm-button");
                confBtn.classList.add("invalid-input");
                confBtn.setAttribute("id", "confirm-button-new-topic");
                confBtn.innerText = " ";
                    let light = document.createElement("div");
                    light.setAttribute("class", "light-ellipse");
                confBtn.append(light);
            confContainer.append(confBtn);
        addContainer.append(input);
        addContainer.append(confContainer);

        body.insertAdjacentElement("afterbegin", addContainer);
        body.insertAdjacentElement("afterbegin", p2);
        body.insertAdjacentElement("afterbegin", p1);

    }
    /**creates the DOM for the edit menu (ONLY TOPICS) */
    _eMenuDOM_onlyTopics() {
        let body = document.querySelector("body");
        body.classList.remove("body-mMenu");
        body.classList.add("body-eMenu");

            let globTopicCon = document.createElement("div");
            globTopicCon.setAttribute("id", "eMenu-global-topic-container");
            globTopicCon.setAttribute("class", "eMenu-card-container");
                let topicInterface = document.createElement("div");
                topicInterface.setAttribute("id", "eMenu-topic-interface");
                topicInterface.setAttribute("class", "eMenu-card-interface");
                    let aLeft = document.createElement("div");
                    aLeft.setAttribute("class", "arrow-left");
                    let cardLeft = document.createElement("div");
                    cardLeft.setAttribute("class", "topic-card-left");
                    cardLeft.classList.add("topic-cards");

                    /*main card, where the content of the topic is shown:*/
                    let cardMiddle = document.createElement("div");
                    cardMiddle.setAttribute("class", "topic-card-middle");
                    cardMiddle.classList.add("topic-cards");
                        let buttonContainer = document.createElement("div");
                        buttonContainer.setAttribute("class", "topic-card-button-container")
                            let editTopicBtn = document.createElement("div");
                            editTopicBtn.setAttribute("id", "edit-topic-button");
                            editTopicBtn.setAttribute("class", "card-side-buttons");
                                let l1 = document.createElement("div");
                                l1.setAttribute("class", "light-ellipse");
                            editTopicBtn.append(l1);
                            let addVocabBtn = document.createElement("div");
                            addVocabBtn.setAttribute("id", "add-vocab-to-topic-button");
                            addVocabBtn.setAttribute("class", "card-side-buttons");
                                let l2 = document.createElement("div");
                                l2.setAttribute("class", "light-ellipse");
                            addVocabBtn.append(l2);
                            let deleteTopicBtn = document.createElement("div");
                            deleteTopicBtn.setAttribute("id", "delete-topic-button");
                            deleteTopicBtn.setAttribute("class", "card-side-buttons");
                                let l3 = document.createElement("div");
                                l3.setAttribute("class", "light-ellipse");
                            deleteTopicBtn.append(l3);
                        buttonContainer.append(editTopicBtn);
                        buttonContainer.append(addVocabBtn);
                        buttonContainer.append(deleteTopicBtn);
                        let middleContainer = document.createElement("div");
                        middleContainer.setAttribute("class", "topic-card-middle-container");
                            let titleContainer = document.createElement("div");
                            titleContainer.setAttribute("class", "topic-card-title-container");
                                let totalVocabs = document.createElement("p");
                                totalVocabs.setAttribute("id", "total-vocabs");
                                totalVocabs.classList.add("class", "topic-card-stat-words");
                                totalVocabs.innerText = `Cards: ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
                                let totalTopics = document.createElement("p");
                                totalTopics.setAttribute("id", "total-topics");
                                totalTopics.classList.add("class", "topic-card-stat-words");
                                totalTopics.innerText = `${this.currently_shown_topic + 1} / ${this.tMan.topics.length}`;
                                
                            titleContainer.append(totalVocabs);
                            titleContainer.append(totalTopics);
                            let nameOfShownTopic = document.createElement("p");
                            nameOfShownTopic.setAttribute("id", "name-of-shown-topic");
                            nameOfShownTopic.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
                            let statContainer = document.createElement("div");
                            statContainer.setAttribute("class", "topic-card-stats-container");
                                let timesLearned = document.createElement("p");
                                timesLearned.setAttribute("id", "topic-card-times-learned");
                                timesLearned.setAttribute("class", "topic-card-stat-words");
                                timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].total_tests}x`;
                                let rightAnswers = document.createElement("p");
                                rightAnswers.setAttribute("id", "topic-card-right-answers");
                                rightAnswers.setAttribute("class", "topic-card-stat-words");
                                rightAnswers.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].total_rights}`;
                                let wrongAnswers = document.createElement("p");
                                wrongAnswers.setAttribute("id", "topic-card-wrong-answers");
                                wrongAnswers.setAttribute("class", "topic-card-stat-words");
                                wrongAnswers.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].total_wrongs}`;
                            statContainer.append(timesLearned);
                            statContainer.append(rightAnswers);
                            statContainer.append(wrongAnswers);
                        middleContainer.append(titleContainer);
                        middleContainer.append(nameOfShownTopic);
                        middleContainer.append(statContainer);
                        let levelContainer = document.createElement("div");
                        levelContainer.setAttribute("class", "topic-card-level-container");
                            for(let i = 0; i < 5 ; i++)
                            {
                                let levelCircle = document.createElement("div");
                                levelCircle.setAttribute("class", "level-circles");
                                if(this.tMan.topics[this.currently_shown_topic].average_level === i)
                                {
                                    levelCircle.classList.add("lvl-true");
                                    this._setTopicLevel(levelCircle, i);
                                }
                                levelContainer.insertAdjacentElement("afterbegin", levelCircle);
                            }

                    cardMiddle.append(buttonContainer);
                    cardMiddle.append(middleContainer);
                    cardMiddle.append(levelContainer);

                    /*main card end */

                    let cardRight = document.createElement("div");
                    cardRight.setAttribute("class", "topic-card-right");
                    cardRight.classList.add("topic-cards");
                    let aRight = document.createElement("div");
                    aRight.setAttribute("class", "arrow-right");
                topicInterface.append(cardLeft);
                topicInterface.append(cardMiddle);
                topicInterface.append(cardRight);
                topicInterface.append(aLeft);
                topicInterface.append(aRight);
            globTopicCon.append(topicInterface);


            let infoNoVocab, buttonNewVocab;
            //wenn das aktuelle Thema keine Vokabeln hat und kein newVocabBtn existiert(was er jetzt aber sollte), wird er erstellt:
            if(this.tMan.topics[this.currently_shown_topic].vocabs.length === 0 && document.getElementById("eMenu-noVocabs-button-newVocab") === null)
            {
                infoNoVocab = document.createElement("p");
                infoNoVocab.innerHTML = `You dont have any vocabs for <strong>${this.tMan.topics[this.currently_shown_topic].topicname}</strong> yet.<br>click here to add one`;
                buttonNewVocab = document.createElement("div");
                buttonNewVocab.setAttribute("id", "eMenu-noVocabs-button-newVocab");
                buttonNewVocab.setAttribute("class", "round-l-buttons");
                buttonNewVocab.innerText = " ";
                    let light2 = document.createElement("div");
                    light2.setAttribute("class", "light-ellipse");
                buttonNewVocab.append(light2);
            }
            //Wenn das aktuelle Thema vocabs hat, sollte keine newVocabBtn exisitieren, dieser wird dann gelöscht:
            if(this.tMan.topics[this.currently_shown_topic].vocabs.length > 0 && document.getElementById("eMenu-noVocabs-button-newVocab") !== null)
            {
                buttonNewVocab = document.getElementById("eMenu-noVocabs-button-newVocab");
                buttonNewVocab.previousElementSibling.remove();
                buttonNewVocab.remove();

            }

            let addContainer = document.createElement("div");
            addContainer.setAttribute("class", "add-container");
                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("class", "add-textinput");
                input.setAttribute("id", "textinput-new-topic");
                input.setAttribute("placeholder", "or create a new topic");
                let confContainer = document.createElement("div");
                confContainer.setAttribute("class", "confirm-container");
                    let confBtn = document.createElement("div");
                    confBtn.setAttribute("class", "add-container-confirm-button");
                    confBtn.classList.add("invalid-input");
                    confBtn.setAttribute("id", "confirm-button-new-topic");
                    confBtn.innerText = " ";
                        let light = document.createElement("div");
                        light.setAttribute("class", "light-ellipse");
                    confBtn.append(light);
                confContainer.append(confBtn);
            addContainer.append(input);
            addContainer.append(confContainer);


        body.insertAdjacentElement("afterbegin", addContainer);
        if(document.getElementById("eMenu-noVocabs-button-newVocab") === null)
        {
            body.insertAdjacentElement("afterbegin", buttonNewVocab);
            body.insertAdjacentElement("afterbegin", infoNoVocab);
        }
        body.insertAdjacentElement("afterbegin", globTopicCon);

    }
    _eMenuDOM_withVocabs() {
        let body = document.querySelector("body");
        body.classList.remove("body-mMenu");
        body.classList.add("body-eMenu");

            let globTopicCon = document.createElement("div");
            globTopicCon.setAttribute("id", "eMenu-global-topic-container");
            globTopicCon.setAttribute("class", "eMenu-card-container");
                let topicInterface = document.createElement("div");
                topicInterface.setAttribute("id", "eMenu-topic-interface");
                topicInterface.setAttribute("class", "eMenu-card-interface");
                    let aLeft = document.createElement("div");
                    aLeft.setAttribute("class", "arrow-left");
                    let cardLeft = document.createElement("div");
                    cardLeft.setAttribute("class", "topic-card-left");
                    cardLeft.classList.add("topic-cards");

                    /*main card, where the content of the topic is shown:*/
                    let cardMiddle = document.createElement("div");
                    cardMiddle.setAttribute("class", "topic-card-middle");
                    cardMiddle.classList.add("topic-cards");
                        let buttonContainer = document.createElement("div");
                        buttonContainer.setAttribute("class", "topic-card-button-container")
                            let editTopicBtn = document.createElement("div");
                            editTopicBtn.setAttribute("id", "edit-topic-button");
                            editTopicBtn.setAttribute("class", "card-side-buttons");
                                let l1 = document.createElement("div");
                                l1.setAttribute("class", "light-ellipse");
                            editTopicBtn.append(l1);
                            let addVocabBtn = document.createElement("div");
                            addVocabBtn.setAttribute("id", "add-vocab-to-topic-button");
                            addVocabBtn.setAttribute("class", "card-side-buttons");
                                let l2 = document.createElement("div");
                                l2.setAttribute("class", "light-ellipse");
                            addVocabBtn.append(l2);
                            let deleteTopicBtn = document.createElement("div");
                            deleteTopicBtn.setAttribute("id", "delete-topic-button");
                            deleteTopicBtn.setAttribute("class", "card-side-buttons");
                                let l3 = document.createElement("div");
                                l3.setAttribute("class", "light-ellipse");
                            deleteTopicBtn.append(l3);
                        buttonContainer.append(editTopicBtn);
                        buttonContainer.append(addVocabBtn);
                        buttonContainer.append(deleteTopicBtn);
                        let middleContainer = document.createElement("div");
                        middleContainer.setAttribute("class", "topic-card-middle-container");
                            let titleContainer = document.createElement("div");
                            titleContainer.setAttribute("class", "topic-card-title-container");
                                let totalVocabs = document.createElement("p");
                                totalVocabs.setAttribute("id", "total-vocabs");
                                totalVocabs.classList.add("class", "topic-card-stat-words");
                                totalVocabs.innerText = `Cards: ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
                                let totalTopics = document.createElement("p");
                                totalTopics.setAttribute("id", "total-topics");
                                totalTopics.classList.add("class", "topic-card-stat-words");
                                totalTopics.innerText = `${this.currently_shown_topic + 1} / ${this.tMan.topics.length}`;
                                
                            titleContainer.append(totalVocabs);
                            titleContainer.append(totalTopics);
                            let nameOfShownTopic = document.createElement("p");
                            nameOfShownTopic.setAttribute("id", "name-of-shown-topic");
                            nameOfShownTopic.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
                            let statContainer = document.createElement("div");
                            statContainer.setAttribute("class", "topic-card-stats-container");
                                let timesLearned = document.createElement("p");
                                timesLearned.setAttribute("id", "topic-card-times-learned");
                                timesLearned.setAttribute("class", "topic-card-stat-words");
                                timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].total_tests}x`;
                                let rightAnswers = document.createElement("p");
                                rightAnswers.setAttribute("id", "topic-card-right-answers");
                                rightAnswers.setAttribute("class", "topic-card-stat-words");
                                rightAnswers.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].total_rights}`;
                                let wrongAnswers = document.createElement("p");
                                wrongAnswers.setAttribute("id", "topic-card-wrong-answers");
                                wrongAnswers.setAttribute("class", "topic-card-stat-words");
                                wrongAnswers.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].total_wrongs}`;
                            statContainer.append(timesLearned);
                            statContainer.append(rightAnswers);
                            statContainer.append(wrongAnswers);
                        middleContainer.append(titleContainer);
                        middleContainer.append(nameOfShownTopic);
                        middleContainer.append(statContainer);
                        let levelContainer = document.createElement("div");
                        levelContainer.setAttribute("class", "topic-card-level-container");
                            for(let i = 0; i < 5 ; i++)
                            {
                                let levelCircle = document.createElement("div");
                                levelCircle.setAttribute("class", "level-circles");
                                if(this.tMan.topics[this.currently_shown_topic].average_level === i)
                                {
                                    levelCircle.classList.add("lvl-true");
                                    this._setTopicLevel(levelCircle, i);
                                }
                                levelContainer.insertAdjacentElement("afterbegin", levelCircle);
                            }

                    cardMiddle.append(buttonContainer);
                    cardMiddle.append(middleContainer);
                    cardMiddle.append(levelContainer);

                    /*main card end */

                    let cardRight = document.createElement("div");
                    cardRight.setAttribute("class", "topic-card-right");
                    cardRight.classList.add("topic-cards");
                    let aRight = document.createElement("div");
                    aRight.setAttribute("class", "arrow-right");
                topicInterface.append(cardLeft);
                topicInterface.append(cardMiddle);
                topicInterface.append(cardRight);
                topicInterface.append(aLeft);
                topicInterface.append(aRight);
            globTopicCon.append(topicInterface);

            let globVocabCon = document.createElement("div");
            globVocabCon.setAttribute("id", "eMenu-global-vocab-container");
            globVocabCon.setAttribute("class", "eMenu-card-container");
                let vocabInterface = document.createElement("div");
                vocabInterface.setAttribute("id", "eMenu-vocab-interface");
                vocabInterface.setAttribute("class", "eMenu-card-interface");

                    // HARDCORE ARBEIT

                    let voc_cardMiddle = document.createElement("div");
                    voc_cardMiddle.setAttribute("class", "vocab-card-middle");
                    voc_cardMiddle.classList.add("vocab-cards");
                    
                        let voc_buttonContainer = document.createElement("div");
                        voc_buttonContainer.setAttribute("class", "vocab-card-button-container")
                            let voc_editTopicBtn = document.createElement("div");
                            voc_editTopicBtn.setAttribute("id", "edit-vocab-button");
                            voc_editTopicBtn.setAttribute("class", "card-side-buttons");
                                let voc_l1 = document.createElement("div");
                                voc_l1.setAttribute("class", "light-ellipse");
                            voc_editTopicBtn.append(voc_l1);
                            let voc_deleteTopicBtn = document.createElement("div");
                            voc_deleteTopicBtn.setAttribute("id", "delete-vocab-button");
                            voc_deleteTopicBtn.setAttribute("class", "card-side-buttons");
                                let voc_l2 = document.createElement("div");
                                voc_l2.setAttribute("class", "light-ellipse");
                            voc_deleteTopicBtn.append(voc_l2);
                            let marker = document.createElement("div");
                            marker.setAttribute("class", "vocab-marker");
                            this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].marked ? marker.classList.add("marked") : marker.classList.add("not-marked");
                            let markerShadow = document.createElement("div");
                            markerShadow.setAttribute("class", "marker-shadow");
                        voc_buttonContainer.append(voc_editTopicBtn);
                        voc_buttonContainer.append(voc_deleteTopicBtn);
                        voc_buttonContainer.append(markerShadow);
                        voc_buttonContainer.append(marker);

                        let voc_middleContainer = document.createElement("div");
                        voc_middleContainer.setAttribute("class", "vocab-card-middle-container");
                            let vocHeader = document.createElement("div");
                            vocHeader.setAttribute("class", "vocab-card-header");
                                let cardCount = document.createElement("p");
                                cardCount.innerText = `${this.currently_shown_vocab + 1} / ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
                                cardCount.setAttribute("class", "vocab-card-stat-words");
                                cardCount.setAttribute("id", "vocab-total-cards");
                            vocHeader.append(cardCount);
                            
                            let vocHead = document.createElement("div");
                            vocHead.setAttribute("class", "vocab-card-head");
                                let headP = document.createElement("p");
                                headP.innerText = `${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front}`;
                                headP.setAttribute("id", "vocab-card-head-content");
                            vocHead.append(headP);

                            let vocBody = document.createElement("div");
                            vocBody.setAttribute("class", "vocab-card-body");
                                let bodyP = document.createElement("p");
                                bodyP.innerText = `${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back}`;
                                bodyP.setAttribute("id", "vocab-card-body-content");
                            vocBody.append(bodyP);

                            let vocFooter = document.createElement("div");
                            vocFooter.setAttribute("class", "vocab-card-footer");
                                
                                let voc_timesLearned = document.createElement("p");
                                voc_timesLearned.setAttribute("id", "vocab-card-times-learned");
                                voc_timesLearned.setAttribute("class", "vocab-card-stat-words");
                                voc_timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].tests}x`;
                                let voc_rightAnswers = document.createElement("p");
                                voc_rightAnswers.setAttribute("id", "vocab-card-right-answers");
                                voc_rightAnswers.setAttribute("class", "vocab-card-stat-words");
                                voc_rightAnswers.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].rights}`;
                                let voc_wrongAnswers = document.createElement("p");
                                voc_wrongAnswers.setAttribute("id", "vocab-card-wrong-answers");
                                voc_wrongAnswers.setAttribute("class", "vocab-card-stat-words");
                                voc_wrongAnswers.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].wrongs}`;
                            vocFooter.append(voc_timesLearned);
                            vocFooter.append(voc_rightAnswers);
                            vocFooter.append(voc_wrongAnswers);
                            
                        voc_middleContainer.append(vocHeader);
                        voc_middleContainer.append(vocHead);
                        voc_middleContainer.append(vocBody);
                        voc_middleContainer.append(vocFooter);

                    
                        let voc_levelContainer = document.createElement("div");
                        voc_levelContainer.setAttribute("class", "vocab-card-level-container");
                            for(let i = 0; i < 5 ; i++)
                            {
                                let voc_levelCircle = document.createElement("div");
                                voc_levelCircle.setAttribute("class", "level-circles");
                                if(this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].level === i)
                                {
                                    voc_levelCircle.classList.add("lvl-true");
                                    this._setTopicLevel(voc_levelCircle, i);
                                }
                                voc_levelContainer.insertAdjacentElement("afterbegin", voc_levelCircle);
                            }

                    voc_cardMiddle.append(voc_buttonContainer);
                    voc_cardMiddle.append(voc_middleContainer);
                    voc_cardMiddle.append(voc_levelContainer);



                    
                    let voc_aLeft = document.createElement("div");
                    voc_aLeft.setAttribute("class", "arrow-left");
                    let voc_cardLeft = document.createElement("div");
                    voc_cardLeft.setAttribute("class", "vocab-card-left");
                    voc_cardLeft.classList.add("vocab-cards");

                    let voc_cardRight = document.createElement("div");
                    voc_cardRight.setAttribute("class", "vocab-card-right");
                    voc_cardRight.classList.add("vocab-cards");
                    let voc_aRight = document.createElement("div");
                    voc_aRight.setAttribute("class", "arrow-right");

                
                vocabInterface.append(voc_cardLeft);
                vocabInterface.append(voc_cardMiddle);
                vocabInterface.append(voc_cardRight);
                vocabInterface.append(voc_aLeft);
                vocabInterface.append(voc_aRight);


            globVocabCon.append(vocabInterface);


            
            let addContainer = document.createElement("div");
            addContainer.setAttribute("class", "add-container");
                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("class", "add-textinput");
                input.setAttribute("id", "textinput-new-topic");
                input.setAttribute("placeholder", "or create a new topic");
                let confContainer = document.createElement("div");
                confContainer.setAttribute("class", "confirm-container");
                    let confBtn = document.createElement("div");
                    confBtn.setAttribute("class", "add-container-confirm-button");
                    confBtn.classList.add("invalid-input");
                    confBtn.setAttribute("id", "confirm-button-new-topic");
                    confBtn.innerText = " ";
                        let light = document.createElement("div");
                        light.setAttribute("class", "light-ellipse");
                    confBtn.append(light);
                confContainer.append(confBtn);
            addContainer.append(input);
            addContainer.append(confContainer);


        body.insertAdjacentElement("afterbegin", addContainer);
        body.insertAdjacentElement("afterbegin", globVocabCon);

            
        body.insertAdjacentElement("afterbegin", globTopicCon);
    }
    /**refreshes the interface DOM edit menu */
    _eMenuRefreshInterface() {

        // will always be there so not within an if-construct:

        if(this.tMan.topics.length > 0)
        {
            if(this.tMan.topics[this.currently_shown_topic].vocabs.length === 0)
            {
                let infoNoVocab = document.querySelector("#eMenu-topic-interface + p");
                if(infoNoVocab !== null)
                {
                    infoNoVocab.innerHTML = `You dont have any vocabs for <strong>${this.tMan.topics[this.currently_shown_topic].topicname}</strong> yet.<br>click here to add one`;
                }

            }

        }
    }

    // ############ EDIT MENU START #############
    //creates the DOM for the window to add a new vocab card:
    _getAddVocabDOM(edit) {
        let body = document.querySelector("body");

        let btnConfirmNewVocab = document.getElementById("bottom-button-confirm");
        if(edit) {
            btnConfirmNewVocab.classList.add("active");
            this.edit_mode = true;
        }

        let pFront = document.createElement("p");
        pFront.setAttribute("class", "front-back-side-p");
        pFront.innerText = "Front-side:";

        let tAreaFront = document.createElement("textarea");
        tAreaFront.setAttribute("id", "addV-tArea-front");
        tAreaFront.setAttribute("class", "addV-tAreas");
        tAreaFront.placeholder = "[question, formula, foreign word, etc.]";

        let pBack = document.createElement("p");
        pBack.setAttribute("class", "front-back-side-p");
        pBack.innerText = "Back-side:";

        let tAreaBack = document.createElement("textarea");
        tAreaBack.setAttribute("id", "addV-tArea-back");
        tAreaBack.setAttribute("class", "addV-tAreas");
        tAreaBack.placeholder = `[${this.tMan.topics[this.currently_shown_topic].topicname}]`;
        if(edit)
        {
            tAreaFront.value = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front;
            tAreaBack.value = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back;
        }

        let pAlert = document.createElement("p");
        pAlert.setAttribute("id", "addV-alert-text");
        pAlert.setAttribute("class", "addV-paragraphs");
        pAlert.innerHTML = "Both textareas have to be filled!<br><strong>no whitespace!</strong>";

        let pInfo = document.createElement("p");
        pInfo.setAttribute("id", "addV-info-text");
        pInfo.setAttribute("class", "addV-paragraphs");
        pInfo.innerHTML = "Add your finished card or go back to menu with the buttons on the bottom";

        let popUpWin = document.createElement("div");
        popUpWin.setAttribute("id", "addV-popup");
            let pPopup = document.createElement("p");
        popUpWin.append(pPopup);

        body.insertAdjacentElement("afterbegin", pInfo);
        body.insertAdjacentElement("afterbegin", pAlert);
        body.insertAdjacentElement("afterbegin", tAreaBack);
        body.insertAdjacentElement("afterbegin", pBack);
        body.insertAdjacentElement("afterbegin", tAreaFront);
        body.insertAdjacentElement("afterbegin", pFront);
        body.insertAdjacentElement("afterbegin", popUpWin);
    }
    //the associated listeners:
    _addVocabListeners() {
        let btnConfirmNewVocab = document.getElementById("bottom-button-confirm");
        let areaFront = document.getElementById("addV-tArea-front");
        let areaBack = document.getElementById("addV-tArea-back");
        let alertText = document.getElementById("addV-alert-text");

        areaFront.addEventListener("input", e => {
            if(e.target.value.trim() === "" || areaBack.value.trim() === "")
            {
                alertText.style.opacity = "1";
                btnConfirmNewVocab.classList.remove("active");
            }
            else if(e.target.value.trim() !== "" && areaBack.value.trim() !== "")
            {
                alertText.style.opacity = "0";
                if(!btnConfirmNewVocab.classList.contains("active")) btnConfirmNewVocab.classList.add("active");
            }
        });
        areaBack.addEventListener("input", e => {
            if(e.target.value.trim() === "" || areaFront.value.trim() === "")
            {
                alertText.style.opacity = "1";
                btnConfirmNewVocab.classList.remove("active");
            }
            else if(e.target.value.trim() !== "" && areaFront.value.trim() !== "")
            {
                alertText.style.opacity = "0";
                if(!btnConfirmNewVocab.classList.contains("active")) btnConfirmNewVocab.classList.add("active");
            }
        });
    }
    applyVocabChanges() {
        let areaFront = document.getElementById("addV-tArea-front");
        let areaBack = document.getElementById("addV-tArea-back");

        this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front = areaFront.value.trim();
        this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back = areaBack.value.trim();
    }
    //popup window that appears if user wants to rename topicname:
    _getRenameTopicDOM() {
        //container for the popup window:
        let con = document.getElementById("eMenu-topic-interface");

            //container for the renaming interface:
            let rtWin = document.createElement("div");
            rtWin.setAttribute("id", "rename-topic-window");
                //all 3 rows:
                let row1 = document.createElement("div");
                row1.setAttribute("class", "rename-topic-rows");
                row1.setAttribute("id", "renToRow-1");
                    let r1p = document.createElement("p");
                    r1p.innerText = `rename: ${this.tMan.topics[this.currently_shown_topic].topicname}`;
                row1.append(r1p);
                let row2 = document.createElement("div");
                row2.setAttribute("class", "rename-topic-rows");
                row2.setAttribute("id", "renToRow-2");
                    let r2p = document.createElement("p");
                    r2p.innerText = `to:`;
                    let input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("id", "renToInput");
                    input.setAttribute("class", "solo-text-inputs");
                row2.append(r2p);
                row2.append(input);
                let row3 = document.createElement("div");
                row3.setAttribute("class", "rename-topic-rows");
                row3.setAttribute("id", "renToRow-3");
                    let abortBtn = document.createElement("div");
                    abortBtn.setAttribute("id", "renToAbort");
                    abortBtn.setAttribute("class", "rename-topic-buttons");
                        let lEllipse1 = document.createElement("div");
                        lEllipse1.setAttribute("class", "light-ellipse");
                    abortBtn.append(lEllipse1);
                    let confBtn = document.createElement("div");
                    confBtn.setAttribute("id", "renToConfirm");
                    confBtn.setAttribute("class", "rename-topic-buttons");
                        let lEllipse2 = document.createElement("div");
                        lEllipse2.setAttribute("class", "light-ellipse");
                    confBtn.append(lEllipse2);
                row3.append(abortBtn);
                row3.append(confBtn);
            rtWin.append(row1);
            rtWin.append(row2);
            rtWin.append(row3);
        con.append(rtWin);
    }
    //the associated listeners:
    _renameTopicListeners() {
        let rtWin = document.getElementById("rename-topic-window");
        let input = document.getElementById("renToInput");
        let confBtn = document.getElementById("renToConfirm");
        let abortBtn = document.getElementById("renToAbort");

        let oldName = document.querySelector("#renToRow-1 p");

        //topicname thats shown on the actual card behind the rtWin:
        let shownTopicname = document.getElementById("name-of-shown-topic");

        input.addEventListener("input", e => {
                let wrongs = 0;
                for(let i = 0 ; i < this.tMan.topics.length ; i++)
                {
                    if(i === this.currently_shown_topic) continue;
                    else
                    {
                        if(this.tMan.topics[i].topicname.toUpperCase() === e.target.value.toUpperCase() || e.target.value.trim() === "" || e.target.value.trim() === " ")
                        {
                            wrongs++;
                        }
                    }
                }
                switch(wrongs)
                {
                    case 0:
                        if(!confBtn.classList.contains("valid")) confBtn.classList.add("valid");
                        break;
                    default:
                        if(confBtn.classList.contains("valid")) confBtn.classList.remove("valid");
                        break;
                }
        });
        
        abortBtn.addEventListener("click", () => {
            rtWin.remove();
            this._activateButtons();
            this._eMenuRefreshInterface();
            shownTopicname.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
        });
        confBtn.addEventListener("click", e => {
            if(e.target.classList.contains("valid"))
            {
                this.tMan.topics[this.currently_shown_topic].topicname = input.value.trim();
                this.tMan.topics[this.currently_shown_topic].vocabs.forEach(vocab => {
                    vocab.belongs_to_topic = input.value.trim();
                });
                oldName.innerText = `rename: ${input.value.trim()}`;
                input.value = "";
                this.tMan.saveAllTopics();
                e.target.classList.remove("valid");
            }
        });
    }
    //determines the graphic illustration of the average level of currently shown Topic
    _setTopicLevel(el, i) {
        switch(i)
        {
            case 0:
                el.style.backgroundColor = "var(--level-1)";
                break;
            case 1:
                el.style.backgroundColor = "var(--level-2)";
                break;
            case 2:
                el.style.backgroundColor = "var(--level-3)";
                break;
            case 3:
                el.style.backgroundColor = "var(--level-4)";
                break;
            case 4:
                el.style.backgroundColor = "var(--level-5)";
                break;
        }
    }
    //pop up window if you want to delete a single or all topics:
    _getDangerZoneDOM(singleTopic) {
        let body = document.querySelector("body");

        let dzWin = document.createElement("div");
        dzWin.setAttribute("id", "danger-zone-window");
            let h1 = document.createElement("h1");
            h1.setAttribute("id", "danger-title");
            h1.innerText = "! DANGER ZONE !";
            let p = document.createElement("p");
            p.setAttribute("id", "danger-text");
            if(singleTopic)
            {
                p.innerHTML = `Are you sure!?<br>
                You are about to delete the complete topic <strong>${this.tMan.topics[this.currently_shown_topic].topicname}</strong><br>
                It contains <strong>${this.tMan.topics[this.currently_shown_topic].vocabs.length} vocabs!!</strong><br>
                Restoring wont be possible!<br>
                If you are sure, type
                "<strong>delete now!</strong>" and confirm.`;
            }
            else if(!singleTopic)
            {
                let totalVocabs = 0;
                this.tMan.topics.forEach(topic => {
                    totalVocabs += topic.vocabs.length;
                });
                p.innerHTML = `Are you sure!?<br>
                You are about to delete ALL OF YOUR TOPICS!!<br>
                This contains <strong>${this.tMan.topics.length} topics</strong> with<br>
                <strong>${totalVocabs} vocabs</strong>!!<br>
                Restoring wont be possible!<br>
                If you are sure, type
                "<strong>delete now!</strong>" and confirm.`;
            }
            let delInput = document.createElement("input");
            delInput.setAttribute("type", "text");
            delInput.setAttribute("id", "danger-input");
            delInput.setAttribute("maxlength", "11");
            let dBackBtn = document.createElement("div");
            dBackBtn.setAttribute("id", "danger-back-button");
            dBackBtn.setAttribute("class", "danger-buttons");
            
                let light = document.createElement("div");
                light.setAttribute("class", "light-ellipse");
            dBackBtn.append(light);
            let delBtn = document.createElement("div");
            delBtn.setAttribute("id", "danger-delete-button");
            delBtn.setAttribute("class", "danger-buttons");
                let light2 = document.createElement("div");
                light.setAttribute("class", "light-ellipse");
            delBtn.append(light2);
        
        dzWin.append(h1);
        dzWin.append(p);
        dzWin.append(delInput);
        dzWin.append(dBackBtn);
        dzWin.append(delBtn);
        
        body.append(dzWin);
        dBackBtn.addEventListener("click", () => {
            dzWin.remove();
            this._activateButtons();
        });
        delBtn.addEventListener("click", () => {
            if(delInput.value !== "delete now!")
            {
                dzWin.remove();
                this._activateButtons();
            }
            else
            {
                if(singleTopic)
                {
                    this.tMan.topics.splice(this.currently_shown_topic, 1);
                    this.currently_shown_topic = 0;
                    this.tMan.saveAllTopics();
                    dzWin.remove();
                    this._activateButtons();
                    this._clearDOM();
                    this.eMenu_getDOM();
                }
                else if(!singleTopic)
                {
                    this.tMan.topics.length = 0;
                    this.currently_shown_topic = 0;
                    this.currently_shown_vocab = 0;
                    localStorage.clear();
                    this.tMan.saveAllTopics();
                    dzWin.remove();
                    this._activateButtons();
                    this._clearDOM();
                    this.getmMenuDOM();
                    this.mMenuListeners();
                    let lBtn = document.getElementById("mMenu-btn-learn");
                    if(lBtn !== null && !lBtn.classList.contains("no-learning-possible")) lBtn.classList.add("no-learning-possible");
                }
            }
        });
    }
    _deactivateButtons() {
        let bBtns = document.querySelectorAll(".bottom-buttons"), i;
        for(i = 0 ; i < bBtns.length ; i++)
        {
            if(bBtns[i].classList.contains("active"))
            {
                this.active_bottom_buttons.push(i);
                bBtns[i].classList.remove("active");
            }
        }
    }
    _activateButtons() {
        this._refreshBottomButtons(this.active_bottom_buttons);
        this.active_bottom_buttons.length = 0;
    }
    swipeTopicRight() {
        this.currently_shown_topic++;
        if (this.currently_shown_topic === this.tMan.topics.length) this.currently_shown_topic = 0;
        this.currently_shown_vocab = 0;
        // this.currently_shown_topic + 1 > this.tMan.topics.length ? this.currently_shown_topic = 0 : this.currently_shown_topic++;
        let middlePosition = "translate(-50%, -60%)";
        let rightPosition = "translate(-50%, -57%) rotate(-2deg)";

        let middle = document.querySelector(".topic-card-middle");
        let right = document.querySelector(".topic-card-right");

        this._fillRightCardWithDOMContent();



        /* THIS IS THE MOVEMENT S T A R T */

        //middle card goes down:
        middle.style.transform = "translate(-50%, 40%) rotate(-2deg)";
        setTimeout(() => {
            //middle card goes right:
            middle.style.transform = rightPosition;
            middle.setAttribute("class", "topic-card-right topic-cards");
            right.setAttribute("class", "topic-card-middle topic-cards");

            while(middle.children.length > 0)
            {
                middle.firstElementChild.remove();
            }
            // append the id´s to the new content:
            let titleContainerParagraphs = document.querySelectorAll(".topic-card-title-container p");
            titleContainerParagraphs[0].setAttribute("id", "total-vocabs");
            titleContainerParagraphs[1].setAttribute("id", "total-topics");

            let nameOfShownTopic = document.querySelector(".topic-card-title-container ~ p");
            nameOfShownTopic.setAttribute("id", "name-of-shown-topic");

            let statContainerParagraphs = document.querySelectorAll(".topic-card-stats-container p");
            statContainerParagraphs[0].setAttribute("id", "topic-card-times-learned");
            statContainerParagraphs[1].setAttribute("id", "topic-card-right-answers");
            statContainerParagraphs[2].setAttribute("id", "topic-card-wrong-answers");

            let editButtons = document.querySelectorAll(".topic-card-button-container > div");
            editButtons[0].setAttribute("id", "edit-topic-button");
            editButtons[0].addEventListener("click", () => {
                this._getRenameTopicDOM();
                this._renameTopicListeners();
                this._deactivateButtons();
            });
            editButtons[1].setAttribute("id", "add-vocab-to-topic-button");
            editButtons[1].addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._getAddVocabDOM();
                this._refreshBottomButtons([0,1,3,4]);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            })
            editButtons[2].setAttribute("id", "delete-topic-button");
            editButtons[2].addEventListener("click", () => {
                this._getDangerZoneDOM(true);
                this._deactivateButtons();
            });

            let nameOfTopic = document.getElementById("name-of-shown-topic");
            let totalVocabs = document.getElementById("total-vocabs");
            let totalTopics = document.getElementById("total-topics");
            let timesLearned = document.getElementById("topic-card-times-learned");
            let rightAnswer = document.getElementById("topic-card-right-answers");
            let wrongAnswer = document.getElementById("topic-card-wrong-answers");
            nameOfTopic.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
            totalVocabs.innerText = `Cards: ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
            totalTopics.innerText = `${this.currently_shown_topic + 1} / ${this.tMan.topics.length}`;
            timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].total_tests}x`;
            rightAnswer.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].total_rights}`;
            wrongAnswer.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].total_wrongs}`;

        },200);
        right.style.transform = middlePosition;

        let firstTimeNewVocab = document.getElementById("eMenu-noVocabs-button-newVocab");
        //Wenn ich swipe und das topic davor Vocabs hatte, dann existiert keine DOM für den Btn fürs erstellen der ersten Vocab
        //das wird hier geprüft
        if(firstTimeNewVocab !== null)
        {
            firstTimeNewVocab.addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._getAddVocabDOM();
                this._refreshBottomButtons([0,1,3,4]);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            });
        }
        this._refreshReadOnlyInterface();

        /* THIS IS THE MOVEMENT E N D  */
        
    
    }
    swipeTopicLeft() {
        
        this.currently_shown_topic - 1 < 0 ? this.currently_shown_topic = this.tMan.topics.length - 1 : this.currently_shown_topic--;
        this.currently_shown_vocab = 0;
        let middlePosition = "translate(-50%, -60%)";
        let rightPosition = "translate(-50%, -57%) rotate(-2deg)";

        let middle = document.querySelector(".topic-card-middle");
        let right = document.querySelector(".topic-card-right");

        this._fillRightCardWithDOMContent();

        /* THIS IS THE MOVEMENT S T A R T */

        //right card goes down:
        right.style.transform = "translate(-50%, 40%) rotate(-2deg)";
        setTimeout(() => {
            // right card goes middle
            right.style.transform = middlePosition;
            right.setAttribute("class", "topic-card-middle topic-cards");
            middle.setAttribute("class", "topic-card-right topic-cards");

            while(middle.children.length > 0)
            {
                middle.firstElementChild.remove();
            }
            // append the id´s to the new content:
            let titleContainerParagraphs = document.querySelectorAll(".topic-card-title-container p");
            titleContainerParagraphs[0].setAttribute("id", "total-vocabs");
            titleContainerParagraphs[1].setAttribute("id", "total-topics");

            let nameOfShownTopic = document.querySelector(".topic-card-title-container ~ p");
            nameOfShownTopic.setAttribute("id", "name-of-shown-topic");

            let statContainerParagraphs = document.querySelectorAll(".topic-card-stats-container p");
            statContainerParagraphs[0].setAttribute("id", "topic-card-times-learned");
            statContainerParagraphs[1].setAttribute("id", "topic-card-right-answers");
            statContainerParagraphs[2].setAttribute("id", "topic-card-wrong-answers");

            let editButtons = document.querySelectorAll(".topic-card-button-container > div");
            editButtons[0].setAttribute("id", "edit-topic-button");
            editButtons[0].addEventListener("click", () => {
                this._getRenameTopicDOM();
                this._renameTopicListeners();
                this._deactivateButtons();
            });
            editButtons[1].setAttribute("id", "add-vocab-to-topic-button");
            editButtons[1].addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._getAddVocabDOM();
                this._refreshBottomButtons([0,1,3,4]);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            })
            editButtons[2].setAttribute("id", "delete-topic-button");
            editButtons[2].addEventListener("click", () => {
                this._getDangerZoneDOM(true);
                this._deactivateButtons();
            });

            let nameOfTopic = document.getElementById("name-of-shown-topic");
            let totalVocabs = document.getElementById("total-vocabs");
            let totalTopics = document.getElementById("total-topics");
            let timesLearned = document.getElementById("topic-card-times-learned");
            let rightAnswer = document.getElementById("topic-card-right-answers");
            let wrongAnswer = document.getElementById("topic-card-wrong-answers");
            nameOfTopic.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
            totalVocabs.innerText = `Cards: ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
            totalTopics.innerText = `${this.currently_shown_topic + 1} / ${this.tMan.topics.length}`;
            timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].total_tests}x`;
            rightAnswer.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].total_rights}`;
            wrongAnswer.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].total_wrongs}`;

            },200);
        middle.style.transform = rightPosition;

        let firstTimeNewVocab = document.getElementById("eMenu-noVocabs-button-newVocab");
        if(firstTimeNewVocab !== null)
        {
            firstTimeNewVocab.addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._getAddVocabDOM();
                this._refreshBottomButtons([0,1,3,4]);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            });
        }
        this._refreshReadOnlyInterface();

        /* THIS IS THE MOVEMENT E N D  */
    }
    swipeVocabRight() {
        
        this.currently_shown_vocab++;
        if (this.currently_shown_vocab === this.tMan.topics[this.currently_shown_topic].vocabs.length) this.currently_shown_vocab = 0;
        // this.currently_shown_topic + 1 > this.tMan.topics.length ? this.currently_shown_topic = 0 : this.currently_shown_topic++;
        let middlePosition = "translate(-50%, -60%)";
        let rightPosition = "translate(-50%, -57%) rotate(-2deg)";

        let middle = document.querySelector(".vocab-card-middle");
        let right = document.querySelector(".vocab-card-right");

        this._fillRightVocabCardWithDOMContent();



        /* THIS IS THE MOVEMENT S T A R T */

        //middle card goes down:
        middle.style.transform = "translate(-50%, 40%) rotate(-2deg)";
        setTimeout(() => {
            //middle card goes right:
            middle.style.transform = rightPosition;
            middle.setAttribute("class", "vocab-card-right vocab-cards");
            right.setAttribute("class", "vocab-card-middle vocab-cards");

            while(middle.children.length > 0)
            {
                middle.firstElementChild.remove();
            }

            // append the id´s to the new content:
            let editButtons = document.querySelectorAll(".vocab-card-button-container .card-side-buttons");
            editButtons[0].setAttribute("id", "edit-vocab-button");
            editButtons[0].addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._refreshBottomButtons([0,1,3,4]);
                this._getAddVocabDOM(true);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            });
            editButtons[1].setAttribute("id", "delete-vocab-button");
            editButtons[1].addEventListener("click", () => {
                this.tMan.topics[this.currently_shown_topic].vocabs.splice(this.currently_shown_vocab, 1);
                if (this.currently_shown_vocab === this.tMan.topics[this.currently_shown_topic].vocabs.length) this.currently_shown_vocab--;
                if(this.currently_shown_vocab < 0) this.currently_shown_vocab = 0;
                this.tMan.saveAllTopics();
                this._clearDOM();
                this.eMenu_getDOM();
            });

            // ZUM TESTEN HOFFENTLICH KLAPPTS START ###############################

            let totalVocabs = document.querySelector(".vocab-card-header p");
            totalVocabs.setAttribute("id", "vocab-total-cards");
            totalVocabs.innerText = `${this.currently_shown_vocab + 1} / ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
            let vocabFront = document.querySelector(".vocab-card-head p");
            vocabFront.setAttribute("id", "vocab-card-head-content");
            vocabFront.innerText = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front;
            let vocabBack = document.querySelector(".vocab-card-body p");
            vocabBack.setAttribute("id", "vocab-card-body-content");
            vocabBack.innerText = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back;
            let statWords = document.querySelectorAll(".vocab-card-footer p");
            statWords[0].setAttribute("id" , "vocab-card-times-learned");
            statWords[0].innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].tests}x`;
            statWords[1].setAttribute("id" , "vocab-card-right-answers");
            statWords[1].innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].rights}`;
            statWords[2].setAttribute("id" , "vocab-card-wrong-answers");
            statWords[2].innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].wrongs}`;

        },200);
        right.style.transform = middlePosition;

        this._refreshReadOnlyInterface();

        /* THIS IS THE MOVEMENT E N D  */
    }
    swipeVocabLeft() {
        this.currently_shown_vocab - 1 < 0 ? this.currently_shown_vocab = this.tMan.topics[this.currently_shown_topic].vocabs.length - 1 : this.currently_shown_vocab--;
        let middlePosition = "translate(-50%, -60%)";
        let rightPosition = "translate(-50%, -57%) rotate(-2deg)";

        let middle = document.querySelector(".vocab-card-middle");
        let right = document.querySelector(".vocab-card-right");

        this._fillRightVocabCardWithDOMContent();

        /* THIS IS THE MOVEMENT S T A R T */

        //right card goes down:
        right.style.transform = "translate(-50%, 40%) rotate(-2deg)";
        setTimeout(() => {
            //middle card goes right:
            right.style.transform = middlePosition;
            right.setAttribute("class", "vocab-card-middle vocab-cards");
            middle.setAttribute("class", "vocab-card-right vocab-cards");

            while(middle.children.length > 0)
            {
                middle.firstElementChild.remove();
            }

            // append the id´s to the new content:
            let editButtons = document.querySelectorAll(".vocab-card-button-container .card-side-buttons");
            editButtons[0].setAttribute("id", "edit-vocab-button");
            editButtons[0].addEventListener("click", () => {
                this._clearDOM();
                this._setBodyClass("body-eMenu");
                this._refreshBottomButtons([0,1,3,4]);
                this._getAddVocabDOM(true);
                this._addVocabListeners();
                this.previous_side = "eMenu";
            });
            editButtons[1].setAttribute("id", "delete-vocab-button");
            editButtons[1].addEventListener("click", () => {
                this.tMan.topics[this.currently_shown_topic].vocabs.splice(this.currently_shown_vocab, 1);
                if (this.currently_shown_vocab === this.tMan.topics[this.currently_shown_topic].vocabs.length) this.currently_shown_vocab--;
                if(this.currently_shown_vocab < 0) this.currently_shown_vocab = 0;
                this.tMan.saveAllTopics();
                this._clearDOM();
                this.eMenu_getDOM();
            });

            // ZUM TESTEN HOFFENTLICH KLAPPTS START ###############################

            let totalVocabs = document.querySelector(".vocab-card-header p");
            totalVocabs.setAttribute("id", "vocab-total-cards");
            totalVocabs.innerText = `${this.currently_shown_vocab + 1} / ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
            let vocabFront = document.querySelector(".vocab-card-head p");
            vocabFront.setAttribute("id", "vocab-card-head-content");
            vocabFront.innerText = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front;
            let vocabBack = document.querySelector(".vocab-card-body p");
            vocabBack.setAttribute("id", "vocab-card-body-content");
            vocabBack.innerText = this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back;
            let statWords = document.querySelectorAll(".vocab-card-footer p");
            statWords[0].setAttribute("id" , "vocab-card-times-learned");
            statWords[0].innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].tests}x`;
            statWords[1].setAttribute("id" , "vocab-card-right-answers");
            statWords[1].innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].rights}`;
            statWords[2].setAttribute("id" , "vocab-card-wrong-answers");
            statWords[2].innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].wrongs}`;

        },200);
        middle.style.transform = middlePosition;
        
        this._refreshReadOnlyInterface();

        /* THIS IS THE MOVEMENT E N D  */
    }
    _clearDOM() {
        let body = document.querySelector("body");
        for(let i = 0 ; i < body.classList.length ; i++)
        {
            let className = body.classList[i];
            body.classList.remove(className);
        }

        while(body.children.length !== 4)
        {
            body.firstElementChild.remove();
        }
    }
    _fillRightCardWithDOMContent() {
        let card = document.querySelector(".topic-card-right");
            let buttonContainer = document.createElement("div");
            buttonContainer.setAttribute("class", "topic-card-button-container")
                let editTopicBtn = document.createElement("div");
                editTopicBtn.setAttribute("class", "card-side-buttons");
                    let l1 = document.createElement("div");
                    l1.setAttribute("class", "light-ellipse");
                editTopicBtn.append(l1);
                let addVocabBtn = document.createElement("div");
                addVocabBtn.setAttribute("class", "card-side-buttons");
                    let l2 = document.createElement("div");
                    l2.setAttribute("class", "light-ellipse");
                addVocabBtn.append(l2);
                let deleteTopicBtn = document.createElement("div");
                deleteTopicBtn.setAttribute("class", "card-side-buttons");
                    let l3 = document.createElement("div");
                    l3.setAttribute("class", "light-ellipse");
                deleteTopicBtn.append(l3);
            buttonContainer.append(editTopicBtn);
            buttonContainer.append(addVocabBtn);
            buttonContainer.append(deleteTopicBtn);
            let middleContainer = document.createElement("div");
            middleContainer.setAttribute("class", "topic-card-middle-container");
                let titleContainer = document.createElement("div");
                titleContainer.setAttribute("class", "topic-card-title-container");
                    let totalVocabs = document.createElement("p");
                    totalVocabs.classList.add("class", "topic-card-stat-words");
                    totalVocabs.innerText = `Cards: ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
                    let totalTopics = document.createElement("p");
                    totalTopics.classList.add("class", "topic-card-stat-words");
                    totalTopics.innerText = `${this.currently_shown_topic + 1} / ${this.tMan.topics.length}`;
                titleContainer.append(totalVocabs);
                titleContainer.append(totalTopics);
                let nameOfShownTopic = document.createElement("p");
                nameOfShownTopic.innerText = this.tMan.topics[this.currently_shown_topic].topicname;
                let statContainer = document.createElement("div");
                statContainer.setAttribute("class", "topic-card-stats-container");
                    let timesLearned = document.createElement("p");
                    timesLearned.setAttribute("class", "topic-card-stat-words");
                    timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].total_tests}x`;
                    let rightAnswers = document.createElement("p");
                    rightAnswers.setAttribute("class", "topic-card-stat-words");
                    rightAnswers.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].total_rights}`;
                    let wrongAnswers = document.createElement("p");
                    wrongAnswers.setAttribute("class", "topic-card-stat-words");
                    wrongAnswers.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].total_wrongs}`;
                statContainer.append(timesLearned);
                statContainer.append(rightAnswers);
                statContainer.append(wrongAnswers);
            middleContainer.append(titleContainer);
            middleContainer.append(nameOfShownTopic);
            middleContainer.append(statContainer);
            let levelContainer = document.createElement("div");
            levelContainer.setAttribute("class", "topic-card-level-container");
                for(let i = 0; i < 5 ; i++)
                {
                    let levelCircle = document.createElement("div");
                    levelCircle.setAttribute("class", "level-circles");
                    if(this.tMan.topics[this.currently_shown_topic].average_level === i)
                    {
                        levelCircle.classList.add("lvl-true");
                        this._setTopicLevel(levelCircle, i);
                    }
                    levelContainer.insertAdjacentElement("afterbegin", levelCircle);
                }
        card.append(buttonContainer);
        card.append(middleContainer);
        card.append(levelContainer);
    }
    _fillRightVocabCardWithDOMContent() {
        let card = document.querySelector(".vocab-card-right");
        let voc_buttonContainer = document.createElement("div");
        voc_buttonContainer.setAttribute("class", "vocab-card-button-container")
            let voc_editTopicBtn = document.createElement("div");
            // voc_editTopicBtn.setAttribute("id", "edit-vocab-button");
            voc_editTopicBtn.setAttribute("class", "card-side-buttons");
                let voc_l1 = document.createElement("div");
                voc_l1.setAttribute("class", "light-ellipse");
            voc_editTopicBtn.append(voc_l1);
            let voc_deleteTopicBtn = document.createElement("div");
            // voc_deleteTopicBtn.setAttribute("id", "delete-vocab-button");
            voc_deleteTopicBtn.setAttribute("class", "card-side-buttons");
                let voc_l2 = document.createElement("div");
                voc_l2.setAttribute("class", "light-ellipse");
            voc_deleteTopicBtn.append(voc_l2);
            let marker = document.createElement("div");
            marker.setAttribute("class", "vocab-marker");
            this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].marked ? marker.classList.add("marked") : marker.classList.add("not-marked");
            let markerShadow = document.createElement("div");
            markerShadow.setAttribute("class", "marker-shadow");
        voc_buttonContainer.append(voc_editTopicBtn);
        voc_buttonContainer.append(voc_deleteTopicBtn);
        voc_buttonContainer.append(markerShadow);
        voc_buttonContainer.append(marker);

        let voc_middleContainer = document.createElement("div");
        voc_middleContainer.setAttribute("class", "vocab-card-middle-container");
            let vocHeader = document.createElement("div");
            vocHeader.setAttribute("class", "vocab-card-header");
                let cardCount = document.createElement("p");
                cardCount.innerText = `${this.currently_shown_vocab + 1} / ${this.tMan.topics[this.currently_shown_topic].vocabs.length}`;
                cardCount.setAttribute("class", "vocab-card-stat-words");
                // cardCount.setAttribute("id", "vocab-total-cards");
            vocHeader.append(cardCount);
            
            let vocHead = document.createElement("div");
            vocHead.setAttribute("class", "vocab-card-head");
                let headP = document.createElement("p");
                headP.innerText = `${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].front}`;
                // headP.setAttribute("id", "vocab-card-head-content");
            vocHead.append(headP);

            let vocBody = document.createElement("div");
            vocBody.setAttribute("class", "vocab-card-body");
                let bodyP = document.createElement("p");
                bodyP.innerText = `${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].back}`;
                // bodyP.setAttribute("id", "vocab-card-body-content");
            vocBody.append(bodyP);

            let vocFooter = document.createElement("div");
            vocFooter.setAttribute("class", "vocab-card-footer");
                
                let voc_timesLearned = document.createElement("p");
                // voc_timesLearned.setAttribute("id", "vocab-card-times-learned");
                voc_timesLearned.setAttribute("class", "vocab-card-stat-words");
                voc_timesLearned.innerText = `learned: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].tests}x`;
                let voc_rightAnswers = document.createElement("p");
                // voc_rightAnswers.setAttribute("id", "vocab-card-right-answers");
                voc_rightAnswers.setAttribute("class", "vocab-card-stat-words");
                voc_rightAnswers.innerText = `rights: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].rights}`;
                let voc_wrongAnswers = document.createElement("p");
                // voc_wrongAnswers.setAttribute("id", "vocab-card-wrong-answers");
                voc_wrongAnswers.setAttribute("class", "vocab-card-stat-words");
                voc_wrongAnswers.innerText = `wrongs: ${this.tMan.topics[this.currently_shown_topic].vocabs[this.currently_shown_vocab].wrongs}`;
            vocFooter.append(voc_timesLearned);
            vocFooter.append(voc_rightAnswers);
            vocFooter.append(voc_wrongAnswers);
            
        voc_middleContainer.append(vocHeader);
        voc_middleContainer.append(vocHead);
        voc_middleContainer.append(vocBody);
        voc_middleContainer.append(vocFooter);

    
        let voc_levelContainer = document.createElement("div");
        voc_levelContainer.setAttribute("class", "vocab-card-level-container");
            for(let i = 0; i < 5 ; i++)
            {
                let voc_levelCircle = document.createElement("div");
                voc_levelCircle.setAttribute("class", "level-circles");
                if(this.tMan.topics[this.currently_shown_topic].average_level === i)
                {
                    voc_levelCircle.classList.add("lvl-true");
                    this._setTopicLevel(voc_levelCircle, i);
                }
                voc_levelContainer.insertAdjacentElement("afterbegin", voc_levelCircle);
            }

        card.append(voc_buttonContainer);
        card.append(voc_middleContainer);
        card.append(voc_levelContainer);
    }
    _refreshBottomButtons(arr) {
        let bBtns = document.querySelectorAll(".bottom-buttons");
        bBtns.forEach(button => {
            button.classList.remove("active");
        });
        arr.forEach(index => {
            bBtns[index].classList.add("active");
        })
    }
    /**pops up the error message */
    _getErrorDOM(message, success) {
        this._deactivateButtons();
        let body = document.querySelector("body");

        let eWin = document.createElement("div");
        eWin.setAttribute("id", "error-window");
        eWin.style.backgroundColor = success === false ? "var(--error-bg)" : "var(--success-bg)";
            let h2 = document.createElement("h2");
            h2.innerText = success === false ? "! ERROR !" : "! SUCCESS !";
        eWin.append(h2);

        let p = document.createElement("p");
        p.innerHTML = message;

        eWin.append(p);

        let button = document.createElement("div");
        button.setAttribute("id", "eWin-exit-button");
        button.style.backgroundColor = success === false ? "tomato" : "greenyellow";
            let p2 = document.createElement("p");
            p2.innerText = "Close";

        button.addEventListener("click", () => {
            eWin.remove();
            this._activateButtons();
            this._clearDOM();
            this.eMenu_getDOM();
            this._eMenuRefreshInterface();
            // this._eMenuListeners();
            let middle = document.querySelector(".topic-card-middle");
            let right = document.querySelector(".topic-card-right");
            
        });
        button.append(p2);
        eWin.append(button);
        
        body.insertAdjacentElement("afterbegin", eWin);
    }
    _refreshReadOnlyInterface() {
        /**
         * Welche Items kännten refreshed werden:
         * - Input vom addContainer
         * - ConfirmButton vom addContainer
         */
        let input = document.getElementById("textinput-new-topic");
        let cButton = document.getElementById("confirm-button-new-topic");
        if(input.value === "" || input.value === " " || this._topicTwice(input.value))
        {
            cButton.classList.remove("valid-input");
            cButton.classList.add("invalid-input");
        }
        else
        {
            cButton.classList.remove("invalid-input");
            cButton.classList.add("valid-input");
        }
        let infoNoVocab = document.querySelector("#eMenu-global-topic-container + p");
        if(infoNoVocab !== null)
        {
            infoNoVocab.innerHTML = `You dont have any vocabs for <strong>${this.tMan.topics[this.currently_shown_topic].topicname}</strong> yet.<br>click here to add one`;
        }
    }
    /**after creating a topic, this method checks if its already existent */
    _topicTwice(newTopic) {
        let dublicates = 0;
        this.tMan.topics.forEach(topic => {
            if(topic.topicname.toLowerCase() === newTopic.toLowerCase())
            {
                dublicates++;
            }
        });
        return dublicates === 0 ? false : true;
    }
    _setBodyClass(className) {
        let body = document.querySelector("body");
        for(let i = 0; i < body.classList.length ; i++)
        {
            body.classList.remove(body.classList[i]);
        }
        body.classList.add(className);
    }
    
}