// Dom handler
const sections = document.getElementsByTagName("h2"),
    contents = document.getElementById("contents");

let newNode,
    sectionIndex = 1;

for (section of sections) {
    section.id = `section${sectionIndex}`;
    newNode = document.createElement("a");
    newNode.innerHTML = section.innerHTML;
    newNode.href = `#section${sectionIndex}`;
    const sectionNow = section;
    newNode.onclick = function () {
        sectionNow.parentNode.style.animationName = "blink";
        setTimeout(function () {
            sectionNow.parentNode.style.animationName = "";
        }, 2000);
    };
    contents.appendChild(newNode);
    sectionIndex++;
}
