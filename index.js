'use strict';

document.getElementById("grubsForm").addEventListener("submit", (ev) => { ev.preventDefault(); });
document.getElementById("splitsForm").addEventListener("submit", (ev) => { ev.preventDefault(); });
document.getElementById("addGrubForm").addEventListener("submit", (ev) => { ev.preventDefault(); });

function donwloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const fileURL = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = fileURL;
  element.download = filename;
  element.click();
  URL.revokeObjectURL(fileURL);
}

// Grubs select list
const allGrubs = [
  "Hive Internal",
  "Crystal Peaks Spikes",
  "Crossroads Wall",
  "Fungal Spore Shroom",
  "Queen's Gardens Upper",
  "Queen's Gardens Below Stag",
  "Fungal Bouncy",
  "Greenpath Vessel Fragment",
  "Crystal Peaks Crown",
  "Sanctum Fake Dive",
  "Crystal Peaks Crushers",
  "City Guard House",
  "City Spire",
  "Ismas",
  "Crossroads Acid",
  "Crossroads Guarded",
  "Crystalized Mound",
  "Baldur Shell",
  "Crystal Peaks Crystal Heart",
  "Crystal Peaks Bottom Lever",
  "Kingdom's Edge Center",
  "Hwurmps",
  "White Lady",
  "Resting Grounds Crypts",
  "Waterways Center",
  "Greenpath Hunter",
  "Deepnest Dark",
  "Deepnest Nosk",
  "Deepnest Beasts Den",
  "Kingdom's Edge Oro",
  "Deepnest Mimics",
  "Collector Grubs",
  "City Below Sanctum",
  "Greenpath Cornifer",
  "Deepnest Spikes",
  "Crossroads Vengefly",
  "Fog Canyon Archives",
  "Hive External",
  "City Below Love Tower",
  "Basin Wings",
  "Basin Dive",
  "Greenpath Moss Knight",
  "Crystal Peaks Mimic",
  "Crossroads Spikes",
];
const grubSelect = document.getElementById("grubSelect");

function makeOptions() {
  grubSelect.textContent = "";
  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select grub";
  grubSelect.appendChild(defaultOption);

  for (const grub of allGrubs) {
    // <option value="1">One</option>
    const newOption = document.createElement("option");
    newOption.textContent = grub;
    newOption.value = grub;
    grubSelect.appendChild(newOption);
  }
}
makeOptions();

// Shared grublist
const grubsListOutput = document.getElementById("grubsListOutput");
let grublist = {};

function makeLi(grublist, grub) {
  const replacement = grublist[grub];
  const newLi = document.createElement("li");
  // text
  const text = document.createElement("span");
  text.textContent = `${grub} → ${replacement}`;
  text.classList.add("me-2");
  newLi.appendChild(text);
  // button
  const btn = document.createElement("button");
  btn.classList.add("btn");
  btn.classList.add("btn-sm");
  btn.classList.add("btn-secondary");
  btn.innerHTML = '×';
  btn.onclick = () => { delete grublist[grub]; redrawGrublist() };
  newLi.appendChild(btn);
  return newLi;
}

function redrawGrublist() {
  grubsListOutput.textContent = "";
  for (const grub in grublist) {
    grubsListOutput.appendChild(makeLi(grublist, grub));
  }
  console.log(grublist);
}

// Read grubs list
const grubsFileInput = document.getElementById("grubsFile");
const grubsButton = document.getElementById("grubsButton");
const grubsListError = document.getElementById("grubsListError");

function getGrubsList(cb) {
  if (grubsFileInput.files.length === 1) {
    const reader = new FileReader();
    reader.readAsText(grubsFileInput.files[0], "UTF-8");
    reader.onload = function (evt) {
      try {
        grublist = JSON.parse(evt.target.result);
        grubsListError.textContent = "";
        redrawGrublist()
        cb(grublist);
      }
      catch (e) {
        grubsListError.textContent = e;
        grublist = {};
        redrawGrublist();
      }
    }
    reader.onerror = function (_) {
      alert("Error reading grubs file");
    }
  }
  else {
    alert("Select a grubs file")
  }
}

grubsButton.onclick = () => { getGrubsList(() => { }) };

// Download new grub list
const grubsButtonDwld = document.getElementById("grubsButtonDwld");
grubsButtonDwld.onclick = () => {
  donwloadFile("grubs.json", JSON.stringify(grublist, null, 2), 'application/json');
};

// Add new grub rename
const grubRenameText = document.getElementById("grubRenameText");
const addGrubRenameButton = document.getElementById("addGrubRenameButton");
addGrubRenameButton.onclick = () => {
  // Reselect none
  // grubSelect
  console.log(grubSelect.value, grubRenameText.value);
  grublist[grubSelect.value] = grubRenameText.value;
  redrawGrublist();
  grubRenameText.value = "";
};


// Splits file edit
const splitsFileInput = document.getElementById("splitsFile");
const renameButton = document.getElementById("renameButton");

function replaceOne(text, grub, replacement) {
  // <Name>(4/46) Basin Wings</Name>
  return text.replace(new RegExp(`\\<Name\\>(\\(\\d{1,2}\\/46\\) )?${grub}\\<\\/Name\\>`), `<Name>$1${replacement}</Name>`);
}

renameButton.onclick = (_) => {
  if (splitsFileInput.files.length === 1) {
    const reader = new FileReader();
    const splitsFile = splitsFileInput.files[0];
    reader.readAsText(splitsFile, "UTF-8");
    reader.onload = function (evt) {
      let text = evt.target.result;
      for (const grub in grublist) {
        text = replaceOne(text, grub, grublist[grub]);
      };
      donwloadFile(splitsFile.name, text, 'text/plain');
    }
    reader.onerror = function (_) {
      alert("Error reading splits file");
    }
  }
  else {
    alert("Select a splits file")
  }
};
