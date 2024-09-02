let nav = 0;
let system;
let loader;
let temp;
const pageSet = [];
const currentPage = [];
function System(){
    try{
        this.listen = window.location;
        this.notes = false;
    }catch(e){
        alert("System not deployed!\n\n",e);
    }
}
function Loader(load){
    this.loaded = load;
}
document.addEventListener("DOMContentLoaded",() =>{
    loader = new Loader(true);
    loader.creat();
    loader.remove(2000);
    system = new System();
    system.appendBot();
    system.setUp();
});
function user(){
    try{
        system = new System();
        system.getSideImg();
    }catch(e){
        console.log("menu not found");
    }
}
function navbar_toggle(){
    if(nav==0){
        document.getElementById('side-menu').style.display = "block";
        document.body.style.overflowY = "hidden";
        nav++;
        const nl1 = document.body.addEventListener('scroll', (e)=>{
            e.preventDefault();
            navbar_toggle();
            document.body.removeEventListener(nl1);
        });
    }else{
        document.getElementById('side-menu').style.display = "none";
        document.body.style.overflowY = "auto";
        nav--;
    }
}
Loader.prototype.creat = function(){
    if(loader.loaded!=false){
        const loaderEle = document.createElement('div');
        loaderEle.classList.add("loader");
        loaderEle.innerHTML = `<div class="centerDia"><div class="loading"></div></div>`;
        document.body.appendChild(loaderEle);
    }
}
Loader.prototype.remove = function(time){
    if(time<100){
        return false;
    }
    setTimeout(()=>{
        document.body.removeChild(document.querySelector('.loader'));
        loader.loaded = false;
    },time);
}
System.prototype.setUp = function(){
    try{
        fetch('/varchar').then(response => response.json()).then(data => {
            config = data.valueOf();
        }).catch(error =>{
            console.error('Error: ',error);
        });
        system.VisiblePage();
    }catch(e){
        console.log("Error to set up initials!\n",e);
    }
}
System.prototype.VisiblePage = function(){
    try{
        for(let i=0; i<pageSet.length; i++){
            document.getElementById(pageSet[i]).innerHTML = document.getElementById(pageSet[i]).textContent;
            document.querySelector("#"+pageSet[i]).style.display = "block";
        }
        document.getElementById('side-menu').innerHTML = '<div class="hambarger-menu"><ul class="nav justify-content-end">'+document.getElementById('nav-menu').innerHTML+'</ul></div>';
        system.setActiveMenu(currentPage[currentPage.length-1]);
    }catch(e){
        console.warn("New Problem: ",e);
    }
}
System.prototype.getSideImg = function(){
    setTimeout(() => {
        try{
            document.querySelector('.images').innerHTML = `<img src="../images/property-img2.webp" class="imgslid" id="side-img" alt="load"/>`;
        }catch(e){
            console.log('side-image not found!');
        }
    },60000);
}
function route(link){
    window.location = link;
}
function invaild(){
    alert("Sorry, this feature not avalible in this version,\nTry another one!...");
}
System.prototype.setActiveMenu = function(menuName){
    let navItems, navMenu;
    if(document.querySelector('#side-menu').style.display==''){
        navMenu = document.querySelector('#nav-menu');
        navItems = navMenu.querySelectorAll('.nav-item');
    }else{
        navMenu = document.querySelector('.hambarger-menu');
        navItems = navMenu.querySelectorAll('.nav-item');
    }
    navItems.forEach(item => {
        item.querySelector('.nav-link').classList.remove('active');
    });
    const activeItem = navMenu.querySelector(`.nav-link[href="/${menuName.toLowerCase().replace(' ', '')}"]`);
    if(activeItem){
        activeItem.classList.add('active');
    }else{
        return false;
    }
}
System.prototype.handelPyError = function(error){
    try{
        if(!system.error_layout){
            let temp = config.varchar.error_templet;
            temp = temp.replaceAll('<|error.code|>',error.code);
            temp = temp.replaceAll('<|error.message|>',error.message);
            document.body.innerHTML += temp;
            document.body.style.overflowY = "hidden";
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            system.error_layout = true;
        }else{
            document.body.removeChild(document.getElementById('errorPreview'));
            system.error_layout = false;
            system.handelPyError(error);
        }
    }catch(e){
        console.log(error,e);
    }
}
System.prototype.closePyError = function(){
    document.body.removeChild(document.getElementById('errorPreview'));
    window.location.reload();
}
System.prototype.validLimit = function(limit, values){
    for(let i=0; i<values; i++){
        if(!(values[i] > limit[0] && values[i] < limit[1])){
            return false;
        }
    }
    return true;
}
System.prototype.validOptions = function(options, choosen){
    for(let i=0; i<options.length; i++){
        if(options[i] == choosen){
            return true;
        }
    }
    return false;
}
System.prototype.encodedURI = function(url, key){
    let str = url.toString().toLowerCase();
    for(let i=0; i<config.varchar.hash.length; i++){
        str = str.replaceAll(config.varchar.hash[i][0], config.varchar.hash[i][1]);
    }
    return str.toString();
}
function search_product(data,list){
    let find=miss=0;
    let input = document.getElementById(`${data}`).value;
    input=input.toLowerCase();
    let x = document.getElementsByClassName(`${list}`);
    for(i = 0; i<x.length; i++){ 
        if(!x[i].innerHTML.toLowerCase().includes(input)){
            x[i].style.display="none";
            miss++;
        }else{
            x[i].style.display="list-item";
            find++;
        }
    }
    if(data=='searchSelectList'){
        data='searchData';
    }
    if(miss>find&&find==0&&miss!=0){
        document.getElementById(data+'DOD').style.display="block";
    }else{
        document.getElementById(data+'DOD').style.display="none";
    }
}
System.prototype.downloadCode = function(id,name){
    const textToDownload = document.getElementById(id).textContent;
    // const fileName = "downloaded_file.txt";
    const fileName = `${name}`;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
System.prototype.appendBot = function(){
    try{
        let layout = `<div id="botDiv" ondblclick="system.openNotes();"><i class="fa fa-sticky-note-o"></i></div>`;
        document.body.innerHTML += layout;
        system.moveBot();
    }catch(e){
        console.warn('Note button provide not possible');
    }
}
System.prototype.removeBot = function(){
    try{
        document.getElementById('botDiv').style.display = "none";
    }catch(e){
        console.warn('Note button provide not possible');
    }
}
System.prototype.appendBotCls = function(){
    try{
        const layout = document.createElement('div');
        layout.classList.add("botCln");
        layout.innerHTML = '&times;';
        document.body.appendChild(layout);
    }catch(e){
        console.warn('Note cls button provide not possible');
    }
}
System.prototype.removeBotCls = function(){
    try{
        document.body.removeChild(document.querySelector('.botCln'));
    }catch(e){
        console.warn('Note cls button remove not possible');
    }
}
System.prototype.moveBot = function(){
    constbotDiv = document.getElementById('draggableDiv');
    function startDrag(e){
        e.preventDefault();
        botDiv.style.cursor = 'grabbing';
        if(!system.notes){
            system.appendBotCls();
        }
        const isTouch = e.type === 'touchstart';
        const initialX = isTouch ? e.touches[0].clientX : e.clientX;
        const initialY = isTouch ? e.touches[0].clientY : e.clientY;
        const offsetX = initialX -botDiv.getBoundingClientRect().left;
        const offsetY = initialY -botDiv.getBoundingClientRect().top;
        function moveAt(pageX, pageY){
            const newX = pageX - offsetX;
            const newY = pageY - offsetY;
            // Boundary checks
            const minLeft = 0;
            const maxLeft = window.innerWidth -botDiv.offsetWidth;
            const minTop = 0;
            const maxTop = window.innerHeight -botDiv.offsetHeight;
            const leftPos = Math.min(Math.max(newX, minLeft), maxLeft);
            const topPos = Math.min(Math.max(newY, minTop), maxTop);
            botDiv.style.left = leftPos + 'px';
            botDiv.style.top = topPos + 'px';
            if(topPos>=(maxTop-40) && topPos<=maxTop  && leftPos>=(maxLeft/2)-40 && leftPos<=(maxLeft/2)+40){
                system.removeBot();
            }
        }
        function onMouseMove(event){
            const moveX = isTouch ? event.touches[0].clientX : event.clientX;
            const moveY = isTouch ? event.touches[0].clientY : event.clientY;
            moveAt(moveX, moveY);
        }
        function stopDrag(){
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', stopDrag);
            botDiv.style.cursor = 'grab';
            system.removeBotCls();
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', stopDrag);
    }
    botDiv.addEventListener('mousedown', startDrag);
    botDiv.addEventListener('touchstart', startDrag);
    botDiv.ondragstart = function(){
        return false;
    };
}
System.prototype.openNotes = function(){
    try{
        document.getElementById('botDiv').style.height = "80%";
        document.getElementById('botDiv').style.width = "30%";
        document.getElementById('botDiv').innerHTML = `<div class="noteTab"><div class="option"><span class="btn" onclick="system.minimizeNote();">&minus;</span>
        <span class="btn" onclick="system.removeBot();">&times;</span></div><iframe src="https://kidkrishkode.github.io/NoteBook.github.io/"></iframe></div>`;
        system.notes = true;
    }catch(e){
        console.warn("Note open not possible!");
    }
}
System.prototype.minimizeNote = function(){
    try{
        document.getElementById('botDiv').style.height = "50px";
        document.getElementById('botDiv').style.width = "50px";
        document.getElementById('botDiv').innerHTML = `<i class="fa fa-sticky-note-o"></i>`;
        system.notes = false;
    }catch(e){
        console.warn("Minimize note tab not possible!");
    }
}