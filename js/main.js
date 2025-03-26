
import { personIcon } from "./constants.js";
import { getNoteIcon, getStatus } from "./helpers.js";
import elements from "./ui.js";




/*
*Başlangıçta kullanıcının konumuna erişmeliyiz ki bu sayede haritanın

*başlangıç konumunu belirleyeceğiz

*/
// Global değişkenler

var map;

let clickedCoords;
let layer;

let notes=JSON.parse(localStorage.getItem("notes")) || []


window.navigator.geolocation.getCurrentPosition((e)=>{
    loadMap([e.coords.latitude,e.coords.longitude],"Mevcut Konum")
    
},
(e)=>{
    loadMap([39.924833, 32.836660],"Varsayılan Konum")
    
})

function loadMap(currentPosition , msg){

    map = L.map("map",{zoomControl:false}).setView(currentPosition, 12);



    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom araçlarınının konumlanması

    L.control.zoom({position:"bottomright"}).addTo(map)


    // Ekrana basılacak bir katman oluştur

     layer=L.layerGroup().addTo(map)

    L.marker(currentPosition,{icon:personIcon}).addTo(map).bindPopup(msg)

    // Harita üzerinde tıklama olaylarını izle

    map.on("click",onMapClick)
    renderNotes()
    renderMarkers()
}

// Haritaya tıklanıldığında çalışacak func.
function onMapClick(e){
   //tıklanılan yerin koordinatlarına eriş
clickedCoords=  [e.latlng.lat,e.latlng.lng]

// aside a add clasını ekle
elements.aside.classList.add("add")
    
}

// ! Formun Gönderilmesini İzle
elements.form.addEventListener("submit",(e)=>{
    e.preventDefault()

    
    const title=e.target[0].value
    const date=e.target[1].value
    const status=e.target[2].value

    const newNote={
        id:new Date().getTime(),
        title,
        date,
        status,
        coords:clickedCoords,
    }
    notes.push(newNote)
    
    localStorage.setItem("notes",JSON.stringify(notes))
    //Formu resetle 
     e.target.reset()

    //Aside ı eski haline çevir
    elements.aside.classList.remove("add")
    renderNotes()
    renderMarkers()
    
})


//CancelBtn e tıklanınınca aside ı tekrardan eski haline çevir

elements.cancelBtn.addEventListener("click",()=>{
    elements.aside.classList.remove("add")
})

// Mevcut notları render eden fonks

function renderNotes(){ 
  const noteCard=notes.map((note)=>{

//Tarih ayarı
 
const date=new Date(note.date).toLocaleDateString("tr",{
    day:"2-digit",
    month:"long",
    year:"numeric"
})

//Status ayarlaması


           return   `<li>
                <div>
                    <p> ${note.title} </p>
                    <p> ${date} </p>
                    <p> ${getStatus(note.status)} </p>
                </div>
                <div class="icons">
                    <i  data-id="${note.id}" class="bi bi-airplane-fill" id="fly-btn" ></i>
                    <i data-id="${note.id}"  class="bi bi-trash" id="delete-btn" ></i>
                </div>
            </li>`}).join("")

            elements.noteList.innerHTML=noteCard

            //deleteIcons lara eriş ve her icona tıklanınca bir fonks çalıştır
            document.querySelectorAll("li #delete-btn").forEach((btn)=>{

              const id=btn.dataset.id

               //delete iconlarına tıklanınca deleteNote fonk çalıştır

               btn.addEventListener("click",()=>{
                deleteNote(id)
               })
                
            })
            // Fly iconlara eriş
            document.querySelectorAll("#fly-btn").forEach((btn)=>{

             const id= +btn.dataset.id

               btn.addEventListener("click",()=>{
                flyToNote(id)
               })
                
            })
}

// her not için bir marker render eden fonk

function renderMarkers(){
    layer.clearLayers()
    notes.map((note)=>{
    
     //eklenecek ikon türüne karar ver

     const icon=getNoteIcon(note.status)

        L.marker(note.coords,{ icon }).addTo(layer).bindPopup(note.title)
    })
}

function deleteNote(id){
const res= confirm("Not Silme İşlemini Onaylıyor musunuz ?")
if(res){
   notes= notes.filter((note)=>note.id!=id)
 
   //Locali güncelle

   localStorage.setItem("notes",JSON.stringify(notes))

   //Notları render et 

renderNotes()
   //markerleri render et
   renderMarkers()
}
}
// markerlara focuslanan fonksiyon
function flyToNote (id){
   const foundedNote= notes.find((note)=>note.id==id)
   
   // Buluna  nota focuslan
   map.flyTo(foundedNote.coords,14)
   
}
// Arrow icon a tıklayınca çalışacak fonk
elements.arroeIcon.addEventListener("click",()=>{
    elements.aside.classList.toggle("hide")
})