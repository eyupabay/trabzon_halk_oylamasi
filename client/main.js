firebase.initializeApp({
    apiKey: "AIzaSyC-EOMrWoQ4SL6DadPDCmxsRVwLglmKrro",
  authDomain: "trabzon-halk-oylamasi-js.firebaseapp.com",
  databaseURL: "https://trabzon-halk-oylamasi-js-default-rtdb.firebaseio.com",
  projectId: "trabzon-halk-oylamasi-js",
  storageBucket: "trabzon-halk-oylamasi-js.appspot.com",
  messagingSenderId: "329288543990",
  appId: "1:329288543990:web:47ec50f59ee2795cd986d7"
});

const db = firebase.firestore();

let anketSorulari = "Anket Soruları";
let gundemSorusu;

class Poll {
    constructor(root){
        this.root = root;
        this.selected = sessionStorage.getItem("poll-selected");
        this.endpoint = "http://localhost:3000/poll";

        this.getSurveyQuestion().then((surveyQuestion) => {
            this.root.insertAdjacentHTML("afterbegin",`
                <div class="poll__title">${surveyQuestion} </div>
            `);
        });

        this._refresh();
    }

    async getSurveyQuestion() {
        const surveyRef = db.collection(anketSorulari);
        const snapshot = await surveyRef.get();
        const survey = snapshot.docs[0].data();
        return survey.anketSorusu;
    }
    
    async _refresh(){
        
        /* 
        const response = await fetch(this.endpoint);
        const data = await response.json();
        */ 
       const pollRef = db.collection(anketSorulari).doc("wbzgYF9lgT9pehURSf2P").collection("Seçenekler");

        // seceneklerin yapilanOySayisi ' ni da çek
        const snapshot = await pollRef.get();
        const options = [];
        snapshot.forEach((doc) => {
            options.push(doc.data());
        });

        let toplamOySayisi = 0;
        for(const option of options){
            toplamOySayisi += option.yapilanOySayisi
        }

        this.root.querySelectorAll(".poll__option").forEach(option => {
            option.remove();
        });
        
        for(const option of options){
            const template = document.createElement("template");
            const fragment = template.content;
            
            template.innerHTML = `
                <div class="poll__option ${this.selected == option.secenek ? "poll__option--selected" : "" } ">
                    <div class="poll__option-fill"></div>
                    <div class="poll__option-info">
                        <span class="poll__secenek">${ option.secenek }</span>
                        <span class="poll__yuzdelik">%${ (((option.yapilanOySayisi/toplamOySayisi)*100) || 0).toFixed(0) }</span>
                    </div>
                </div>
            `;

            if (!this.selected){
                fragment.querySelector(".poll__option").addEventListener("click" , () => {
                    /* 
                    Anket verilerine oy eklemek için this.endpoint 
                    değişkeninde belirtilen URL'ye POST isteği gönderir. 
                    İstek içerisinde "add" değişkeni ile oy verilen seçenek bilgisi ile birlikte gönderilmektedir. 
                    */
                   
                    fetch(

                        /* 
                        this.endpoint, {
                        method: "post",
                        body: `add=${ option.secenek }`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    },  
                    */
                    
                    // Firebase'e ekleme metodu olarak .update yaptığım için, seçeneklerin önceden eklenmiş olması gerekiyor.
               /*      pollRef2.doc(option.secenek).update({yapilanOySayisi: firebase.firestore.FieldValue.increment(1)})).then(() => {
                        this.selected = option.secenek;

                        
                        // Verilen oylamanın daha sonra da tutulmasını sağlar 
                        
                        sessionStorage.setItem("poll-selected", option.secenek);
                        console.log(`Şu seçenek işaretlenmiştir : ${ p.selected } \nBu bilgi Firebase veritabanına eklenmiştir.`);

                        this._refresh();
 */
                        
                        pollRef.doc(option.secenek).update({yapilanOySayisi: firebase.firestore.FieldValue.increment(1)}).then(() => {
                            this.selected = option.secenek;
    
                            sessionStorage.setItem("poll-selected", option.secenek);
                            console.log(`Şu seçenek işaretlenmiştir : ${ p.selected } \nBu bilgi Firebase veritabanına eklenmiştir.`);
    
                            this._refresh();
                        }))
                });
            }
            fragment.querySelector(".poll__option-fill").style.width = `${ (((option.yapilanOySayisi/toplamOySayisi)*100) || 0).toFixed(0) }%`;
            this.root.appendChild(fragment);
        }
    }
}
const p = new Poll(
    document.querySelector(".poll"),
    gundemSorusu,
);


console.log(p);
/* 
db.collection(anketSorulari).doc(gundemSorusu).collection("Seçenekler").get().then((querySnapshot) => {
    console.log("Firebase verileri okunuyor...");
    let cevaplar = [];

    querySnapshot.forEach((doc) => {
        cevaplar.push({ ...doc.data(), id:doc.id });
        //doc.id dediğimiz şey: dökümana verdiğimiz isim.
    });
    console.log(cevaplar);
    console.log(cevaplar[2].yapilanOySayisi, cevaplar[2].cevap);
});
 */

// Anket Ekleme metodu
const anketEkleme = document.querySelector('.add')
anketEkleme.addEventListener('submit', (e) => {
    e.preventDefault()
    const anketSorusu = anketEkleme.anketSorusu.value;
    let docID = "";
    // Daha sonra bu dökümana girip şıkları eklemek için anketSorusu değişkeni ile tutuyoruz

    db.collection(anketSorulari).add({
        anketSorusu: anketSorusu,
    }).then((docRef) => {
        docID = docRef.id
        anketEkleme.reset()
        // Eklendiği zaman kutucuklardaki yazıları temizler
        console.log("Anket sorusu başarılı bir şekilde eklendi")
        console.log(docID) // Döküman ID'sini tutuyoruz, daha sonra şıklarını da eklemek için.
    })
   // gundemSorusu = anketSorusu;
}) 


// Bulma metodu


/* 
// Silme metodu
const anketSilme = document.querySelector('.delete')
anketSilme.addEventListener('submit', (e) => {
    e.preventDefault()
})
 */

/* db.collection(anketSorulari).doc(gundemSorusu).collection("Seçenekler").get().then((querySnapshot) => {
    console.log("Firebase verileri okunuyor...");
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        console.log(doc.data().yapilanOySayisi);
        console.log(doc.data().cevap);

    });
}); */