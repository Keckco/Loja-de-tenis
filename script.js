import { produtos } from "./data/produtos-disponiveis.js";
import { atualizarHeader } from "./data/header.js";

/* =========================
   ELEMENTOS
========================= */

const carrosselLancamentos = document.getElementById("lancamentosHome");
const btnEsquerda = document.querySelector(".esquerda");
const btnDireita = document.querySelector(".direita");

const promocoesHome = document.getElementById("promocoesHome");
const promocaoPrincipal = document.getElementById("promocaoPrincipal");
const imagemPromocaoPrincipal = document.getElementById("imagemPromocaoPrincipal");
const descontoPrincipal = document.getElementById("descontoPrincipal");
const textoPromocaoPrincipal = document.getElementById("textoPromocaoPrincipal");

const fraseTexto = document.getElementById("frase-texto");

const scrollAmount = 420;

/* =========================
   FUNÇÕES GERAIS
========================= */

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function pegarImagemPrincipal(produto) {
    if (produto.imagens && produto.imagens.length > 0) {
        return produto.imagens[0];
    }

    if (produto.imagem) {
        return produto.imagem;
    }

    return "img/sem-imagem.png";
}

function calcularDesconto(preco, precoAntigo) {
    const atual = Number(preco);
    const antigo = Number(precoAntigo);

    if (!antigo || antigo <= atual) {
        return null;
    }

    return Math.round(((antigo - atual) / antigo) * 100);
}

function produtoTemDesconto(produto) {
    return calcularDesconto(produto.preco, produto.precoAntigo) !== null;
}

/* =========================
   CARD DE LANÇAMENTO
========================= */

function criarCardLancamento(produto) {
    const imagem = pegarImagemPrincipal(produto);
    const desconto = calcularDesconto(produto.preco, produto.precoAntigo);
    const temDesconto = desconto !== null;

    return `
        <a href="./produto/produto.html?id=${produto.id}" class="produto-card">
            <div class="produto-img-box">
                ${temDesconto ? `<span class="tag-desconto">-${desconto}%</span>` : ""}

                <img src="${imagem}" alt="${produto.nome}">
            </div>

            <div class="produto-info">
                <h3>${produto.nome}</h3>

                <div class="produto-detalhes">
                    ${produto.marca ? `<span>${produto.marca}</span>` : ""}
                    ${produto.categoria ? `<span>${produto.categoria}</span>` : ""}
                    ${produto.genero ? `<span>${produto.genero}</span>` : ""}
                </div>

                <div class="produto-precos">
                    <span class="preco-atual">
                        ${formatarPreco(produto.preco)}
                    </span>

                    ${
                        temDesconto
                            ? `<span class="preco-antigo">${formatarPreco(produto.precoAntigo)}</span>`
                            : ""
                    }
                </div>
            </div>
        </a>
    `;
}

function renderizarLancamentos() {
    if (!carrosselLancamentos) return;

    const lancamentos = produtos
        .filter(produto => produto.lancamento === true)
        .slice(0, 10);

    carrosselLancamentos.innerHTML = "";

    if (lancamentos.length === 0) {
        carrosselLancamentos.innerHTML = `
            <div class="sem-produtos-home">
                <p>Nenhum lançamento disponível no momento.</p>
            </div>
        `;
        return;
    }

    lancamentos.forEach(produto => {
        carrosselLancamentos.innerHTML += criarCardLancamento(produto);
    });
}

/* =========================
   PROMOÇÕES
========================= */

function criarCardPromocao(produto) {
    const imagem = pegarImagemPrincipal(produto);
    const desconto = calcularDesconto(produto.preco, produto.precoAntigo);

    return `
        <a href="./produto/produto.html?id=${produto.id}" class="promo-card">
            <div class="promo-img-box">
                ${desconto !== null ? `<span class="tag-desconto">-${desconto}%</span>` : ""}

                <img src="${imagem}" alt="${produto.nome}">
            </div>

            <h3>${produto.nome}</h3>

            <div class="promo-precos">
                <p>${formatarPreco(produto.preco)}</p>

                ${
                    desconto !== null
                        ? `<span>${formatarPreco(produto.precoAntigo)}</span>`
                        : ""
                }
            </div>
        </a>
    `;
}

function renderizarPromocoes() {
    if (!promocoesHome) return;

    const produtosComDesconto = produtos
        .filter(produtoTemDesconto)
        .map(produto => {
            return {
                ...produto,
                descontoCalculado: calcularDesconto(produto.preco, produto.precoAntigo)
            };
        })
        .sort((a, b) => b.descontoCalculado - a.descontoCalculado);

    promocoesHome.innerHTML = "";

    if (produtosComDesconto.length === 0) {
        promocoesHome.innerHTML = `
            <div class="sem-produtos-home">
                <p>Nenhuma promoção disponível no momento.</p>
            </div>
        `;
        return;
    }

    const produtoPrincipal = produtosComDesconto[0];
    const outrosProdutos = produtosComDesconto.slice(1, 5);

    if (promocaoPrincipal) {
        promocaoPrincipal.href = `./produto/produto.html?id=${produtoPrincipal.id}`;
    }

    if (imagemPromocaoPrincipal) {
        imagemPromocaoPrincipal.src = pegarImagemPrincipal(produtoPrincipal);
        imagemPromocaoPrincipal.alt = produtoPrincipal.nome;
    }

    if (descontoPrincipal) {
        descontoPrincipal.textContent = `${produtoPrincipal.descontoCalculado}% OFF`;
    }

    if (textoPromocaoPrincipal) {
        textoPromocaoPrincipal.textContent = `${produtoPrincipal.nome} com desconto especial.`;
    }

    outrosProdutos.forEach(produto => {
        promocoesHome.innerHTML += criarCardPromocao(produto);
    });
}

/* =========================
   CARROSSEL LANÇAMENTOS
========================= */

function scrollSuave(valor) {
    if (!carrosselLancamentos) return;

    carrosselLancamentos.scrollBy({
        left: valor,
        behavior: "smooth"
    });
}

if (btnDireita) {
    btnDireita.addEventListener("click", () => {
        scrollSuave(scrollAmount);
    });
}

if (btnEsquerda) {
    btnEsquerda.addEventListener("click", () => {
        scrollSuave(-scrollAmount);
    });
}

/* =========================
   FRASES ROTATIVAS
========================= */

const frases = [
    "🔥 Novos modelos toda semana",
    "💬 Atendimento direto via WhatsApp",
    "⭐ Produtos selecionados com qualidade",
    "👟 Estilo e conforto em cada passo"
];

let fraseAtual = 0;

function iniciarFrasesRotativas() {
    if (!fraseTexto) return;

    setInterval(() => {
        fraseTexto.style.opacity = "0";
        fraseTexto.style.transform = "translateY(10px)";

        setTimeout(() => {
            fraseAtual++;

            if (fraseAtual >= frases.length) {
                fraseAtual = 0;
            }

            fraseTexto.innerHTML = frases[fraseAtual];

            fraseTexto.style.opacity = "1";
            fraseTexto.style.transform = "translateY(0)";
        }, 400);
    }, 10000);
}

/* =========================
   INICIALIZAÇÃO
========================= */

renderizarLancamentos();
renderizarPromocoes();
iniciarFrasesRotativas();
atualizarHeader();