const text = "dere.prime";
const TextElement = document.getElementById('header');

let index = 0;

function WriteHeaderText() {
    if (index < text.length) {
        TextElement.textContent = text.slice(0, index + 1);
        index++;
        setTimeout(WriteHeaderText, 180);
    }
}

WriteHeaderText();