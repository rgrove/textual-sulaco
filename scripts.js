// -- Succinct -------------------------------------------------------------------

var Succinct;

Succinct = {
    coalesceMessages: function (line)
    {
        var previousLine = Succinct.getPreviousLine(line);
        var previousSender = Succinct.getSenderNickname(previousLine);
        var sender = Succinct.getSenderNickname(line);

        if (sender === null || previousSender === null) {
            return;
        }

        if (sender === previousSender &&
            Succinct.getLineType(line) === 'privmsg' && 
            Succinct.getLineType(previousLine) === 'privmsg')
        {

            line.classList.add('coalesced');
            Succinct.getSenderElement(line).innerHTML = '';
        }
    },

    getPreviousLine: function (line) {
        var previousLine = line.previousElementSibling;

        if (previousLine &&
            previousLine.classList &&
            previousLine.classList.contains('line'))
        {
            return previousLine;
        }

        return null;
    },

    getLineType: function (line) {
        return ((line) ? line.getAttribute('ltype') : null);
    },

    getMessage: function (line) {
        return ((line) ? line.querySelector('.message').textContent.trim() : null);
    },

    getSenderElement: function (line) {
        return ((line) ? line.querySelector('.sender') : null);
    },

    getSenderNickname: function (line) {
        var sender = Succinct.getSenderElement(line);
        return ((sender) ? sender.getAttribute('nickname') : null);
    },
};

// -- Textual ------------------------------------------------------------------

// Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js"

Textual.viewBodyDidLoad = function()
{
    Textual.fadeOutLoadingScreen(1.00, 0.90);
}

Textual.messageAddedToView = function(line, fromBuffer) {
    var element = document.getElementById("line-" + line);

    // Succinct.handleBufferPlayback(lineNum, fromBuffer);
    Succinct.coalesceMessages(element);

    ConversationTracking.updateNicknameWithNewMessage(element);
}
