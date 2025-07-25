'use strict';

document.getElementById("grubsForm").addEventListener("submit", (ev) => { ev.preventDefault(); });
document.getElementById("splitsForm").addEventListener("submit", (ev) => { ev.preventDefault(); });

function donwloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const fileURL = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = fileURL;
  element.download = filename;
  element.click();
  URL.revokeObjectURL(fileURL);
}

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

// Splits file edit
const splitsFileInput = document.getElementById("splitsFile");
const renameButton = document.getElementById("renameButton");

function replaceOne(text, grub, replacement) {
  // <Name>(4/46) Basin Wings</Name>
  return text.replace(new RegExp(`\\<Name\\>(\\(\\d{1,2}\\/46\\) )?${grub}\\<\\/Name\\>`), `<Name>$1${replacement}</Name>`);
}

function replaceAll(text, cb) {
  getGrubsList((grubsList) => {
    for (const grub in grubsList) {
      text = replaceOne(text, grub, grubsList[grub]);
    }
    cb(text);
  });
}

renameButton.onclick = (_) => {
  if (splitsFileInput.files.length === 1) {
    const reader = new FileReader();
    const splitsFile = splitsFileInput.files[0];
    reader.readAsText(splitsFile, "UTF-8");
    reader.onload = function (evt) {
      replaceAll(evt.target.result, (text) => {
        donwloadFile(splitsFile.name, text, 'text/plain');
      });
    }
    reader.onerror = function (_) {
      alert("Error reading splits file");
    }
  }
  else {
    alert("Select a splits file")
  }
};
