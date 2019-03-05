// HTML-elementer:
const selAar = document.querySelector("#selAar");
const inpTittel = document.querySelector("#inpTittel");
const inpURL = document.querySelector("#inpURL");
const skjemaProsjekt = document.querySelector("#skjemaProsjekt");
const mineGamle = document.querySelector("#mineGamle");
const btnEdit = document.querySelector("#btnEdit");
const btnSubmit = document.querySelector("#btnSubmit");




const db = firebase.database();
const losningsforslag = db.ref("losningsforslag");

let valgtForslag;

// Editor
let editor;
BalloonEditor
        .create( document.querySelector( '#editor' ) )
        .then( newEditor => {
            editor = newEditor;
        })
        .catch( error => {
            console.error( error );
        } );

// Definerer en bruker
let user;

// Sjekker om vi er logget inn
firebase.auth().onAuthStateChanged( newuser => {
    if (newuser) {
        // Setter user til den innloggede brukeren
        user = newuser;
        // Event Listeners
        // Vise frem lagrede prosjekter for denne brukeren
        skjemaProsjekt.addEventListener("submit", lagreForslag);        
        losningsforslag.on("child_added", visMineForslag);        
    } else {
        /*
        document.body.innerHTML = `
            <main class="notloggedin>
                <h1>Du er ikke logget inn</h1>
                <a href="login.html">Logg inn her</a>
            </main>            
        `;
        */
       window.location.href = "../index.html";
    }
});

function lagreForslag(evt) {
    evt.preventDefault();
    console.log("LAGRER FORSLAG");

    losningsforslag.push({
        tittel: inpTittel.value,
        tittel_caps: (inpTittel.value).toUpperCase(),
        oppgave: selAar.value,
        aar: selAar.options[selAar.selectedIndex].dataset.aar,
        maaned: selAar.options[selAar.selectedIndex].dataset.maaned,
        tid: firebase.database.ServerValue.TIMESTAMP,
        uid: user.uid,
        beskrivelse: editor.getData(),
        url: inpURL.value,
        forfatter: user.displayName,
        userphoto: user.photoURL
    });

    skjemaProsjekt.reset();
    editor.setData("");
    kopierTittel();
}

function visMineForslag(snap) {
    const key = snap.key;
    const data = snap.val();

    // Viser kun mine løsninger
    if(data.uid === user.uid) {
        mineGamle.innerHTML += `
            <div id="${key}">
                <p>${data.oppgave}</p>
                <p><a href="${data.url}" target="_blank">${data.tittel}</a></p>
                <div class="klikkbar" onclick="endre('${key}')">Endre</div>
                <div class="klikkbar" onclick="slett('${key}')">Slette</div>
            </div>
        `;
    }

}

function endre(key) {
    const losning = losningsforslag.child(key);
    const valgene = Array.from(selAar.options);

    btnEdit.classList.remove("usynlig");
    btnSubmit.classList.add("usynlig");

    selAar.disabled = true;
    
    console.log(valgene);
    losning.on("value", snap => {        
        const key = snap.key;
        const data = snap.val();
        const indeks = (valgene.find(valg => valg.value === data.oppgave)).index;
        selAar.selectedIndex = indeks;
        inpTittel.value = data.tittel;        
        inpURL.value = data.url;
        editor.setData(data.beskrivelse);

        btnEdit.addEventListener("click", () => {
            console.log("HALLO");
            const forslag = losningsforslag.child(key);
            const element = document.getElementById(key);
            console.log(inpTittel.value);
            console.log(forslag);
            forslag.update({
                tittel: inpTittel.value,
                url: inpURL.value,
                beskrivelse: editor.getData()
            });

            // Kjlører en oppdatering til slutt
            document.location.href = "manage.html";

        });

    });
}


function slett(key) {
    const losning = losningsforslag.child(key);
    losning.remove();

    // Fjerner HTML-element
    const element = document.getElementById(key);
    mineGamle.removeChild(element);

}

// Fyller inn tittel fra valgboksen
function kopierTittel() {
    const valgt = selAar.options[selAar.selectedIndex];    
    inpTittel.value = valgt.dataset.tittel;
}

selAar.addEventListener("change", kopierTittel);

kopierTittel();



