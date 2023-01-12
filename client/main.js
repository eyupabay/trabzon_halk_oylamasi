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

var anketSorulari = "Anket Soruları";
var gundemSorusu = "Memnun musunuz?";
/* var soruSecenekleri = [
    "Evet",
    "Hayır",
    "Bilmiyorum"
];
 */
class Poll {
    constructor(root, title){
        this.root = root;
        this.selected = sessionStorage.getItem("poll-selected");
        this.endpoint = "http://localhost:3000/poll";

        this.root.insertAdjacentHTML("afterbegin",`
            <div class="poll__title">${title} </div>
        `);

        this._refresh();
    }
    /* async addQuestion(question, options) {
        const response = await fetch(`${this.endpoint}/questions`, {
          method: 'post',
          body: JSON.stringify({
            question: question,
            options: options
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.json();

        
      }    */   

/*       async addQuestion(question, options) {
        // Firestore veritabanınıza bir yeni "soru" dokümanı ekleyin
        await db.collection("sorular").add({
          question: question,
          options: options
        });
      
        // Bu işlem başarılı olursa, bir onay mesajı döndürün
        return "Soru başarıyla eklendi!";
      }
       */

    async _refresh(){

        
        const response = await fetch(this.endpoint);
        const data = await response.json();
        const pollRef = db.collection(anketSorulari).doc(gundemSorusu).collection("Bilgiler");

        /* for (var i = 0; i < soruSecenekleri.length; i++){
            pollRef.set(soruSecenekleri[i]);
        } */
        
        const snapshot = await pollRef.get();
        

        this.root.querySelectorAll(".poll__option").forEach(option => {
            option.remove();
        });
        
        for(const option of data){
            const template = document.createElement("template");
            const fragment = template.content;

            template.innerHTML = `
                <div class="poll__option ${this.selected == option.secenek ? "poll__option--selected" : "" } ">
                    <div class="poll__option-fill"></div>
                    <div class="poll__option-info">
                        <span class="poll__secenek">${ option.secenek }</span>
                        <span class="poll__yuzdelik">%${ option.yuzdelik }</span>
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
                    fetch(this.endpoint, {
                        method: "post",
                        body: `add=${ option.secenek }`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }, 
                    // Firebase'e ekleme metodu olarak .update yaptığım için, seçeneklerin önceden eklenmiş olması gerekiyor.
                    pollRef.doc(option.secenek).update({yapilanOySayisi: firebase.firestore.FieldValue.increment(1)})).then(() => {
                        this.selected = option.secenek;

                        /* 
                        Verilen oylamanın daha sonra da tutulmasını sağlar 
                        */
                        sessionStorage.setItem("poll-selected", option.secenek);
                        console.log(`Şu seçenek işaretlenmiştir : ${p.selected} \nBu bilgi Firebase veritabanına eklenmiştir.`);

                        this._refresh();
                    })
                });
            }

            fragment.querySelector(".poll__option-fill").style.width = `${ option.yuzdelik }%`;

            this.root.appendChild(fragment);
        }
    }
}
const p = new Poll(
    document.querySelector(".poll"),
    gundemSorusu,

);
/* const p = new Poll(document.querySelector(".poll"));
p.addQuestion('Yeni soru', ['Seçenek 1', 'Seçenek 2', 'Seçenek 3']).then(response => {
    console.log(response);
  }); */

console.log(p);

var soruSecenekleri;

db.collection("Anket Soruları").doc("Memnun musunuz?").collection("Seçenekler").get().then((querySnapshot) => {
    
    querySnapshot.forEach((doc) => {
        console.log(doc.data().cevap);
        console.log(doc.data().yapilanOySayisi);

    });
});