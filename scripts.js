/* Desafio: criar uma unica funcao chamada toogle() */
const Modal = {
    open(){
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
        
    },
    close(){
        const teste2 = document.querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let sum = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount >= 0) {
                sum += transaction.amount
            }

        })
        return sum
    },

    expenses() {
        // soma das saidas
        let sum = 0;
        Transaction.all.forEach(function(transaction) {
            if(transaction.amount <= 0) {
                sum += transaction.amount
            }
        })
        return sum
    },

    total() {
        // soma das saidas
        let sum;
        
        sum = Transaction.incomes() + Transaction.expenses()

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
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g,"")) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form. date.value
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

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informacoes foram preenchidas
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulario
            Form.clearFields()
            // fechar o modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
        

    }
}

const App = {
    init () {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

