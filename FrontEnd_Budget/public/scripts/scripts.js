const Modal = {
    open(){
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')

        document
        .querySelector(".edit")
        .classList
        .remove('active')

        document
        .querySelector(".actions")
        .classList
        .remove('deactivate')
        
    },
    close(){
        document.querySelector('.modal-overlay')
        .classList
        .remove('active')

        // oposite
        document
        .querySelector(".edit")
        .classList
        .remove('active')

        document
        .querySelector(".actions")
        .classList
        .remove('deactivate')

        Form.clearFields()
    },
    async openEdit(index) {
        Modal.open()

        document
        .querySelector(".edit")
        .classList
        .add('active')

        document
        .querySelector(".actions")
        .classList
        .add('deactivate')

        await Form.fillFields(index)
    }
}

const DB = {
    async get() {
        let transactions
        try {
            const response = await fetch('http://localhost:3004/')
            const data = await response.json()
            transactions = data
            console.log(transactions);
        } catch (error) {
            console.log(error)
        }
        
        return transactions
    },

    async getSingle(uuid) {
        let transaction
        try {
            const response = await fetch(`http://localhost:3004/${uuid}`)
            const data = await response.json()
            transaction = data
        } catch (error) {
            console.log(error)
        }
        
        return transaction
    }
}

const Storage = {
    async getTransactions() {
        let transactions
        try {
            transactions = await DB.get()
        } catch (error) {
            console.log(error)
        }
        
        return transactions.rows
    },

    async getSingle(index) {
        let transaction
        try {
            transaction = await DB.getSingle(index)
        } catch (error) {
            console.log(error)
        }
        
        return transaction.rows[0]
    },

    async getToken() {
        const data = await DB.get()
        const token = data["x-access-token"]

        return token
    },

    async set(transaction) {
        const token = await Storage.getToken()
        try {
            await fetch("http://localhost:3004/create", {
                method: "POST",
                body: JSON.stringify(transaction),
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": `${token}`
                }
            })
        } catch (error) {
            console.log(error)
        }
    },
    
    async put(index, transaction) {
        const token = await Storage.getToken()
        const url = `http://localhost:3004/transaction/${index}`
        await fetch(url, {
            method: "put",
            body: JSON.stringify(transaction),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": `${token}`
            }
        })
    }

}

const Transaction = {
    async add(transaction) {
        await Storage.set(transaction)

        App.reload()
    },

    async edit(index, transaction) {
        // faz a requisição fetch para o backend passando os valores alterados
        await Storage.put(index, transaction)

        App.reload()
    },

    async remove(index) {
        const token = await Storage.getToken()
        const url = `http://localhost:3004/transaction/delete/${index}`
        await fetch(url, {
            method: "delete",
            headers: {
                "x-access-token": `${token}`
            }
        })

        App.reload()
    },

    async incomes() {
        let sum = 0;
        const transactions = await Storage.getTransactions()
        transactions.forEach(transaction => {
            if (transaction.value >= 0) {
                sum += transaction.value
            }

        })

        return sum
    },

    async expenses() {
        let sum = 0;
        const transactions = await Storage.getTransactions()
        transactions.forEach(function(transaction) {
            if(transaction.value <= 0) {
                sum += transaction.value
            }
        })

        return sum
    },

    async total() {
        let sum;
        const incomes = await Transaction.incomes()
        const expenses = await Transaction.expenses()        

        sum = incomes + expenses

        return sum
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHtmlTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHtmlTransaction(transaction, index) {
        const CSSclass = transaction.value > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.value)

        const date = Utils.formatDate(transaction.date)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${date}</td>
            <td id="${index}" >
                <img onclick="Form.getIndex();Modal.openEdit('${index}')" src="../../public/assets/edit-24.svg" alt="Editar transação">
            </td>
            <td>
                <img onclick="Transaction.remove('${index}')" src="../../public/assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    async updateBalance() {
        const incomes = await Transaction.incomes()
        const expenses = await Transaction.expenses()
        const total = await Transaction.total()

        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(incomes)

        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(expenses)

        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(total)
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {        
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2].substring(0,2)}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getIndex() {
        document.querySelector('#data-table').onclick = function(ev) {
            // ev.target <== td element
            // ev.target.parentElement <== tr
            index = ev.target.parentElement.id
        }
    },

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if ( description.trim() === "" || amount.trim() === "" ||
             date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    valuesToDB() {
        let { description, amount, date } = Form.getValues()

        return {
            description,
            amount,
            date
        }
    },

    async fillFields(index) {
        const { description, value, date } = await Storage.getSingle(index)
        Form.description.value = description
        Form.amount.value = value
        Form.date.value = date.substring(0,10)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    async edit() {
        try {
            Form.validateFields()
            const transaction = Form.valuesToDB()
            await Transaction.edit(index, transaction)
            Form.clearFields()
            Modal.close()          
        } catch (error) {
            alert(error.message)
        }
    },

    async submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.valuesToDB()
            await Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    async init () {
        const transactions = await Storage.getTransactions()
        transactions.forEach((transaction) => {
            DOM.addTransaction(transaction, transaction.uuid)
        })

        DOM.updateBalance()
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

// Form.getIndex()

App.init()
