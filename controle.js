const htmlForm = document.querySelector("#form");
const descTrasacaoInput = document.getElementById("descricao");
const valorTransacaoInput = document.getElementById("montante");
const balancoH1 = document.querySelector("#balanco");
const receitaP = document.querySelector("#din-positivo");
const despesaP = document.querySelector("#din-negativo");
const trasacoesUl = document.querySelector("#transacoes");
const chave_transacoes_storage = "if_financas";
let tipoAtual = "receita";

const btnReceita = document.getElementById("btn-receita");
const btnDespesa = document.getElementById("btn-despesa");

btnReceita.addEventListener("click", () => {
  tipoAtual = "receita";
  btnReceita.classList.add("ativo");
  btnDespesa.classList.remove("ativo");
});

btnDespesa.addEventListener("click", () => {
  tipoAtual = "despesa";
  btnDespesa.classList.add("ativo");
  btnReceita.classList.remove("ativo");
});

let transacoesSalvas;
try {
  transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_storage));
} catch (error) {
  transacoesSalvas = [];
}

if (transacoesSalvas == null) {
  transacoesSalvas = [];
}

htmlForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const descricaoTransacaoStr = descTrasacaoInput.value.trim();
  const valorTransacaoStr = valorTransacaoInput.value.trim();

  if (descricaoTransacaoStr === "") {
    alert("Preencha a descrição da transação!");
    descTrasacaoInput.focus();
    return;
  }

  if (valorTransacaoStr === "") {
    alert("Preencha o valor da transação!");
    valorTransacaoInput.focus();
    return;
  }

  function getProximoId() {
    let proximoId = parseInt(localStorage.getItem("id_incremental") || "1");
    localStorage.setItem("id_incremental", proximoId + 1);
    return proximoId;
  }

  let valor = parseFloat(valorTransacaoStr);
  if (tipoAtual === "despesa") {
    valor = -Math.abs(valor);
  } else {
    valor = Math.abs(valor);
  }

  const transacao = {
    id: getProximoId(),
    descricao: descricaoTransacaoStr,
    valor: valor,
  };

  somaAoSaldo(transacao);
  somaReceitaDespesa(transacao);
  addTransacaoALista(transacao);

  transacoesSalvas.push(transacao);
  localStorage.setItem(
    chave_transacoes_storage,
    JSON.stringify(transacoesSalvas)
  );
  descTrasacaoInput.value = "";
  valorTransacaoInput.value = "";
});

function addTransacaoALista(transacao) {
  const sinal = transacao.valor > 0 ? "" : "-";
  const classe = transacao.valor > 0 ? "positivo" : "negativo";

  const li = document.createElement("li");
  li.classList.add(classe);
  li.setAttribute("data-id", transacao.id);
  li.innerHTML = `
    ${transacao.descricao} 
    <span>${sinal}R$${Math.abs(transacao.valor)}</span>
    <button class="delete-btn" onclick="removeTrasaction(${transacao.id})">
      X
    </button>
  `;
  trasacoesUl.append(li);
}

function somaReceitaDespesa(transacao) {
  const elemento = transacao.valor > 0 ? receitaP : despesaP;
  const substituir = transacao.valor > 0 ? "+ R$" : "- R$";

  let valor = elemento.innerHTML.trim().replace(substituir, "");
  valor = parseFloat(valor);
  valor += Math.abs(transacao.valor);

  elemento.innerHTML = `${substituir}${valor.toFixed(2)}`;
}

function somaAoSaldo(transacao) {
  const valor = transacao.valor;

  let total = balancoH1.innerHTML.trim().replace("R$", "");
  total = parseFloat(total);
  total += valor;
  balancoH1.innerHTML = `R$${total.toFixed(2)}`;
}

function atualizaSaldoRemovendo(transacao) {
  const valor = transacao.valor;

  let total = parseFloat(balancoH1.innerHTML.replace("R$", ""));
  total -= valor;
  balancoH1.innerHTML = `R$${total.toFixed(2)}`;

  const elemento = valor > 0 ? receitaP : despesaP;
  const prefixo = valor > 0 ? "+ R$" : "- R$";

  let valorAtual = parseFloat(elemento.innerHTML.replace(prefixo, ""));
  valorAtual -= Math.abs(valor);
  elemento.innerHTML = `${prefixo}${valorAtual.toFixed(2)}`;
}

function removeTrasaction(transactionId) {
  const transactionIndex = transacoesSalvas.findIndex(
    (transaction) => transaction.id == transactionId
  );

  if (transactionIndex === -1) return;

  const transacaoRemovida = transacoesSalvas[transactionIndex];

  transacoesSalvas.splice(transactionIndex, 1);

  localStorage.setItem(
    chave_transacoes_storage,
    JSON.stringify(transacoesSalvas)
  );

  const li = trasacoesUl.querySelector(`li[data-id="${transactionId}"]`);
  if (li) li.remove();

  atualizaSaldoRemovendo(transacaoRemovida);
}

function carregaDados() {
  trasacoesUl.innerHTML = "";
  receitaP.innerHTML = "+ R$0.00";
  despesaP.innerHTML = "- R$0.00";
  balancoH1.innerHTML = "R$0.00";
  for (let i = 0; i < transacoesSalvas.length; i++) {
    somaAoSaldo(transacoesSalvas[i]);
    somaReceitaDespesa(transacoesSalvas[i]);
    addTransacaoALista(transacoesSalvas[i]);
  }
}

carregaDados();
