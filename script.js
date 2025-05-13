var boldenButton;
var italicizeButton;

var textBox;

var bolden = false;
var italicize = false;

var fontSize = 16;

var fSUp;
var fSDown;

var fSElement;

var alignmentButtons = {
    "lAButton": null,
    "cAButton": null,
    "rAButton": null
};

var alignment = "left";

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
    let selectedAlignmentBTN = alignmentButtons[alignment[0]+"AButton"];

    for(let key in alignmentButtons){
        if(alignmentButtons[key] == selectedAlignmentBTN){
            selectedAlignmentBTN.classList.add("selected");

            textBox.style.textAlign = alignment;
        } else {
            alignmentButtons[key].classList.remove("selected");
        }
    };

    fSElement.value = fontSize;

    applyStyleToSelection()
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

            textSpan.style.fontSize = fontSize+"px";

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
            if(document.activeElement == textBox){
                e.preventDefault();
                toggle(boldenButton);
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key == "i"){
            if(document.activeElement == textBox){
            e.preventDefault();
            toggle(italicizeButton)
            }
        }
    });

    for(let key in alignmentButtons){
        let value = alignmentButtons[key];

        value.addEventListener("click",function(){
            let translate = {"lAButton":"left","cAButton":"center","rAButton":"right"};
            alignment = translate[key];
            visualRefresh();
        });
    }

    fSUp.addEventListener("click", function(){
        fontSize += 1;
        visualRefresh();
    });
    fSDown.addEventListener("click", function(){
        if(fontSize > 1){
            fontSize -= 1;
        }
        visualRefresh();
    });
    fSElement.addEventListener("input",function(){
        console.log("what");
        let content = fSElement.value;

        if(!isNaN(content*1)){
            fontSize = (content*1);
        } else {
            fSElement.value = fontSize;
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

    alignmentButtons.lAButton = document.getElementById("left-align");
    alignmentButtons.rAButton = document.getElementById("right-align");
    alignmentButtons.cAButton = document.getElementById("center-align");

    fSUp = document.getElementById("size-up");
    fSDown = document.getElementById("size-down");
    fSElement = document.getElementById("fontSize");

    textBox = document.getElementById("rich-editor");

    onready()
});

function applyStyleToSelection() {
    const selection = window.getSelection();

    if (document.activeElement != textBox) return;

    if (!selection.rangeCount || selection.isCollapsed) {
        // Nothing selected — just update style mode
        return false;
    }

    const range = selection.getRangeAt(0);

    // Create a span with styles
    const span = document.createElement("span");
    
    if(bolden) span.style.fontWeight = "bold";
    if(italicize) span.style.fontStyle = "italic";

    span.style.fontSize = fontSize+"px";

    try {
        range.surroundContents(span);
    } catch (err) {
        console.warn("Selection could not be styled directly (likely partial nodes). Use a safer method for production.");
    }

    return true;
}
