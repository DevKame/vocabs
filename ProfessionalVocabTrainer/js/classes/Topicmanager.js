

import { Topic } from "./Topic.js";
import { Vocab } from "./Vocab.js";


export class Topicmanager {
    constructor(storageKey) {
        this.topics = localStorage.getItem("kamedin-vocab-trainer") === null ? [] : JSON.parse(localStorage.getItem("kamedin-vocab-trainer"));
        //everything for the learning mode:
        this.learn_array = [];
        this.check_array_already_learned = [];
        this.scoreAquired = true;
        this.currently_learned_vocab = 0;
        this.actual_progress = "0";
        this.random_learn_order = false;
        this.reverse_query = false;
    }
    createTopic(topicname) {
        let topic = new Topic(topicname);
        //just in case i need a topic with another level than 0 during development:
        topicname.slice(0, 1) === "3" ? topic.average_level = 2 : topic.average_level = 0;
        this.topics.push(topic);
    }
    saveAllTopics() {
        localStorage.setItem("kamedin-vocab-trainer", JSON.stringify(this.topics));
    }
    createNewVocab(front, back) {
        return new Vocab(front, back);
    }
}