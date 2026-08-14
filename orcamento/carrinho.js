import { atualizarHeader } from "../data/header.js";

const listaCarrinho = document.getElementById("listaOrcamento");
const totalItens = document.getElementById("totalItens");
const totalValor = document.getElementById("totalValor");
const enviarWhatsApp = document.getElementById("enviarWhatsApp");
const limparCarrinho = document.getElementById("limparOrcamento");

const NUMERO_WHATSAPP = "5542991559911";
const LIMITE_POR_TAMANHO = 5;

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function pegarCarrinho() {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function calcularResumo(carrinho) {
    const quantidade = carrinho.reduce((total, item) => {
        return total + Number(item.quantidade || 0);
    }, 0);

    const valor = carrinho.reduce((total, item) => {
        return total + Number(item.preco || 0) * Number(item.quantidade || 0);
    }, 0);

    totalItens.textContent = quantidade;
    totalValor.textContent = formatarPreco(valor);
}

function renderizarCarrinho() {
    const carrinho = pegarCarrinho();

    listaCarrinho.innerHTML = "";

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = `
            <div class="orcamento-vazio">
                <h2>Seu carrinho está vazio</h2>
                <p>Escolha algum tênis no catálogo para montar seu pedido.</p>
                <a href="../catalogo/catalogo.html">Ver catálogo</a>
            </div>
        `;

        calcularResumo([]);
        atualizarHeader();
        return;
    }

    carrinho.forEach((item, index) => {
        const quantidade = Number(item.quantidade || 1);
        const atingiuLimite = quantidade >= LIMITE_POR_TAMANHO;

        listaCarrinho.innerHTML += `
            <div class="item-orcamento">
                <img src="../${item.imagem}" alt="${item.nome}">

                <div class="item-info">
                    <span class="item-marca">${item.marca || "Sneak Up"}</span>

                    <h3>${item.nome}</h3>

                    <div class="item-tags">
                        <span>${item.categoria || "Tênis"}</span>
                        <span>${item.genero || "Unissex"}</span>
                        <span>Tam. ${item.tamanho}</span>
                    </div>

                    <p>Preço: <strong>${formatarPreco(item.preco)}</strong></p>
                    <p>Subtotal: <strong>${formatarPreco(item.preco * quantidade)}</strong></p>

                    <div class="quantidade">
                        <button class="diminuir" data-index="${index}">-</button>
                        <span>${quantidade}</span>
                        <button 
                            class="aumentar ${atingiuLimite ? "limite" : ""}" 
                            data-index="${index}"
                            ${atingiuLimite ? "disabled" : ""}
                        >
                            +
                        </button>
                    </div>

                    ${atingiuLimite ? `
                        <small class="aviso-limite">
                            Limite de ${LIMITE_POR_TAMANHO} unidades por tamanho.
                        </small>
                    ` : ""}
                </div>

                <button class="remover" data-index="${index}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    calcularResumo(carrinho);
    atualizarHeader();
    ativarBotoes();
}

function ativarBotoes() {
    document.querySelectorAll(".aumentar").forEach(botao => {
        botao.addEventListener("click", () => {
            const index = Number(botao.dataset.index);
            const carrinho = pegarCarrinho();

            if (Number(carrinho[index].quantidade) < LIMITE_POR_TAMANHO) {
                carrinho[index].quantidade += 1;
            }

            salvarCarrinho(carrinho);
            renderizarCarrinho();
        });
    });

    document.querySelectorAll(".diminuir").forEach(botao => {
        botao.addEventListener("click", () => {
            const index = Number(botao.dataset.index);
            const carrinho = pegarCarrinho();

            if (Number(carrinho[index].quantidade) > 1) {
                carrinho[index].quantidade -= 1;
            } else {
                carrinho.splice(index, 1);
            }

            salvarCarrinho(carrinho);
            renderizarCarrinho();
        });
    });

    document.querySelectorAll(".remover").forEach(botao => {
        botao.addEventListener("click", () => {
            const index = Number(botao.dataset.index);
            const carrinho = pegarCarrinho();

            carrinho.splice(index, 1);

            salvarCarrinho(carrinho);
            renderizarCarrinho();
        });
    });
}

function gerarMensagemWhatsApp(carrinho) {
    let mensagem = "Olá! Tenho interesse nos seguintes produtos:\n\n";

    carrinho.forEach((item, index) => {
        const quantidade = Number(item.quantidade || 1);

        mensagem += `${index + 1}. ${item.nome}\n`;
        mensagem += `Marca: ${item.marca || "Sneak Up"}\n`;
        mensagem += `Categoria: ${item.categoria || "Tênis"}\n`;
        mensagem += `Gênero: ${item.genero || "Unissex"}\n`;
        mensagem += `Tamanho: ${item.tamanho}\n`;
        mensagem += `Quantidade: ${quantidade}\n`;
        mensagem += `Preço unitário: ${formatarPreco(item.preco)}\n`;
        mensagem += `Subtotal: ${formatarPreco(item.preco * quantidade)}\n\n`;
    });

    const total = carrinho.reduce((soma, item) => {
        return soma + Number(item.preco || 0) * Number(item.quantidade || 0);
    }, 0);

    mensagem += `Total estimado: ${formatarPreco(total)}\n\n`;
    mensagem += "Gostaria de confirmar a disponibilidade.";

    return encodeURIComponent(mensagem);
}

enviarWhatsApp.addEventListener("click", () => {
    const carrinho = pegarCarrinho();

    if (carrinho.length === 0) return;

    const mensagem = gerarMensagemWhatsApp(carrinho);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`;

    window.open(url, "_blank");
});

limparCarrinho.addEventListener("click", () => {
    localStorage.removeItem("carrinho");
    renderizarCarrinho();
});

renderizarCarrinho();
atualizarHeader();