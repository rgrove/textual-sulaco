var doc = document,
    qs  = doc.querySelector;

// -- Succinct -------------------------------------------------------------------
var Succinct;

Succinct = {
    lineCache: {},
    playbackMode: false,

    coalesceMessages: function (lineNum, fromBuffer) {
        // doc.body.prepareForMutation();
        // Succinct.getLineEl(lineNum).prepareForMutation();
        // Succinct.getLineEl(lineNum).classList.prepareForMutation();
        // Succinct.getSenderEl(lineEl).prepareForMutation();

        var lineEl     = Succinct.getLineEl(lineNum),
            prevLineEl = lineEl && Succinct.getLineEl(lineEl.previousElementSibling),
            prevSender = Succinct.getSenderNick(prevLineEl),
            sender     = Succinct.getSenderNick(lineEl);

        if (!sender || !prevSender) {
            return;
        }

        if (sender === prevSender
                && Succinct.getLineType(lineEl) === 'privmsg'
                && Succinct.getLineType(prevLineEl) === 'privmsg') {

            // Succinct.getLineEl(lineNum).prepareForMutation();
            // Succinct.getLineEl(lineNum).classList.prepareForMutation();
            // Succinct.getSenderEl(lineEl).prepareForMutation();
           
            lineEl.classList.add('coalesced');
            Succinct.getSenderEl(lineEl).innerHTML = '';
        }
    },

    getLineEl: function (lineNum) {
        if (typeof lineNum === 'string') {
            return doc.getElementById('line' + lineNum);
        }

        if (lineNum && lineNum.classList
                && lineNum.classList.contains('line')) {
            return lineNum;
        }

        return null;
    },

    getLineType: function (line) {
        line = Succinct.getLineEl(line);
        return line ? line.getAttribute('type') : null;
    },

    getMessage: function (line) {
        line = Succinct.getLineEl(line);
        return line ? line.querySelector('.message').textContent.trim() : null;
    },

    getSenderEl: function (line) {
        line = Succinct.getLineEl(line);
        return line ? line.querySelector('.sender') : null;
    },

    getSenderNick: function (line) {
        var senderEl = Succinct.getSenderEl(line);
        return senderEl ? senderEl.getAttribute('nickname') : null;
    },

    handleBufferPlayback: function (lineNum, fromBuffer) {
        var line = Succinct.getLineEl(lineNum),
            message;

        if (Succinct.getSenderNick(line) === '***') {
            message = Succinct.getMessage(line);

            if (message === 'Buffer Playback...') {
                line.classList.add('znc-playback-start');
                Succinct.playbackMode = true;
            } else if (message === 'Playback Complete.') {
                line.classList.add('znc-playback-end');
                Succinct.playbackMode = false;
            }

            return;
        }

        if (Succinct.playbackMode) {
            var match;

            line.classList.add('znc-playback');

            message = Succinct.getMessage(line);
            match   = message.match(/^\[(\d\d:\d\d:\d\d)\] /);

            if (match) {
                var msgEl = line.querySelector('.message');

                line.querySelector('.time').textContent = match[1];
                msgEl.innerHTML = msgEl.innerHTML.replace(/^\s*\[\d\d:\d\d:\d\d\]/, '');
            }
        }
    }
};

// -- Textual ------------------------------------------------------------------

// Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js"

// Textual.newMessagePostedToView = function (lineNum) {
//     Succinct.handleBufferPlayback(lineNum);
//     Succinct.coalesceMessages(lineNum);
// };

Textual.messageAddedToView(lineNumber, fromBuffer) {
    Succinct.handleBufferPlayback(lineNum, fromBuffer);
    Succinct.coalesceMessages(lineNum, fromBuffer);
};

Textual.viewFinishedLoading = function () {
    Textual.fadeOutLoadingScreen(1.00, 0.95);

    // setTimeout(function () {
    //     Textual.scrollToBottomOfView();
    // }, 300);
};

Textual.viewFinishedReload = function () {
    Textual.viewFinishedLoading();
};
