'use strict';

// Read grubs list
const grubsForm = document.getElementById("grubsForm");
const grubsFileInput = document.getElementById("grubsFile");
const grubsButton = document.getElementById("grubsButton");
const grubsListError = document.getElementById("grubsListError");
const grubsListOutput = document.getElementById("grubsListOutput");

grubsForm.addEventListener("submit", (ev) => { ev.preventDefault(); });

function makeLi(grub, replacement) {
  const newLi = document.createElement("li");
  const newContent = document.createTextNode(`${grub} → ${replacement}`);
  newLi.appendChild(newContent);
  return newLi;
}

function getGrubsList(cb) {
  if (grubsFileInput.files.length === 1) {
    const reader = new FileReader();
    reader.readAsText(grubsFileInput.files[0], "UTF-8");
    reader.onload = function (evt) {
      try {
        const grubs = JSON.parse(evt.target.result);
        grubsListError.textContent = "";
        grubsListOutput.textContent = "";
        for (const grub in grubs) {
          grubsListOutput.appendChild(makeLi(grub, grubs[grub]));
        }
        cb(grubs);
      }
      catch (e) {
        grubsListOutput.textContent = "";
        grubsListError.textContent = e;
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

function updateGrubsUl() {
  getGrubsList(() => {});
}

grubsButton.onclick = updateGrubsUl;

// Splits file edit
const splitsForm = document.getElementById("splitsForm");
const splitsFileInput = document.getElementById("splitsFile");
const renameButton = document.getElementById("renameButton");

splitsForm.addEventListener("submit", (ev) => { ev.preventDefault(); });

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

function donwloadSplitsFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const fileURL = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = fileURL;
  element.download = filename;
  element.click();
  URL.revokeObjectURL(fileURL);
}

renameButton.onclick = (_) => {
  if (splitsFileInput.files.length === 1) {
    const reader = new FileReader();
    const splitsFile = splitsFileInput.files[0];
    reader.readAsText(splitsFile, "UTF-8");
    reader.onload = function (evt) {
      replaceAll(evt.target.result, (text) => {
        donwloadSplitsFile(splitsFile.name, text);
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