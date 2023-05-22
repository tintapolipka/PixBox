//Inported from: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server

function download(filename, text) {
  // létrehoz egy linket
  var element = document.createElement("a");
  //beállítja a hivatkozást szövegre, úgy, hogy a tartalmát URI kompatibilis legyen.
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  // beállítja a html linket letöltésre
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Az pixel adatokat sorra tartalmazó tömb:
let pixDataArr = ["Position X, Y, and tile color"];

//Size of pixelart:
let rowLengthInTile = 5;
let columnLengthInTile = 5;

const paletteCreator = (palette) => {
  let pal = document.getElementById("colorPicker");
  pal.innerHTML = `<div class="colorBox" id="none" onclick="colorPick('rgba(1,1,1,0)')">none</div>`;
  let Arr = [];
  switch (palette) {
    case "basicPal":
      Arr = basicPal;
      break;

    case "commodore64":
      Arr = commodore64;
      break;

    default:
      Arr = basicPal;
      break;
  }
  for (i = 0; i < Arr.length; i++) {
    pal.innerHTML += `<div class="colorBox" id="${Arr[i].name}" onclick="colorPick('${Arr[i].code}')"><style>#${Arr[i].name}{background-color: ${Arr[i].code};}</style>${Arr[i].name}</div>`;
  }
  pal.innerHTML += `<button id="undoButton" class="colorBox" onclick="undo()">undo</button>`;
};

// aktuálisan kiválasztott szín:
let pickedColor = "none";

//history for undo function:
let colorHistory = [[]];

// színválasztó funkció:
const colorPick = (colour) => {
  pickedColor = colour;

  document.getElementById("pickedColor").style.backgroundColor = pickedColor;
};

//Miniatűr
const smallPic = () => {
  let smp = document.getElementById("smallPic");
  smp.innerHTML = "";
  smp.innerHTML = `<style>#smallPic{width:${10 * rowLengthInTile}px; height:${
    10 * columnLengthInTile
  }px;}</style>`;
  for (let l = 1; l < pixDataArr.length; l++) {
    smp.innerHTML += `<div class="sp sp${l}"><style>  .sp${l}{background-color:${pixDataArr[l].color}}</style></div>`;
  }
};

function rowAndCoulmnInput() {
  rowLengthInTile = document.getElementById("width-of-svg").value;
  columnLengthInTile = document.getElementById("height-of-svg").value;
}

const newPicGenerator = (palette, loadingTrue) => {
  // constructing the frame for tiles
  const tileDivSection = document.getElementById("tileDivSection");
  // declearing the tileside size
  let tileSide = 40;
  if (rowLengthInTile > 15) {
    tileSide = 25;
  }
  tileDivSection.style.width = rowLengthInTile * tileSide + "px";
  tileDivSection.style.height = columnLengthInTile * tileSide + "px";

  // for cycle to create given number of tiles
  // először egy stringet generáljunk le, és a végén az adjuk meg innerHTML
  let finalTxt = "";
  tileDivSection.innerHTML = "";
  for (i = 1; i < columnLengthInTile * rowLengthInTile + 1; i++) {
    if (!loadingTrue) {
      pixDataArr[i] = new TileObj(i, "none");
    }
    finalTxt += `<div id="tile${i}" class="tileBasicClass class${i}" onclick="coloringTiles(${i})">
  <style> .tileBasicClass{width:${100 / rowLengthInTile}%; height:${
      100 / columnLengthInTile
    }%;} #tile${i} {background-color:`;
    if (loadingTrue) {
      finalTxt += pixDataArr[i].color;
    } else {
      finalTxt += "rgba(1,1,1,0)";
    }
    finalTxt += `;}</style> ${i} </div>`;
  }

  tileDivSection.innerHTML = finalTxt;
  // generating, the palette:
  paletteCreator(palette);
  smallPic();
  historian();
  //using uploaded picture
  bgImported("tileDivSection");
  document.getElementById("newPic").classList.toggle("left_toggle");

};

// Undo
const historian = () => {
  for (let i = 1; i < pixDataArr.length; i++) {
    colorHistory[i] = ["rgba(1,1,1,0)"];
  }
};

const undo = () => {
  if (colorHistory[0].length === 0) {
    console.log("No more actions to undo.");
  } else {
    let index = colorHistory[0][colorHistory[0].length - 1];
    let colornow = colorHistory[index][colorHistory[index].length - 2];
    pixDataArr[index]["color"] = colornow;
    document.querySelector(".class" + index).style.backgroundColor = colornow;
    document.querySelector(`.sp${index}`).style.backgroundColor = colornow;
    colorHistory[0].pop();
    colorHistory[index].pop();
  }
};

// Tömb tartalom készítő konstruktor (meghíváskor new parancs!)
function TileObj(arrindex, color) {
  this.positionX =
    (arrindex % rowLengthInTile === 0
      ? rowLengthInTile - 1
      : (arrindex % rowLengthInTile) - 1) * 10;
  this.positionY =
    (Math.trunc(arrindex / rowLengthInTile) === arrindex / rowLengthInTile
      ? arrindex / rowLengthInTile - 1
      : Math.trunc(arrindex / rowLengthInTile)) * 10;
  this.color = color;
}

// Tile coloring function:
const coloringTiles = (index) => {
  document.querySelector(".class" + index).style.backgroundColor = pickedColor;
  pixDataArr[index]["color"] = pickedColor;
  console.log("New color of tile nr." + index + ": " + pickedColor);
  document.querySelector(`.sp${index}`).style.backgroundColor = pickedColor;
  colorHistory[0].push(index);
  colorHistory[index].push(pickedColor);
};

/*
Az SVG szövegét legeneráló funkció közepe egy ismétlődő ciklus: */
const middleOfSVG = () => {
  let middleSVG = ``;
  for (let j = 1; j < pixDataArr.length; j++) {
    middleSVG += `<rect x="${pixDataArr[j]["positionX"]}" y="${pixDataArr[j]["positionY"]}" width="11" height="11" fill='${pixDataArr[j]["color"]}'/>`;
  }
  return middleSVG;
};

// Az SVG-t legeneráló funkció tehát:
const myText = () => {
  let widthOfSVG = 10 * rowLengthInTile;
  let heightOFSVG = 10 * columnLengthInTile;
  let basicSVGstart = `<svg width="${widthOfSVG}" height="${heightOFSVG}" viewBox="0 0 ${widthOfSVG} ${heightOFSVG}" fill="none" xmlns="http://www.w3.org/2000/svg">`;
  return basicSVGstart + middleOfSVG() + "</svg>";
};

//Színválasztás:
//Custom Paletta tömb készítő:
function Colour(name, code) {
  this.name = name;
  this.code = code;
}

document
  .getElementById("newPicActivator")
  .addEventListener("click", function (e) {
    document.getElementById("newPic").classList.toggle("left_toggle");
    shadowToggle("newPicActivator");
    if (e.target.innerText === "NEW") {
      e.target.innerText = "Hide";
    } else {
      e.target.innerText = "NEW";
    }
  });

function bgImported(nodeName) {
  if (document.getElementById("bgFile").files[0]) {
    let x = URL.createObjectURL(document.getElementById("bgFile").files[0]);

    document.getElementById(
      nodeName
    ).style.background = `url(${x}) center center/cover`;
  } else if (document.getElementById("bgImgUrl").value) {
    let y = document.getElementById("bgImgUrl").value;
    document.getElementById(
      nodeName
    ).style.background = `url(${y}) center center/cover`;
  } else {
    console.log("No file for background now");
  }
}

/*A betöltés funkció: A newPicGenerator-t kellene módosítani, úgy: 
hogy: képes legyen fogadni a pixDataArr-t a loadertől
legyen egy kapcsoló, ÚJ/BETötés között (még egy argumentum dönt róla)
Adjunk hozzá olyan színeket a palettához, amik a kép sajátjai 
(és esetleg nem szerepelnek már a kiválasztott palettában.)
*/

// Global scope variables
let SVGtext = "";
let xArrayRegex;
let yArrayRegex;
let fillArrayRegex;

// Ezzel lehet az x, vagy y értékeket kivonni a xArrayRegex tömbökből
const numberExtractor = (arr) => {
  let quotedNum = arr.map((item) => item.match(/\d+/));
  return quotedNum.map((item) => item[0]);
};

const makePixDataArr = () => {
  let posXArr = numberExtractor(xArrayRegex).map((item) => parseInt(item));
  posXArr.unshift("empty slot");
  let posYArr = numberExtractor(yArrayRegex).map((item) => parseInt(item));
  posYArr.unshift("empty slot");
  let colorArr = ["empty slot", ...colorExtractor()];

  pixDataArr = ["Loaded from SVG file"];
  for (let i = 1; i < xArrayRegex.length + 1; i++) {
    pixDataArr[i] = {
      positionX: posXArr[i],
      positionY: posYArr[i],
      color: colorArr[i],
    };
  }
};

//ezzel lehet kivonni a fillArrayRegex-ből kivonni a színeket
const colorExtractor = () => {
  let quotedColor = fillArrayRegex.map((item) => item.match(/'.+'/));
  //console.log(quotedColor);

  let regexp = /[^'].+[^']/;
  //console.log(flatColorArr)
  let unQuotedColor = quotedColor.map((item) => item[0].match(regexp));
  let noneLessArr = unQuotedColor.map((item) => item[0]);
  return noneLessArr.map((item) => {
    if (item === "none") {
      return "rgba(1,1,1,0)";
    } else {
      return item;
    }
  });
};

/* Valójában elég lehet csak a fill-ek indexe alapján meghatározni
az indexeket.
A rowLengthInTile-hoz kell az X értéke és úgy meghatározható, hogy
megszámoljuk, hogy hányszor kezdődik el a sor, mégpedig az alapján, 
hogy hány 0 érték van.   
Ugyanez a logika igaz az Y-ra és columnLengthInTile-ra is.

*/

// function for cunting 0-s to set columnLengthInTile(X) or rowLengthInTile(Y)
function zeroCounter(XorYArrayRegex) {
  let yzeros = numberExtractor(XorYArrayRegex);
  let onlyZero = yzeros.filter((item) => {
    if (item === "0") {
      return true;
    }
  });
  return onlyZero.length;
}

//SVG text reading with FileReader
function loadingSVG() {
  const [file] = document.querySelector("#inputSVGText").files;
  const reader = new FileReader();
  reader.readAsText(file);
  reader.addEventListener("load", function () {
    let resultText = reader.result;
    console.log(resultText.substring(0, 200));
    // lehet használni a feltöltött .svg adatait:
    SVGtext = resultText;
    xArrayRegex = SVGtext.match(/\sx="\d+/g);
    yArrayRegex = SVGtext.match(/y="\d+/g);
    fillArrayRegex = SVGtext.match(
      /fill='#\w{3,6}'|fill='rgba?\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},?[01]*\.?\d*\)'|fill='\w+'|fill='hsla?\(\s*[0-9]+%?\s*,\s*[0-9]+%?\s*,?\s*[0-9]+%?\s*,?\s*[01].?\d*\s*\)\s*'/gi
    );
  });
}

// ennek kell majd lennie az összefoglaló funkciónak
const loader = () => {
  const [file] = document.querySelector("#inputSVGText").files;
  if (file) {
    alert(
      "Your current work will be lost. If you want to save it, download SVG now, then click Load button again!"
    );
    const loaderBtn = document.getElementById("loaderBtn");
    loaderBtn.removeAttribute("onclick");
    loaderBtn.innerText = "Do load!";
    loaderBtn.addEventListener("click", function () {
      //variables needed:
      console.log("clicked");
      columnLengthInTile = zeroCounter(xArrayRegex);
      rowLengthInTile = zeroCounter(yArrayRegex);
      makePixDataArr();
      newPicGenerator(
        document.querySelector("input.palselect:checked").value,
        true
      );
      hideLoadDialog();
    });
  } else {
    alert("No SVG file selected. Use fileselector to select one.");
  }
};

//open/close Download-modal
function showThisDialog() {
  document.getElementById("save-and-load").show();
  document.getElementById("download-dialog-btn").onclick = hideThisDialog;
  document.getElementById("download-dialog-btn").innerText = "Hide";
  shadowToggle('download-dialog-btn');
}

function hideThisDialog() {
  document.getElementById("save-and-load").close();
  document.getElementById("download-dialog-btn").onclick = showThisDialog;
  document.getElementById("download-dialog-btn").innerText = "Export";
  shadowToggle('download-dialog-btn');
}

function showLoadDialog() {
  document.getElementById("load-a-pixbox-svg").show();
  document.getElementById("load-dialog-btn").onclick = hideLoadDialog;
  document.getElementById("load-dialog-btn").innerText = "Hide";
  shadowToggle('load-dialog-btn');
}

function hideLoadDialog() {
  document.getElementById("load-a-pixbox-svg").close();
  document.getElementById("load-dialog-btn").onclick = showLoadDialog;
  document.getElementById("load-dialog-btn").innerText = "LOAD";
  shadowToggle('load-dialog-btn');
}

function shadowToggle(btn_ID){
 document.getElementById(btn_ID).classList.toggle('shadow_toggle')
}