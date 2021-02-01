// Macros to make composing easier!

//      Note  Frequency
#define R     0
#define C4    262
#define D4    294
#define E4    329
#define F4    349
#define G4    392
#define A4    440
#define BB4   466
#define B4    493
#define C5    523
#define D5    587
#define E5    659
#define F5    698

//      Name     Duration (ms)
#define DUBREAK  50             // insert a break between notes
#define DU16     62             // sixteenth note
#define DU8      125            // eighth note
#define DU8_16   187            // eighth + sixteenth note slur
#define DU4      250            // quarter note

// arduino setup globals
const unsigned short buttonPin = 2;
const unsigned short buzzerPin = 8;

// arduino state globals
int buttonState = 0;
int lastButtonState = 0;
bool playSong = false;

// index of current note in the song - start from the beginning!
int currentNote = 0;

// hard coding the # of notes. each number represents two measures
unsigned short nNotes = 12 + 12 + 11 + 12 + 14 + 12 + 16 + 11 + 12 + 10;

// the notes in the song. each line is approximately a measure
unsigned short songNotes[] = {
  // 1
  C5, C5, BB4, C5, G4, G4,
  C5, F5, E5, C5, R, R,
  // 3
  C5, C5, BB4, C5, G4, G4,
  C5, F5, E5, C5, R, C4,
  // 5
  C4, C4, C4, E4, E4, E4,
  G4, G4, E5, D5, C5,
  // 7
  C5, C5, BB4, C5, G4, G4,
  C5, F5, E5, C5, R, C4,
  // 9
  C4, C4, C4, E4, E4, E4, E4,
  G4, G4, G4, G4, E5, D5, C5,
  // 11
  C5, C5, BB4, C5, G4, G4,
  C5, F5, E5, C5, C5, C5,
  //13
  D5, D5, D5, D5, C5, C5, C5, C5,
  B4, B4, B4, B4, A4, A4, A4, G4,
  //15
  G4, F4, G4, D4, D4,
  G4, C5, B4, G4, R, D5,
  //17
  D5, D5, C5, C5, C5,
  B4, B4, B4, B4, A4, B4, G4,
  //19
  C5, BB4, C5, G4, G4,
  C5, F5, E5, C5, R

};

// the note durations in the song. each line is approximately a measure
short noteDurations[] = {
  // 1
  DU8, DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4, DU8,
  // 3
  DU8, DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4, DU4,
  // 5
  DU8, DU8, DU8, DU4, DU8, DU8,
  DU4, DU8, DU4, DU8, DU4,
  // 7
  DU8, DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4, DU4,
  // 9
  DU8, DU8, DU8, DU8, DU8, DU8, DU8,
  DU8, DU8, DU8, DU8, DU8, DU8, DU4,
  // 11
  DU8, DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4, DU8,
  // 13
  DU8, DU8, DU8, DU8, DU8, DU8, DU8, DU8,
  DU8, DU8, DU8, DU8, DU8, DU8, DU8, DU4,
  // 15
  DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4, DU4,
  // 17
  DU8, DU4, DU8,  DU4,  DU4,
  DU8, DU8, DU4,  DU8_16, DU16, DU16, DU4,
  // 19
  DU8, DU8, DU4, DU4, DU8,
  DU8, DU8, DU8, DU4, DU4
  
};


void setup() {
  pinMode(buttonPin, INPUT);
}


void loop() {
  lastButtonState = buttonState;
  buttonState = digitalRead(buttonPin);

  // button will toggle song on (if it's not playing) and off (if it's playing)
  if (buttonState != lastButtonState) {
    // toggle state on high
    if (buttonState == HIGH) {
      playSong = not playSong;
    }

    // delay to ensure intended state is recorded
    delay(DUBREAK);
  }

  // play the song!
  if (playSong) {
    tone(buzzerPin, songNotes[currentNote], noteDurations[currentNote]);
    delay(DU4);
    currentNote = currentNote + 1;
    if (currentNote == nNotes) {
      playSong = false;
    }
  }

  // don't play the song!
  else {
    currentNote = 0;
  }

}
