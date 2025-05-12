var boldenButton;
var italicizeButton;

var textBox;

var bolden = false;
var italicize = false;



function not(item) {
    if (typeof (item) == "boolean") {
        if (item == true) {
            return false
        } else {
            return true
        }
    }
}

function visualRefresh() {

    console.log(bolden);
}

function toggle(button) {
    console.log(button)
    if (button == boldenButton) {
        bolden = not(bolden);
        boldenButton.classList.toggle("unselected");
        boldenButton.classList.toggle("selected");
    }
    if (button == italicizeButton) {
        italicize = not(italicize);
        italicizeButton.classList.toggle("unselected");
        italicizeButton.classList.toggle("selected");
    }

    visualRefresh();
}

function onready() {
    boldenButton.addEventListener('click', function () {
        toggle(boldenButton);
    });
    italicizeButton.addEventListener("click", function () {
        toggle(italicizeButton)
    });

    textBox.addEventListener("beforeinput", function (e) {
        if (e.inputType == "insertText") {
            e.preventDefault();

            const textInsertion = e.data;

            const textSpan = document.createElement('span');
            textSpan.textContent = textInsertion;

            if (bolden) textSpan.style.fontWeight = "bold";
            if (italicize) textSpan.style.fontStyle = "italic";

            insertNodeAtCursor(textSpan);
        }
    });
    textBox.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            console.log("BREAK");
            e.preventDefault();

            const breaker = document.createElement("br");
            insertNodeAtCursor(breaker);
        } else if (e.key == "Tab") {
            console.log("TAB");

            if (document.activeElement == textBox) { // is selected
                e.preventDefault();
                const span = document.createElement("span");
                span.innerText = "\u00A0\u00A0\u00A0\u00A0";

                insertNodeAtCursor(span);
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key == "b"){
            e.preventDefault();
            toggle(boldenButton);
        } else if ((e.ctrlKey || e.metaKey) && e.key == "i"){
            e.preventDefault();
            toggle(italicizeButton)
        }
    });
}

function insertNodeAtCursor(node) {
    const selection = window.getSelection()
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);

    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

addEventListener('DOMContentLoaded', () => {
    boldenButton = document.getElementById("bolden");
    italicizeButton = document.getElementById("italic")

    textBox = document.getElementById("rich-editor");

    onready()
});