
// A Helper function to create an element and attach it to another node;
let createElement = (element, parent)=>{ 
    let node = document.createElement(element);
    parent.appendChild(node);
    return node
};

window.onload = function(){
    let gallery = this.document.getElementById("ltree-gallery");
    for(let i = 1; i <=12; i++)
    {
        let name = `LTree_${i}.png`
        let str = './assets/ltree/' + name;
        let img = createElement("img", gallery);
        img.setAttribute("class", "portfolio-image");
        img.setAttribute("class", "container-fluid")
        img.setAttribute("src", str);
        img.setAttribute("alt", name);
        this.console.log(img);

    }
}