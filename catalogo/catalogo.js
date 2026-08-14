import { produtos } from "../data/produtos-disponiveis.js";
import { atualizarHeader } from "../data/header.js";

const container = document.querySelector(".produtos-grid");
const input = document.querySelector(".catalogo-topo input");
const selectOrdenar = document.querySelector(".catalogo-topo select");
const botoesFiltro = document.querySelectorAll(".filtros-rapidos button");

let filtroAtual = "inicial";
let buscaAtual = "";
let ordemAtual = "";
let mostrarTudo = false;

const LIMITE_INICIAL = 20;
const LIMITE_FILTRO = 25;

/* =========================
   FUNÇÕES UTILITÁRIAS
========================= */

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

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

/* =========================
   FAVORITOS
========================= */

function pegarFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function salvarFavoritos(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function produtoEstaFavoritado(id) {
    const favoritos = pegarFavoritos();

    return favoritos.some(favoritoId => {
        return Number(favoritoId) === Number(id);
    });
}

function alternarFavorito(id) {
    let favoritos = pegarFavoritos();

    if (produtoEstaFavoritado(id)) {
        favoritos = favoritos.filter(favoritoId => {
            return Number(favoritoId) !== Number(id);
        });
    } else {
        favoritos.push(Number(id));
    }

    salvarFavoritos(favoritos);
    atualizarHeader();
}

function ativarBotoesFavorito() {
    document.querySelectorAll(".btn-favorito").forEach(botao => {
        botao.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(botao.dataset.id);

            alternarFavorito(id);

            const favoritado = produtoEstaFavoritado(id);
            const icone = botao.querySelector("i");

            botao.classList.toggle("ativo", favoritado);

            if (favoritado) {
                icone.classList.remove("fa-regular");
                icone.classList.add("fa-solid");
            } else {
                icone.classList.remove("fa-solid");
                icone.classList.add("fa-regular");
            }
        });
    });
}

/* =========================
   CARD DO PRODUTO
========================= */

function criarCardProduto(produto) {
    const imagem = pegarImagemPrincipal(produto);
    const desconto = calcularDesconto(produto.preco, produto.precoAntigo);
    const temDesconto = desconto !== null;
    const favoritado = produtoEstaFavoritado(produto.id);

    return `
        <div class="produto-card">

            <button 
                class="btn-favorito ${favoritado ? "ativo" : ""}" 
                data-id="${produto.id}"
                aria-label="Favoritar produto"
                type="button"
            >
                <i class="${favoritado ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>

            <a href="../produto/produto.html?id=${produto.id}" class="produto-link">
                <div class="produto-img-box">
                    ${temDesconto ? `<span class="tag-desconto">-${desconto}%</span>` : ""}

                    <img src="../${imagem}" alt="${produto.nome}">
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

        </div>
    `;
}

/* =========================
   MOSTRAR PRODUTOS
========================= */

function mostrarProdutos(lista, limite) {
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="sem-produtos">
                <h2>Nenhum produto encontrado</h2>
                <p>Tente buscar por outro nome, marca ou categoria.</p>
            </div>
        `;
        return;
    }

    const produtosParaMostrar = mostrarTudo ? lista : lista.slice(0, limite);

    produtosParaMostrar.forEach(produto => {
        container.innerHTML += criarCardProduto(produto);
    });

    const precisaMostrarMais =
        !mostrarTudo &&
        lista.length > limite &&
        filtroAtual !== "todos" &&
        ordemAtual !== "todos";

    if (precisaMostrarMais) {
        container.innerHTML += `
            <div class="mostrar-mais-area">
                <button id="mostrarMais" type="button">Mostrar mais</button>
            </div>
        `;

        document.getElementById("mostrarMais").addEventListener("click", () => {
            mostrarTudo = true;
            aplicarFiltros();
        });
    }

    ativarBotoesFavorito();
}

/* =========================
   BUSCA
========================= */

function produtoCombinaComBusca(produto) {
    const nome = normalizarTexto(produto.nome);
    const categoria = normalizarTexto(produto.categoria);
    const marca = normalizarTexto(produto.marca);
    const genero = normalizarTexto(produto.genero);
    const descricao = normalizarTexto(produto.descricao);

    return (
        nome.includes(buscaAtual) ||
        categoria.includes(buscaAtual) ||
        marca.includes(buscaAtual) ||
        genero.includes(buscaAtual) ||
        descricao.includes(buscaAtual)
    );
}

/* =========================
   FILTROS POR BOTÃO
========================= */

function produtoCombinaComFiltro(produto) {
    if (filtroAtual === "inicial" || filtroAtual === "todos") {
        return true;
    }

    const categoria = normalizarTexto(produto.categoria);
    const genero = normalizarTexto(produto.genero);
    const marca = normalizarTexto(produto.marca);

    if (filtroAtual === "promocoes") {
        return produto.promocao === true || calcularDesconto(produto.preco, produto.precoAntigo) !== null;
    }

    if (filtroAtual === "lancamentos") {
        return produto.lancamento === true;
    }

    return (
        categoria === filtroAtual ||
        genero === filtroAtual ||
        marca === filtroAtual
    );
}

/* =========================
   SELECT / ORDEM
========================= */

function aplicarSelect(lista) {
    let resultado = [...lista];

    if (ordemAtual === "todos") {
        resultado = [...produtos];

        if (buscaAtual !== "") {
            resultado = resultado.filter(produtoCombinaComBusca);
        }

        return resultado;
    }

    if (ordemAtual === "menor") {
        resultado.sort((a, b) => Number(a.preco) - Number(b.preco));
    }

    if (ordemAtual === "maior") {
        resultado.sort((a, b) => Number(b.preco) - Number(a.preco));
    }

    if (ordemAtual === "promocoes") {
        resultado = resultado.filter(produto => {
            return produto.promocao === true || calcularDesconto(produto.preco, produto.precoAntigo) !== null;
        });
    }

    if (ordemAtual === "lancamentos") {
        resultado = resultado.filter(produto => produto.lancamento === true);
    }

    return resultado;
}

/* =========================
   APLICAR FILTROS
========================= */

function aplicarFiltros() {
    let resultado = [...produtos];

    if (buscaAtual !== "") {
        resultado = resultado.filter(produtoCombinaComBusca);
    }

    resultado = resultado.filter(produtoCombinaComFiltro);
    resultado = aplicarSelect(resultado);

    if (filtroAtual === "todos" || ordemAtual === "todos") {
        mostrarTudo = true;
        mostrarProdutos(resultado, resultado.length);
        return;
    }

    const limite = filtroAtual === "inicial" ? LIMITE_INICIAL : LIMITE_FILTRO;

    mostrarProdutos(resultado, limite);
}

/* =========================
   EVENTOS
========================= */

input.addEventListener("input", () => {
    buscaAtual = normalizarTexto(input.value);
    mostrarTudo = false;
    aplicarFiltros();
});

selectOrdenar.addEventListener("change", () => {
    ordemAtual = selectOrdenar.value;
    mostrarTudo = ordemAtual === "todos";
    aplicarFiltros();
});

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        filtroAtual = normalizarTexto(botao.textContent);
        mostrarTudo = filtroAtual === "todos";

        aplicarFiltros();
    });
});

/* =========================
   INICIALIZAÇÃO
========================= */

mostrarProdutos(produtos, LIMITE_INICIAL);
atualizarHeader();