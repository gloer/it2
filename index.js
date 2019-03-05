const main = document.querySelector("main");

const db = firebase.database();
const forslagene = db.ref("losningsforslag");


function visForslag(snap) {
    console.log("SNAP");
    const data = snap.val();
    main.innerHTML = `
        <article>
            <a href="${data.url}">
                <p class="small">${data.oppgave}</p>
                <p class="big">${data.tittel}</p>
                <p class="small">løst av</p>
                <p class="big">${data.forfatter}</p>
                <p class="small right">Les mer</p>
                <img src="${data.userphoto}">
            </a>
        </article>
    ` + main.innerHTML;

}


forslagene.on("child_added", visForslag);
