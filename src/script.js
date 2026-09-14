const tbody = document.querySelector("tbody");
const date = document.querySelector("#date")
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const categ = document.querySelector("#category");
const incomeCateg = document.querySelector("#incomeCategory");
const bntNew = document.querySelector("#btnNew");
const userName = document.querySelector("#userName");
const nameModal = document.querySelector("#nameModal");
const nameInput = document.querySelector("#nameInput");
const saveName = document.querySelector("#saveName");
const savedName = localStorage.getItem("userName");

const categoryContainer = document.querySelector("#categoryContainer");
const incomeContainer = document.querySelector("#incomeContainer");
const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

const minDate = document.querySelector("#minDate");
const maxDate = document.querySelector("#maxDate");
const filterType = document.querySelector("#filterType");
const filterCategory = document.querySelector("#filterCategory");
const clearFilters = document.querySelector("#clearFilters");

let items;


// =================================== Personalização Nome ============================== //
if (savedName){
    userName.textContent = savedName;
    nameModal.style.display = "none";
}
// =================================== SIDEBAR ============================== //
document.getElementById('open_btn').addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('open-sidebar');
});

function filterItems(){
    const min = minDate.value;
    const max = maxDate.value;
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    const filteredItems = items.filter((item)=>{
        // --------- Filtro data ----------- //
        const dateMatch = 
        (!min || item.date >= min) &&
        (!max || item.date <= max);

        // --------- Filtro tipo ----------- //
        const typeMatch = 
        selectedType === "all" ||
        item.type === selectedType;

        // --------- Filtro categoria ----------- //
        const categoryMatch = 
        selectedCategory === "all" ||
        item.categ === selectedCategory;

        return dateMatch && typeMatch && categoryMatch;
    });

    tbody.innerHTML = "";

    filteredItems.forEach((item)=>{
        const index = items.indexOf(item);
        insertItem(item, index);
    });
}

// ============ Converter data para formato BR ================== //
function formatDate(date){
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

// ============ Mostrar categoria de acordo com tipo(Ent ou Saída) ================== //
function toggleCategory(){
    if(type.value === "expense"){
        categoryContainer.style.display = "flex";
        incomeContainer.style.display = "none";
    } else{
        incomeContainer.style.display = "flex";
        categoryContainer.style.display = "none";
    }
}

// ============ Para selecionar qual o valor de qual select deve pegar para inserir o item na tabela ================== //
function selectedCategory(){
    if(type.value === "income"){
        return incomeCateg.value
    } else{
        return categ.value
    }
}

// ============ Evento quando clica no inserir e conversões para melhor visualização do usuário ================== //
bntNew.onclick = () => {
    if(date.value === "" || amount.value === "" || type.value === "" || categ.value === ""|| selectedCategory() === "-"){
        return alert ("Preencha todos os campos!");
    }

    items.push({
        date: date.value,
        desc: descItem.value,
        amount: Math.abs(amount.value).toFixed(2),
        type: type.value,
        categ: selectedCategory(),
    });

    setItensBD();
    loadItens();

    descItem.value = "";
    amount.value = "";
}

// ============ Deletar item da tabela e LocalStorage ================== //
function deleteItem (index){
    items.splice(index,1);
    setItensBD();
    loadItens();
}

// ============ Pegar o ícone da categoria selecionada para inserir na tabela junto com o nome da categoria ================== //
function getIcons(categ){
    const icons = {
        "Alimentação":"fa-utensils" ,
        "Assinaturas": "fa-receipt",
        "Compras": "fa-tags",
        "Contas": "fa-wallet",
        "Carro - despesas": "fa-car",
        "Educação": "fa-graduation-cap",
        "Investimento": "fa-arrow-trend-up",
        "Lazer": "fa-masks-theater",
        "Moradia": "fa-house",
        "Pets": " fa-paw",
        "Roupas":" fa-shirt",
        "Saúde": " fa-capsules",
        "Transporte": "fa-train-subway",
        "Viagens": "fa-plane-up",
        "Outros": " fa-ellipsis",
        "Bonificação": "fa-trophy",
        "Freelance":" fa-coins",
        "Férias": "fa-umbrella-beach",
        "Salário": "fa-hand-holding-dollar",
        "13°":  " fa-sack-dollar",
    };

    return icons[categ];
}

// ============ Criar o item na tabela ================== //
function insertItem(item, index) {
    let tr = document.createElement("tr");
    
    tr.innerHTML = `
        <td>${formatDate(item.date)}</td>
        <td class="columnIcons"> <i class="fa-solid ${getIcons(item.categ)}"></i>
        ${item.categ}
        </td>
        <td>R$ ${item.amount}</td>
        <td class="columnType"> ${ 
            item.type === "income"
            ?'<i class="fa-solid fa-circle-up"></i>'
            :'<i class="fa-solid fa-circle-down"></i>'
        }</td>
        <td class="columnDescription">${item.desc}</td>
        <td class="columnAction">
            <button onclick="deleteItem(${index})"><i class="fa-solid fa-trash-can"></i></button>
        </td>
    `;

    tbody.appendChild(tr);
}

function loadItens (){
    items = getItensBD();
    tbody.innerHTML="";
    items.forEach((item, index) => {
        insertItem(item, index);
    });
        
    getTotals();
}

// ============ Atualizar o resumo ================== //
function getTotals(){
    const amountIncomes = items
        .filter((item) => item.type === "income")
        .map((transaction) => Number(transaction.amount));

    const amountExpenses = items
        .filter((item) => item.type === "expense")
        .map((transaction) => Number(transaction.amount));

    const totalIncomes = amountIncomes
        .reduce((acc, cur) => acc + cur, 0)
        .toFixed(2);
    const totalExpenses = Math.abs(
        amountExpenses.reduce((acc,cur) => acc + cur, 0)
    ).toFixed(2);
    const totalItems = (totalIncomes - totalExpenses).toFixed(2);

    incomes.innerHTML = totalIncomes;
    expenses.innerHTML = totalExpenses;
    total.innerHTML = totalItems;
}

// ============ Guardar no LocalStorage ================== //
const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = ()=>
    localStorage.setItem("db_items",JSON.stringify(items));

loadItens();
toggleCategory();
saveName.addEventListener("click", () =>{
    const name = nameInput.value.trim();
    if (name === "") return;
    localStorage.setItem("userName", name);
    userName.textContent = name;
    nameModal.style.display = "none";
});
type.addEventListener("change", toggleCategory);
minDate.addEventListener("change", filterItems);
maxDate.addEventListener("change", filterItems);

filterType.addEventListener("change", filterItems);
filterCategory.addEventListener("change", filterItems);

clearFilters.addEventListener("click", () =>{
    minDate.value = "";
    maxDate.value ="";
    filterType.value = "all";
    filterCategory.value = "all";

    filterItems();
});