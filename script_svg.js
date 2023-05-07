// ezek megvannak már PixelMakerben, és duplikációs hibát jeleznek majd
//(de ha mégsem, akkor rosszuk betűztem őket!)
let columnLengthInTile;
let rowLengthInTile;
let pixDataArr =['Loaded from file'];

// Global scope variables
let SVGtext =''
let xArrayRegex;
let yArrayRegex;
let fillArrayRegex;

// Ezzel lehet az x, vagy y értékeket kivonni a xArrayRegex tömbökből
const numberExtractor = (arr)=>{
    let quotedNum= arr.map(item=> item.match(/\d+/));
    return quotedNum.map(item=>item[0]);
}



const makePixDataArr = ()=>{
    let posXArr = numberExtractor(xArrayRegex).map(item => parseInt(item));
    posXArr.unshift('empty slot');
    let posYArr = numberExtractor(yArrayRegex).map(item => parseInt(item));
    posYArr.unshift('empty slot');
    let colorArr = ['empty slot',...colorExtractor()];
    
    pixDataArr =['Loaded from SVG file'];
    for(let i=1;i<xArrayRegex.length;i++){
        pixDataArr[i]={
            positionX: posXArr[i],
            positionY: posYArr[i], 
            color: colorArr[i]
        }
    }

}

//ezzel lehet kivonni a fillArrayRegex-ből kivonni a színeket
const colorExtractor = ()=>{
    
    
    let quotedColor = fillArrayRegex.map(item=> item.match(/'.+'/));
    //console.log(quotedColor);
    
    let regexp = /[^'].+[^']/;
    //console.log(flatColorArr)
    let unQuotedColor = quotedColor.map(item=> item[0].match(regexp));
    return unQuotedColor.map(item=>item[0]);
}

/* Valójában elég lehet csak a fill-ek indexe alapján meghatározni
az indexeket.
A rowLengthInTile-hoz kell az X értéke és úgy meghatározható, hogy
megszámoljuk, hogy hányszor kezdődik el a sor, mégpedig az alapján, 
hogy hány 0 érték van.   
Ugyanez a logika igaz az Y-ra és columnLengthInTile-ra is.

*/ 

// function for cunting 0-s to set columnLengthInTile(X) or rowLengthInTile(Y)
function zeroCounter(XorYArrayRegex){
   let yzeros = numberExtractor(XorYArrayRegex); 
   let onlyZero = yzeros.filter(item =>{
if(item==='0'){return true}
   })  
   return onlyZero.length;
}

//SVG text reading with FileReader
function loadingSVG (){
    const [file] = document.querySelector('input[type=file]').files;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load',function(){
      let resultText =  reader.result;
      console.log(resultText.substring(0, 200));
      // lehet használni a feltöltött .svg adatait:
      SVGtext = resultText;
      xArrayRegex = SVGtext.match(/\sx="\d+/g);
      yArrayRegex = SVGtext.match(/y="\d+/g);
      fillArrayRegex = SVGtext.match(/fill='#\w{3,6}'|fill='rgba?\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},?[01]*\.?\d*\)'|fill='\w+'|fill='hsla?\(\s*[0-9]+%?\s*,\s*[0-9]+%?\s*,?\s*[0-9]+%?\s*,?\s*[01].?\d*\s*\)\s*'/gi);
      
    })

}

// ennek kell majd lennie az összefoglaló funkciónak
function loader(){
    //variables needed:
columnLengthInTile = zeroCounter(xArrayRegex);
rowLengthInTile= zeroCounter(yArrayRegex);
makePixDataArr();
// IDE MEGY MAJD MINDEN KORÁBBI FUNKCIÓ!!

}

const timeToTest =()=>{
    loader();
    console.log('columnLengthInTile: '+columnLengthInTile);
    console.log('rowLengthInTile: '+rowLengthInTile);
    
    console.log('pixDataArr: ');
    console.log(pixDataArr);
}

