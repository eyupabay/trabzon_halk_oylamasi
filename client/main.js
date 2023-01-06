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

    async _refresh(){
        const response = await fetch(this.endpoint);
        const data = await response.json();

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
                    fetch(this.endpoint, {
                        method: "post",
                        body: `add=${ option.secenek }`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }).then(() => {
                        this.selected = option.secenek;

                        sessionStorage.setItem("poll-selected", option.secenek);

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
    "Memnun musunuz?"
);
/* const p = new Poll(document.querySelector(".poll"));
p.addQuestion('Yeni soru', ['Seçenek 1', 'Seçenek 2', 'Seçenek 3']).then(response => {
    console.log(response);
  }); */

console.log(p);