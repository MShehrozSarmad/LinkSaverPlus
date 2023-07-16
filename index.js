let myLeads = []
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"))
const tabBtn = document.getElementById("tab-btn")
const backupBtn = document.getElementById('backup-btn');
const restoreBtn = document.getElementById('restore-btn');
let delBtn = '';

if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage;
    render(myLeads);
    delBtn = document.querySelectorAll('.del-btn');
}

tabBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        myLeads.push(tabs[0].url)
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    })
})

function render(leads) {
    let listItems = ""
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${leads[i]}'>${leads[i]}</a>
                <button style="background-image: white" class="del-btn">x</button>
            </li>
        `
    }

    ulEl.innerHTML = listItems
}


ulEl.addEventListener("click", (event) => {
    if (event.target.classList.contains("del-btn")) {
        event.preventDefault();
        let toPop = event.target.previousElementSibling.innerText;
        let toPopInd = myLeads.indexOf(toPop);
        myLeads.splice(toPopInd, 1);
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        event.target.parentElement.remove();
    }
});


deleteBtn.addEventListener("dblclick", () => {
    localStorage.removeItem("myLeads");
    myLeads = [];
    render(myLeads);
});

inputBtn.addEventListener("click", () => {
    inputEl.value ? myLeads.push(inputEl.value) : null;
    inputEl.value = ""
    localStorage.setItem("myLeads", JSON.stringify(myLeads))
    render(myLeads)
});

function backupLeads() {
    const jsonData = JSON.stringify(myLeads);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_backup.json'; // Set the filename for the downloaded JSON file
    a.click();
    // Clean up the created URL object after the download link is clicked.
    URL.revokeObjectURL(url);
}


function restoreLeads(){
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // Event listener for changes in the file input element
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            try {
                const leads = JSON.parse(content);
                if (Array.isArray(leads)) {
                    myLeads = leads;
                    localStorage.setItem('myLeads', JSON.stringify(myLeads));
                    render(myLeads);
                } else {
                    console.error('Invalid data format in the JSON file.');
                }
            } catch (error) {
                console.error('Error parsing the JSON file:', error);
            }
        };
        reader.readAsText(file);
    });
    // Trigger the file input dialog when the button is clicked
    fileInput.click();
}

backupBtn.addEventListener('click', backupLeads);
restoreBtn.addEventListener('click', restoreLeads);
