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

var textData = {
    "alignment": "left",
    "characters": []
}

var cObject = {
    "new": function () {
        let self = {
            "content": "letters",
            "fontSize": 16,
            "bold": "false",
            "italic": "false",
        }
        return self;
    }
}

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
    let selectedAlignmentBTN = alignmentButtons[alignment[0] + "AButton"];

    for (let key in alignmentButtons) {
        if (alignmentButtons[key] == selectedAlignmentBTN) {
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

            const textins = e.data;
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            const startOffset = getOffsetIn(textBox, range.startContainer, range.startOffset);
            const endOffset = getOffsetIn(textBox, range.endContainer, range.endOffset);

            for (let i = textData.characters.length-1; i >= 0; i--) {
                const object = textData.characters[i];
                if (object.index >= startOffset+1 && object.index < endOffset+1) {
                    if (object.element && object.element.parentNode) {
                        object.element.remove();
                    }
                    textData.characters.splice(i, 1);
                }
            }

            const span = document.createElement("span");
            span.textContent = textins;
            if (bolden) span.style.fontWeight = "bold";
            if (italicize) span.style.fontStyle = "italic";
            span.style.fontSize = fontSize + "px";

            insertNodeAtCursor(span);

            const index = getCursorCharacterOffsetWithin(textBox);

            let cObj = cObject.new();
            cObj.content = textins;
            cObj.index = index;
            cObj.element = span;

            cObj.bold = bolden;
            cObj.italic = italicize;

            textData.characters.push(cObj);
            console.log(textData.characters);
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
        } else if ((e.ctrlKey || e.metaKey) && e.key == "b") {
            if (document.activeElement == textBox) {
                e.preventDefault();
                toggle(boldenButton);
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key == "i") {
            if (document.activeElement == textBox) {
                e.preventDefault();
                toggle(italicizeButton)
            }
        } else if (e.key == "Backspace") {
            console.log("backspace");
            setTimeout(() => {
                textData.characters.forEach((obj, index) => {
                    if (!document.body.contains(obj.element)) {
                        textData.characters.splice(index, 1);
                        console.log(textData);
                    }
                });
            }, 0);
        } else if (e.inputType == "insertText") {

        }
    });

    for (let key in alignmentButtons) {
        let value = alignmentButtons[key];

        value.addEventListener("click", function () {
            let translate = { "lAButton": "left", "cAButton": "center", "rAButton": "right" };
            alignment = translate[key];
            visualRefresh();
        });
    }

    fSUp.addEventListener("click", function () {
        fontSize += 1;
        visualRefresh();
    });
    fSDown.addEventListener("click", function () {
        if (fontSize > 1) {
            fontSize -= 1;
        }
        visualRefresh();
    });
    fSElement.addEventListener("input", function () {
        console.log("what");
        let content = fSElement.value;

        if (!isNaN(content * 1)) {
            fontSize = (content * 1);
        } else {
            fSElement.value = fontSize;
        }
    });
}

/*function insertNodeAtCursor(node) {
    const selection = window.getSelection()
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);

    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}*/
function insertNodeAtCursor(node) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let range = selection.getRangeAt(0);

    // Fix: Normalize selection so insertion point is always safe
    // If inside a text node, split it properly
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer;
        const offset = range.startOffset;

        // Split the text node at the cursor position
        const before = textNode.nodeValue.slice(0, offset);
        const after = textNode.nodeValue.slice(offset);

        const beforeNode = document.createTextNode(before);
        const afterNode = document.createTextNode(after);

        const parent = textNode.parentNode;

        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(node, textNode);
        parent.insertBefore(afterNode, textNode);

        parent.removeChild(textNode);

        // Move cursor after the inserted node
        range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

    } else {
        // If not inside a text node, just insert normally
        range.deleteContents();
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
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

    if (bolden) span.style.fontWeight = "bold";
    if (italicize) span.style.fontStyle = "italic";

    span.style.fontSize = fontSize + "px";

    try {
        range.surroundContents(span);
    } catch (err) {
        console.warn("Selection could not be styled directly (likely partial nodes). Use a safer method for production.");
    }

    return true;
}

function getCursorCharacterOffsetWithin(element) {
    const sel = window.getSelection();
    let charCount = 0;

    if (sel.rangeCount) {
        const range = sel.getRangeAt(0).cloneRange();
        range.selectNodeContents(element);
        range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
        charCount = range.toString().length;
    }

    return charCount;
}

function getOffsetIn(root, node, offset) {
    let charCount = 0;

    function recurse(current) {
        if (current === node) {
            charCount += offset;
            throw new Error("found"); // Stop traversal
        }

        if (current.nodeType === Node.TEXT_NODE) {
            charCount += current.textContent.length;
        } else {
            for (let child of current.childNodes) {
                recurse(child);
            }
        }
    }

    try {
        recurse(root);
    } catch (e) {
        if (e.message !== "found") throw e;
    }

    return charCount;
}
