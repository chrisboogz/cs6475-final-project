function generate() {
    var d = Date.now();
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : ( r&0x3 | 0x8)).toString(16);
    });
    return id;
}

module.exports.generate = generate;