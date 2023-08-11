let body = document.querySelector("body");
let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modaLCont = document.querySelector(".modal-cont");
let maincont = document.querySelector(".main-ctn");
let textareacont = document.querySelector(".textarea-cont");
let AllpriorityColor = document.querySelectorAll(".priority-color");
let colors = ["lightpink" , "lightblue" , "lightgreen" , "black"];
let modalPriorityColor = colors[colors.length-1]; //default black
let toolboxColors = document.querySelectorAll(".color");
let addFlag = false;
let removeTic = false;
let ticketArr = [];

if(localStorage.getItem("jira_tickets")){
    //retrive and display tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketArr.forEach((ticketobj)=>{
        createTicket(ticketobj.ticketColor , ticketobj.ticketID , ticketobj.ticketTask);
        // here it adds crested ticket in prev code execution in cureent new code in main-cont but not inside array if already present
    })
}

//Listener for modal priority coloring
AllpriorityColor.forEach((colorElem , idx)=>{   //every selected element will come one by one 
    colorElem.addEventListener("click" , (e)=>{
        // removing border from rest color elem which is not clicked by adding or removing border class
        AllpriorityColor.forEach((priColorElem, idx)=>{
            priColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
        // alert(modalPriorityColor);
    })
}) 
addBtn.addEventListener("click", (e)=>{
    //display modale-> generate ticket

    //addFlag true, modale display
    //addFlag false, modale hide
    addFlag = !addFlag;
    if(addFlag){
        modaLCont.style.display = "flex";
    }
    else{
        modaLCont.style.display = "none";
    }
})
removeBtn.addEventListener("click",(e)=>{
    removeTic = !removeTic;
})
body.addEventListener("keydown" , (e)=>{
    // when shift pressed ticke.t will be saved in main-cont(which contains all ticket)
    let key = e.key;
    if(key === "Shift")
    {
        // alert(modalPriorityColor);
        createTicket(modalPriorityColor, undefined, textareacont.value);
        //to remove(hide) modal container after adding
        modaLCont.style.display = "none";
        addFlag = false;
        textareacont.value = "";                                
        // textarea is special format of html element in which we use value attribute and that is set
    }
})
// create ticket when ctrl+enter is clicked and add in main-container
function createTicket(ticketColor , ticketID , ticketTask){
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class" , "ticket-cont");//adds class attr with value ticket-cont in div elem
    ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
        <i class="fa-solid fa-lock"></i>
    </div>
    `;//to write inner html inside parent
    maincont.appendChild(ticketCont);

    //create object of ticket and add to array
    if(!ticketID){
    ticketArr.push({ticketColor , ticketTask , ticketID:id});
    localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
    }

    handleRemoval(ticketCont, ticketID);
    handleLock(ticketCont, ticketID);//adding handle features in every ticket
    // by setting eventListeners for ticket elements which trigger when its clciked
    handleTicketColor(ticketCont, ticketID);
}
function containsTicId(id){
    ticketArr.findIndex((ticketobj)=>{
        if(id === ticketobj.ticketID){
        return true;
        }
        else{
        return false;
        }
    })
    return false;
}

function handleRemoval(ticket, id){
    //removeTic -> true -> remove ticket
    ticket.addEventListener("click",(e)=>{
        if(!removeTic){
            return;
        } 
        let idx = getTicketIdx(id);
        ticketArr.splice(idx,1);//removes 1 element at specified idx
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
        ticket.remove(); //UI removal
    })
}

function handleLock(ticket, id){
    let ticlockElem = ticket.querySelector(".ticket-lock");
    //selects elem from ticketCont instead of from whole document and add feature
    let lockElem = ticlockElem.children[0]; //selects first elem inside specified class containg elem
    // not selecting by .fa-solid as all font-awesome icons has this class
    let ticTaskArea = ticket.querySelector(".task-area");
    lockElem.addEventListener("click", (e)=>{
        //getTicketIdx
        let ticketIdx = getTicketIdx(id);
        if(lockElem.classList.contains("fa-lock")){
        lockElem.classList.remove("fa-lock");
        lockElem.classList.add("fa-lock-open");
        // these values taken from fontawesomr icons
//textarea has special attr contentedarea if its true we can edit else not
        ticTaskArea.setAttribute("contenteditable" , "true");
        }
        else{
            lockElem.classList.remove("fa-lock-open");
            lockElem.classList.add("fa-lock");
            ticTaskArea.setAttribute("contenteditable" , "false");
        }
        //modifying chabges in localStorage
        ticketArr[ticketIdx].ticketTask = ticTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
    
}

function handleTicketColor(ticket, id){
    let ticColorelem = ticket.querySelector(".ticket-color");
    ticColorelem.addEventListener("click", (e)=>{
        //gets ticketIdx from ticketArr so that its corresponding ticket key can be modifies in localStorage
        let ticketIdx = getTicketIdx(id);
        let currentTicColor = ticColorelem.classList[1];
        //get ticket color idx
        let currentTicColorIdx = colors.findIndex((color)=>{
            return currentTicColor === color;
        })
        currentTicColorIdx++;
        let newTicColorIdx = currentTicColorIdx % colors.length;
        let newTicColor = colors[newTicColorIdx];
        ticColorelem.classList.remove(currentTicColor);
        ticColorelem.classList.add(newTicColor);

        //modify changes in localstorage
        ticketArr[ticketIdx].ticketColor = newTicColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));//it will override on new values on keys
    })
}
function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketobj)=>{
        //findIndex calls this func. for each elem in ticketArr here its objects inside array
        return ticketobj.ticketID === id;
    })
    return ticketIdx;
}
//adding filters feature when a particular color is clicked
toolboxColors.forEach((color)=>{
    color.addEventListener("click", (e)=>{
        let currentToolboxcolor = color.classList[0]; //it will give selected color in toolbox
        //we will use array of objects and that object will contain the tickets data
        //best place to make this objects is where ticket is created.
        // let filteredTickets = ticketArr.filter((ticketObj , idx)=>{
        //     return currentToolboxcolor === ticketObj.ticketColor;
        // }) //this will return array of filtered tickets
        
        // //removing all tickets from display and displaying only filtered ticktets
        // let allTicketCont = document.querySelectorAll(".ticket-cont");
        // for(let i=0;i<allTicketCont.length;i++){
        //     allTicketCont[i].remove();
        // }
        // filteredTickets.forEach((ti))
        let allTicket = document.querySelectorAll(".ticket-cont");
        allTicket.forEach((tick)=>{
            if(currentToolboxcolor === tick.children[0].classList[1])
            tick.style.display = "block" //will dispplay only these tickets
            else
            tick.style.display = "none"; //not display this tickets i.e tickets are there in main-ctn but these are not displayed
        })
    })
    color.addEventListener("dblclick", (e)=>{
        let allTicket = document.querySelectorAll(".ticket-cont");
        allTicket.forEach((tick)=>{
            tick.style.display = "block" //will dispplay all created tickets
        })
    })
})
