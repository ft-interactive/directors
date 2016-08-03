function toggle_visibility(e) 
{
    if (e.target.id == "buttonten"){
    	document.getElementById("top10").className += ' showten';
    } else {
    	document.getElementById("top10").className = document.getElementById("top10").className.replace(/ showten/g,'');
    }
     
}



document.getElementById("buttonten").onclick = toggle_visibility;

document.getElementById("buttonage").onclick = toggle_visibility;