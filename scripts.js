var doc = document,
    qs  = doc.querySelector;

// -- Sulaco -------------------------------------------------------------------
var Sulaco;

Sulaco = {
    lineCache: {},
    playbackMode: false,

    coalesceMessages: function (lineNum) {
        var lineEl     = Sulaco.getLineEl(lineNum),
            prevLineEl = lineEl && Sulaco.getLineEl(lineEl.previousElementSibling),
            prevSender = Sulaco.getSenderNick(prevLineEl),
            sender     = Sulaco.getSenderNick(lineEl);

        if (!sender || !prevSender) {
            return;
        }

        if (sender === prevSender
                && Sulaco.getLineType(lineEl) === 'privmsg'
                && Sulaco.getLineType(prevLineEl) === 'privmsg') {

            lineEl.classList.add('coalesced');
            Sulaco.getSenderEl(lineEl).innerHTML = '';
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
        line = Sulaco.getLineEl(line);
        return line ? line.getAttribute('type') : null;
    },

    getMessage: function (line) {
        line = Sulaco.getLineEl(line);
        return line ? line.querySelector('.message').textContent.trim() : null;
    },

    getSenderEl: function (line) {
        line = Sulaco.getLineEl(line);
        return line ? line.querySelector('.sender') : null;
    },

    getSenderNick: function (line) {
        var senderEl = Sulaco.getSenderEl(line);
        return senderEl ? senderEl.getAttribute('nick') : null;
    },

    handleBufferPlayback: function (lineNum) {
        var line = Sulaco.getLineEl(lineNum),
            message;

        if (Sulaco.getSenderNick(line) === '***') {
            message = Sulaco.getMessage(line);

            if (message === 'Buffer Playback...') {
                line.classList.add('znc-playback-start');
                Sulaco.playbackMode = true;
            } else if (message === 'Playback Complete.') {
                line.classList.add('znc-playback-end');
                Sulaco.playbackMode = false;
            }

            return;
        }

        if (Sulaco.playbackMode) {
            var match;

            line.classList.add('znc-playback');

            message = Sulaco.getMessage(line);
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

Textual.newMessagePostedToView = function (lineNum) {
    Sulaco.handleBufferPlayback(lineNum);
    Sulaco.coalesceMessages(lineNum);
};

// Textual.messageAddedToView(lineNumber, fromBuffer) {
//     Sulaco.handleBufferPlayback(lineNum);
//     Sulaco.coalesceMessages(lineNum);
// }

Textual.viewFinishedLoading = function () {
    Textual.fadeOutLoadingScreen(1.00, 0.95);

    setTimeout(function () {
        Textual.scrollToBottomOfView();
    }, 300);
};

Textual.viewFinishedReload = function () {
    Textual.viewFinishedLoading();
};
