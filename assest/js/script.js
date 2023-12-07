"use strict";

document.addEventListener("DOMContentLoaded", innit);

function innit() {
    document.querySelector('#emailLink').addEventListener("click", function() 
    {const emailText = this.textContent; 
    const tempInput = document.createElement("input"); 
    tempInput.setAttribute("value", emailText);
    document.body.appendChild(tempInput); 
    tempInput.select(); 
    document.execCommand("copy"); 
    document.body.removeChild(tempInput); 
    alert("Email copied to clipboard: " + emailText);});
}
