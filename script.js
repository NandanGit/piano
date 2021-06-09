/* Map the keyboard keys with piano keys
 * use the small letters for the first octave and capital letters for the second octave
 */

//////////////////////////// UIFunctions ////////////////////////////
const pianoElement = document.getElementById('piano');
const toggleButtonElement = document.getElementById('toggle-button');
console.log(toggleButtonElement);

function toggleMarkings() {
	pianoElement.classList.toggle('show-notes');
	// Also change the button text
	const buttonInnerHTML = toggleButtonElement.innerHTML.trim();
	if (buttonInnerHTML === 'C#') {
		toggleButtonElement.innerHTML = '<s>C#</s>';
	} else {
		toggleButtonElement.innerHTML = 'C#';
	}
}

////////////////////////////// Events ///////////////////////////////
toggleButtonElement.addEventListener('click', () => {
	toggleButtonElement.disabled = true;
	setTimeout(() => {
		toggleButtonElement.disabled = false;
	}, 250);
	toggleMarkings();
});
