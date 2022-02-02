function getAllCards() {
    let cards = document.getElementsByClassName("card");
    let videogames = [];
    for (let card of cards) {
        let videogame = {};
        videogame.img = card.children[0].children[0].getAttribute("src");
        videogame.name = card.children[1].children[0].children[0].innerHTML;
        videogame._id = card.children[1].children[0].children[1].innerHTML;
        // videogame.genre = card.children[1].children[1].innerHTML;
        videogame.score = card.children[1].children[1].children[0].innerHTML;


        videogames.push(videogame);
    }
    return videogames;
}

let myForm = document.getElementById('myForm');
let searchTerm = document.getElementById('searchTerm');
let searchResult = document.getElementById('search-result');
let errorDiv = document.getElementById('error');
let noResult = document.getElementById("no-result");


let videoGames = getAllCards();
if (myForm) {
    myForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (searchTerm.value && searchTerm.value.trim().length != 0) {
            errorDiv.hidden = true;
            noResult.hidden = true;

            let videoGames = getAllCards();
            let arr = []
            for (let i of videoGames) {
                if (i.name.toLocaleLowerCase().includes(searchTerm.value.toLocaleLowerCase())) {
                    arr.push(i);
                };
            };
            if (arr.length > 0) {
                for (let i of arr) {
                    if (searchResult.firstElementChild) {
                        searchResult.removeChild(searchResult.firstElementChild)
                    };
                    const div = document.createElement('div');
                    div.className = "result-card";
                    div.innerHTML = `<div class="videogame-img">
                        <img src="${i.img}" href="/videogames/${i._id}" title=${i.name}>
                    </div>
                    <div class="videogame-text">
                        <div class="name">
                            <a href="/videogames/${i._id}" title="Click to learn more" alt="${i.name}">${i.name}</a>
                        </div>
                        <div class="score">
                            <p> ${i.score}</p>
                        </div>
                    </div>`
                    searchResult.append(div);
                    searchResult.hidden = false;
                }
                myForm.reset();
                searchTerm.focus();
            } else {
                noResult.hidden = false;
                myForm.reset();
                searchTerm.focus();
                if (searchResult.firstElementChild) {
                    searchResult.removeChild(searchResult.firstElementChild)

                }
                searchResult.hidden = true;
            }
        } else {
            noResult.hidden = true;
            errorDiv.hidden = false;
            errorDiv.innerHTML = "Input can not be empty!!!";
            myForm.reset();
            searchTerm.focus();
            if (searchResult.firstElementChild) {
                searchResult.removeChild(searchResult.firstElementChild)

            }
            searchResult.hidden = true;
        }
    })
};

function ascendingSort() {
    let videoGames = getAllCards();
    let sortedVideoGames = sortAscending(videoGames)
    console.log(sortedVideoGames)
    let videogameList = document.getElementById("videogame-list");
    while (videogameList.hasChildNodes()) {
        videogameList.removeChild(videogameList.firstChild)
    }
    for (let vd of sortedVideoGames) {
        const div = document.createElement('div');
        div.className = "card";
        div.innerHTML = `<div class="videogame-img" title=${vd.name}>
        <img src="${vd.img}" >
    </div>
    <div class="videogame-text">
        <div class="name">
            <a href="/videogames/${vd._id}" title="Click to learn more">${vd.name}</a>
            <span hidden>${vd._id}</span>
        </div>
        <div class="score">
            <p> ${vd.score}</p>
        </div>
    </div>`

        videogameList.append(div);
    }
}

function descendingSort() {
    let videoGames = getAllCards();
    let sortedVideoGames = sortDescending(videoGames);
    console.log(sortedVideoGames);
    let videogameList = document.getElementById("videogame-list");
    while (videogameList.hasChildNodes()) {
        videogameList.removeChild(videogameList.firstChild)
    }
    for (let vd of sortedVideoGames) {
        const div = document.createElement('div');
        div.className = "card";
        div.innerHTML = `<div class="videogame-img" title=${vd.name}>
        <img src="${vd.img}" >
    </div>
    <div class="videogame-text">
        <div class="name">
            <a href="/videogames/${vd._id}" title="Click to learn more">${vd.name}</a>
            <span hidden>${vd._id}</span>
        </div>
        <div class="score">
            <p> ${vd.score}</p>
        </div>
    </div>`
        videogameList.append(div);
    }
}

function sortDescending(arr) {

    for (let i of arr) {
        i.score = parseFloat(i.score);
    }
    arr.sort((a, b) => -1 * (a.score - b.score));
    return arr;
}

function sortAscending(arr) {

    for (let i of arr) {
        i.score = parseFloat(i.score);
    }
    arr.sort((a, b) => a.score - b.score);
    return arr;
}