import { produtos } from "../data/produtos-disponiveis.js";
import { atualizarHeader } from "../data/header.js";

const listaFavoritos = document.getElementById("listaFavoritos");
const contadorFavoritos = document.getElementById("contadorFavoritos");

function pegarFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function salvarFavoritos(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function atualizarFavoritosHeader() {
    if (!contadorFavoritos) return;

    const favoritos = pegarFavoritos();

    contadorFavoritos.textContent = favoritos.length;
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function calcularDesconto(preco, precoAntigo) {
    const atual = Number(preco);
    const antigo = Number(precoAntigo);

    if (!antigo || antigo <= atual) {
        return null;
    }

    return Math.round(((antigo - atual) / antigo) * 100);
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

function removerFavorito(id) {
    const favoritos = pegarFavoritos();

    const novosFavoritos = favoritos.filter(favoritoId => {
        return Number(favoritoId) !== Number(id);
    });

    salvarFavoritos(novosFavoritos);

    renderizarFavoritos();
    atualizarHeader();
}

function criarCardFavorito(produto) {
    const imagem = pegarImagemPrincipal(produto);
    const desconto = calcularDesconto(produto.preco, produto.precoAntigo);
    const temDesconto = desconto !== null;

    return `
        <div class="favorito-card">
            <div class="favorito-img-box">
                ${temDesconto ? `<span class="tag-desconto">-${desconto}%</span>` : ""}

                <img src="../${imagem}" alt="${produto.nome}">

                <button class="remover-favorito" data-id="${produto.id}">
                    <i class="fa-solid fa-heart-crack"></i>
                </button>
            </div>

            <div class="favorito-info">
                <h3>${produto.nome}</h3>

                <div class="favorito-detalhes">
                    ${produto.marca ? `<span>${produto.marca}</span>` : ""}
                    ${produto.categoria ? `<span>${produto.categoria}</span>` : ""}
                    ${produto.genero ? `<span>${produto.genero}</span>` : ""}
                </div>

                <div class="favorito-precos">
                    <span class="preco-atual">
                        ${formatarPreco(produto.preco)}
                    </span>

                    ${
                        temDesconto
                            ? `<span class="preco-antigo">${formatarPreco(produto.precoAntigo)}</span>`
                            : ""
                    }
                </div>

                <div class="favorito-acoes">
                    <a href="../produto/produto.html?id=${produto.id}" class="btn-ver-produto">
                        Ver produto
                    </a>

                    <button class="btn-remover" data-id="${produto.id}">
                        Remover
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderizarFavoritos() {
    const favoritos = pegarFavoritos();

    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = `
            <div class="favoritos-vazio">
                <i class="fa-solid fa-heart"></i>

                <h2>Nenhum favorito ainda</h2>

                <p>
                    Quando você favoritar algum tênis, ele aparecerá aqui.
                </p>

                <a href="../catalogo/catalogo.html">
                    Ver catálogo
                </a>
            </div>
        `;

        atualizarHeader();
        return;
    }

    const produtosFavoritos = produtos.filter(produto => {
        return favoritos.some(favoritoId => {
            return Number(favoritoId) === Number(produto.id);
        });
    });

    if (produtosFavoritos.length === 0) {
        listaFavoritos.innerHTML = `
            <div class="favoritos-vazio">
                <i class="fa-solid fa-heart"></i>

                <h2>Nenhum produto encontrado</h2>

                <p>
                    Os favoritos salvos não foram encontrados na lista de produtos.
                </p>

                <a href="../catalogo/catalogo.html">
                    Ver catálogo
                </a>
            </div>
        `;

        salvarFavoritos([]);
        atualizarHeader();
        return;
    }

    produtosFavoritos.forEach(produto => {
        listaFavoritos.innerHTML += criarCardFavorito(produto);
    });

    ativarBotoesRemover();
    atualizarHeader();
}

function ativarBotoesRemover() {
    document.querySelectorAll(".remover-favorito, .btn-remover").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;

            removerFavorito(id);
        });
    });
}

renderizarFavoritos();
atualizarHeader();