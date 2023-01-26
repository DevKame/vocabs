

export class Topic {
    constructor(topicname) {
        this.topicname = topicname;
        this.vocabs = [];
        this.average_level = 0;
        this.total_tests = 0;
        this.total_wrongs = 0;
        this.total_rights = 0;
    }
}