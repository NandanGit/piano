/* Map the keyboard keys with piano keys
 * use the small letters for the first octave and capital letters for the second octave
 */

// DOM Elements
const pianoHeading = document.getElementById('piano-heading');
const pianoControls = document.getElementById('piano-controls');
const pianoElement = document.getElementById('piano');
const toggleButtonElement = document.getElementById('toggle-button');
const dampingTimeRangeElement = document.getElementById('damping-time');
const dampDurationViewElement = document.getElementById('damp-duration-view');
const firstOctaveSelectorElement = document.getElementById('octave-1-selector');
const secondOctaveSelectorElement =
	document.getElementById('octave-2-selector');

const firstOctaveViewElement = document.getElementById('octave-1-view');
const secondOctaveViewElement = document.getElementById('octave-2-view');
const firstOctaveKeysViewElements =
	document.querySelectorAll('.octave-1-number');
const secondOctaveKeysViewElements =
	document.querySelectorAll('.octave-2-number');
const waveSelectorElement = document.getElementById('wave-forms');
// console.log(firstOctaveKeysViewElements, secondOctaveKeysViewElements);

// States and Maps
// const l = 1

//////////////////////////////////////////////// UIFunctions ////////////////////////////////////////////////
const UI = (function () {
	return {
		toggleMarkings() {
			pianoElement.classList.toggle('show-notes');
			// Also change the button text
			const buttonInnerHTML = toggleButtonElement.innerHTML.trim();
			if (buttonInnerHTML === 'C#') {
				toggleButtonElement.innerHTML = '<s>C#</s>';
			} else {
				toggleButtonElement.innerHTML = 'C#';
			}
		},
		toggleWaveSelector() {
			waveSelectorElement.classList.toggle('show');
		},
		pressNoteOnScreen(note, duration) {
			// duration should be in milliseconds
			const noteKeyElement = document.getElementById(note);
			// console.log(noteKeyElement);
			// Add active class to the key
			noteKeyElement.classList.add('active');

			if (duration) {
				setTimeout(() => {
					noteKeyElement.classList.remove('active');
					// o.stop();
				}, duration);
			}
			// return noteKeyElement;
		},
		updateDampDuration(newDampDuration) {
			// console.log(dampDurationViewElement.localName);
			if (dampDurationViewElement.localName === 'input') {
				dampDurationViewElement.value = +newDampDuration;
			} else {
				dampDurationViewElement.innerHTML = +newDampDuration;
			}
			dampingTimeRangeElement.value = +newDampDuration;
		},
		updateOctaveView(octaveViewNumber, newOctaveValue) {
			// octaveViewNumber = 1 or 2
			if (octaveViewNumber === 1) {
				firstOctaveViewElement.innerHTML = +newOctaveValue;
			} else {
				secondOctaveViewElement.innerHTML = +newOctaveValue;
			}
		},
		updateOctaveNumbersOnKeys(octaveViewNumber, newOctaveValue) {
			let targets;
			if (octaveViewNumber === 1) {
				targets = firstOctaveKeysViewElements;
			} else {
				targets = secondOctaveKeysViewElements;
			}
			targets.forEach((target) => {
				target.innerHTML = newOctaveValue;
			});
		},
	};
})();

//////////////////////////////////////// State Management and Logic /////////////////////////////////////////
const notesToFrequencyMap = {
	// Note --> Frequencies (all octaves)
	'note-c-': [16.35, 32.7, 65.41, 130.8, 261.6, 523.3, 1047, 2093, 4186],
	'note-c-sharp-': [17.32, 34.65, 69.3, 138.6, 277.2, 554.4, 1109, 2217, 4435],
	'note-d-': [18.35, 36.71, 73.42, 146.8, 293.7, 587.3, 1175, 2349, 4699],
	'note-d-sharp-': [19.45, 38.89, 77.78, 155.6, 311.1, 622.3, 1245, 2489, 4978],
	'note-e-': [20.6, 41.2, 82.41, 164.8, 329.6, 659.3, 1319, 2637, 5274],
	'note-f-': [21.83, 43.65, 87.31, 174.6, 349.2, 698.5, 1397, 2794, 5588],
	'note-f-sharp-': [23.12, 46.25, 92.5, 185, 370, 740, 1480, 2960, 5920],
	'note-g-': [24.5, 49, 98, 196, 392, 784, 1568, 3136, 6272],
	'note-g-sharp-': [25.96, 51.91, 103.8, 207.7, 415.3, 830.6, 1661, 3322, 6645],
	'note-a-': [27.5, 55, 110, 220, 440, 880, 1760, 3520, 7040],
	'note-a-sharp-': [29.14, 58.27, 116.5, 233.1, 466.2, 932.3, 1865, 3729, 7459],
	'note-b-': [30.87, 61.74, 123.5, 246.9, 493.9, 987.8, 1976, 3951, 7902],
};
const context = new AudioContext();
const pianoState = (function () {
	return {
		currentOctaves: [4, 5],
		isOctavesInSync: true,
		waveType: 'sine',
		preferablePastNKeys: [
			'note-a-1',
			'note-a-1',
			'note-b-1',
			'note-a-1',
			'note-d-2',
			'note-c-2',
		],
		pastNKeys: [],
		activeNotes: [],
		keyPressDuration: 250, //ms
		bringDownDuration: 50,
		keySoundDampDuration: 1000, //ms
		changeKeySoundDampDuration(newDampDuration) {
			this.keySoundDampDuration = newDampDuration;
		},
		updatePastNKeys(noteID) {
			if (this.pastNKeys.length === this.preferablePastNKeys.length) {
				this.pastNKeys.shift();
			}
			this.pastNKeys.push(noteID);
			return (
				JSON.stringify(this.pastNKeys) ===
				JSON.stringify(this.preferablePastNKeys)
			);
		},
	};
})();

// Mapping keys to notes
const keyMap = {
	// Natural notes of first octave
	z: 'note-c-1',
	x: 'note-d-1',
	c: 'note-e-1',
	v: 'note-f-1',
	b: 'note-g-1',
	n: 'note-a-1',
	m: 'note-b-1',
	// Sharp/Flats of first octave
	s: 'note-c-sharp-1',
	d: 'note-d-sharp-1',
	g: 'note-f-sharp-1',
	h: 'note-g-sharp-1',
	j: 'note-a-sharp-1',

	// Natural notes of second octave
	Z: 'note-c-2',
	X: 'note-d-2',
	C: 'note-e-2',
	V: 'note-f-2',
	B: 'note-g-2',
	N: 'note-a-2',
	M: 'note-b-2',
	// Sharp/Flats of second octave
	S: 'note-c-sharp-2',
	D: 'note-d-sharp-2',
	G: 'note-f-sharp-2',
	H: 'note-g-sharp-2',
	J: 'note-a-sharp-2',
};

// const frequencyMap = {
// 	// Note --> Frequency
// 	'note-c-1': 261.6,
// 	'note-c-sharp-1': 277.2,
// 	'note-d-1': 293.7,
// 	'note-d-sharp-1': 311.1,
// 	'note-e-1': 329.6,
// 	'note-f-1': 349.2,
// 	'note-f-sharp-1': 370.0,
// 	'note-g-1': 392.0,
// 	'note-g-sharp-1': 415.3,
// 	'note-a-1': 440.0,
// 	'note-a-sharp-1': 466.2,
// 	'note-b-1': 493.9,
// };

const Logic = (function () {
	return {
		playSound(noteID) {
			if (pianoState.updatePastNKeys(noteID)) {
				UI.toggleWaveSelector();
			}
			const octaveNumber = +noteID[noteID.length - 1];
			// console.log(octaveNumber);
			const o = context.createOscillator();
			o.type = pianoState.waveType;
			const g = context.createGain();
			o.connect(g);
			g.connect(context.destination);
			o.frequency.value =
				notesToFrequencyMap[noteID.slice(0, noteID.length - 1)][
					pianoState.currentOctaves[octaveNumber - 1]
				];
			o.start(0);
			g.gain.exponentialRampToValueAtTime(
				0.00001,
				context.currentTime + pianoState.keySoundDampDuration / 1000
			);
		},
	};
})();

////////////////////////////////////////////////// Events ///////////////////////////////////////////////////
toggleButtonElement.addEventListener('click', () => {
	toggleButtonElement.disabled = true;
	setTimeout(() => {
		toggleButtonElement.disabled = false;
	}, 250);
	UI.toggleMarkings();
});

document.addEventListener('keypress', (event) => {
	const character = event.key;
	const noteID = keyMap[character];
	if (!noteID) {
		return console.log('Invalid key!!');
	}
	UI.pressNoteOnScreen(noteID, pianoState.keyPressDuration);
	// console.log(frequencyMap[noteID]);
	// Oscillator

	Logic.playSound(noteID);
});

// To change the damping of the notes from range
dampingTimeRangeElement.addEventListener('input', (event) => {
	const newDampingValue = +event.target.value;
	// console.log(newDampingValue);
	pianoState.changeKeySoundDampDuration(newDampingValue);
	UI.updateDampDuration(newDampingValue);
});

// To change the damping of the notes from number input(if exists)
if (dampDurationViewElement.localName === 'input') {
	dampDurationViewElement.addEventListener('change', (event) => {
		const newDampingValue = +event.target.value;
		// console.log(newDampingValue);
		pianoState.changeKeySoundDampDuration(newDampingValue);
		UI.updateDampDuration(newDampingValue);
	});
}

// To change the first Octave
firstOctaveSelectorElement.addEventListener('input', (event) => {
	const newOctaveValue = +event.target.value;
	// Write the logic later
	pianoState.currentOctaves[0] = newOctaveValue;
	// Restrict the other octave range accordingly
	// secondOctaveSelectorElement.setAttribute('min', newOctaveValue + 1);
	if (pianoState.isOctavesInSync) {
		pianoState.currentOctaves[1] = newOctaveValue + 1;
		secondOctaveSelectorElement.value = newOctaveValue + 1;
		UI.updateOctaveView(2, newOctaveValue + 1);
		UI.updateOctaveNumbersOnKeys(2, newOctaveValue + 1);
	}

	// update the UI
	UI.updateOctaveView(1, newOctaveValue);
	UI.updateOctaveNumbersOnKeys(1, newOctaveValue);
});

secondOctaveSelectorElement.addEventListener('input', (event) => {
	const newOctaveValue = +event.target.value;
	// Write the logic later
	pianoState.currentOctaves[1] = newOctaveValue;
	// Restrict the other octave range accordingly
	// firstOctaveSelectorElement.setAttribute('max', newOctaveValue - 1);
	if (pianoState.isOctavesInSync) {
		pianoState.currentOctaves[0] = newOctaveValue - 1;
		firstOctaveSelectorElement.value = newOctaveValue - 1;
		UI.updateOctaveView(1, newOctaveValue - 1);
		UI.updateOctaveNumbersOnKeys(1, newOctaveValue - 1);
	}

	// update the UI
	UI.updateOctaveView(2, newOctaveValue);
	UI.updateOctaveNumbersOnKeys(2, newOctaveValue);
});

// To change the wave form of piano
waveSelectorElement.addEventListener('change', (event) => {
	const waveType = event.target.value.trim().toLowerCase();
	if (!['sine', 'triangle', 'square', 'sawtooth'].includes(waveType)) {
		return console.log('Not gonna happen');
	}
	pianoState.waveType = waveType;
});

var inactivityTime = () => {
	var time;
	window.onload = resetTimer;
	// DOM Events
	document.onmousemove = resetTimer;
	//document.onkeydown = resetTimer;

	function hideControls() {
		console.log('Inactivity');
		pianoControls.classList.add('hide');
		pianoHeading.classList.add('hide');
	}

	function unHideControls() {
		console.log('Activity');
		pianoControls.classList.remove('hide');
		pianoHeading.classList.remove('hide');
	}

	function resetTimer() {
		clearTimeout(time);
		unHideControls();
		time = setTimeout(hideControls, 3000);
		// 1000 milliseconds = 1 second
	}
};
window.onload = inactivityTime;
