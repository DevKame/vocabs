

export class Vocab {
    constructor(front, back, bttopic) {
        this.belongs_to_topic = bttopic;
        this.front = front;
        this.back = back;
        this.level = 0;
        this.tests = 0;
        this.wrongs = 0;
        this.rights = 0;
        this.marked = false;
    }
}