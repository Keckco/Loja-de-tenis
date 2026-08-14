import { produtos } from "../data/produtos-disponiveis.js";
import { atualizarHeader } from "../data/header.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const produto = produtos.find(item => item.id === id);

const LIMITE_POR_TAMANHO = 5;

const breadcrumbProduto = document.getElementById("breadcrumb-produto");
const imagemPrincipal = document.getElementById("imagemPrincipal");
const miniaturas = document.getElementById("miniaturas");
const produtoMarca = document.getElementById("produtoMarca");
const produtoNome = document.getElementById("produtoNome");
const produtoCategoria = document.getElementById("produtoCategoria");
const produtoGenero = document.getElementById("produtoGenero");
const produtoPreco = document.getElementById("produtoPreco");
const produtoPrecoAntigo = document.getElementById("produtoPrecoAntigo");
const produtoDesconto = document.getElementById("produtoDesconto");
const produtoDescricao = document.getElementById("produtoDescricao");
const tamanhosContainer = document.getElementById("tamanhos");
const avisoTamanho = document.getElementById("avisoTamanho");
const botaoAdicionar = document.getElementById("adicionarOrcamento");
const botaoRemover = document.getElementById("removerOrcamento");
const itensAdicionados = document.getElementById("itensAdicionados");
const quantidadeProduto = document.getElementById("quantidadeProduto");
const diminuirQuantidade = document.getElementById("diminuirQuantidade");
const aumentarQuantidade = document.getElementById("aumentarQuantidade");
const quantidadeSelecionada = document.getElementById("quantidadeSelecionada");
const feedbackCarrinho = document.getElementById("feedbackOrcamento");

let tamanhoSelecionado = null;
let quantidadeAtual = 1;

if (!produto) {
    document.body.innerHTML = `
        <h1 style="padding:100px;text-align:center;font-family:sans-serif;">
            Produto não encontrado.
        </h1>
    `;
    throw new Error("Produto não encontrado");
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

    if (!antigo || antigo <= atual) return null;

    return Math.round(((antigo - atual) / antigo) * 100);
}

function pegarImagemPrincipal() {
    if (produto.imagens && produto.imagens.length > 0) return produto.imagens[0];
    if (produto.imagem) return produto.imagem;
    return "img/sem-imagem.png";
}

function pegarCarrinho() {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(lista) {
    localStorage.setItem("carrinho", JSON.stringify(lista));
}

function itemExisteNoCarrinho(tamanho) {
    return pegarCarrinho().find(item =>
        item.id === produto.id && item.tamanho === tamanho
    );
}

function mostrarFeedback(mensagem, tipo = "sucesso") {
    feedbackCarrinho.textContent = mensagem;
    feedbackCarrinho.classList.add("ativo");

    if (tipo === "erro") {
        feedbackCarrinho.style.color = "#c0392b";
    } else {
        feedbackCarrinho.style.color = "rgb(0, 150, 40)";
    }

    setTimeout(() => {
        feedbackCarrinho.textContent = "";
        feedbackCarrinho.classList.remove("ativo");
    }, 1800);
}

function atualizarQuantidadeVisual() {
    quantidadeSelecionada.textContent = quantidadeAtual;

    if (quantidadeAtual >= LIMITE_POR_TAMANHO) {
        aumentarQuantidade.disabled = true;
        aumentarQuantidade.classList.add("limite");
    } else {
        aumentarQuantidade.disabled = false;
        aumentarQuantidade.classList.remove("limite");
    }

    if (quantidadeAtual <= 1) {
        diminuirQuantidade.disabled = true;
        diminuirQuantidade.classList.add("limite");
    } else {
        diminuirQuantidade.disabled = false;
        diminuirQuantidade.classList.remove("limite");
    }
}

function atualizarBotaoCarrinho() {
    if (!tamanhoSelecionado) {
        botaoAdicionar.textContent = "Adicionar ao carrinho";
        botaoRemover.style.display = "none";
        return;
    }

    const existe = itemExisteNoCarrinho(tamanhoSelecionado);

    if (existe) {
        botaoAdicionar.textContent = "Atualizar carrinho";
        botaoRemover.style.display = "inline-flex";
        quantidadeAtual = Math.min(Number(existe.quantidade), LIMITE_POR_TAMANHO);
    } else {
        botaoAdicionar.textContent = "Adicionar ao carrinho";
        botaoRemover.style.display = "none";
    }

    atualizarQuantidadeVisual();
}

function renderizarItensAdicionados() {
    const itensDoProduto = pegarCarrinho().filter(item => item.id === produto.id);

    if (itensDoProduto.length === 0) {
        itensAdicionados.innerHTML = "";
        return;
    }

    itensAdicionados.innerHTML = `
        <h4>Tamanhos no carrinho:</h4>
        <div class="lista-tamanhos-adicionados">
            ${itensDoProduto.map(item => `
                <span>
                    Tam. ${item.tamanho}
                    <strong>x${item.quantidade}</strong>
                </span>
            `).join("")}
        </div>
    `;
}

function preencherDadosProduto() {
    const desconto = calcularDesconto(produto.preco, produto.precoAntigo);

    breadcrumbProduto.textContent = produto.nome;
    produtoMarca.textContent = produto.marca || "Sneak Up";
    produtoNome.textContent = produto.nome;
    produtoCategoria.textContent = produto.categoria || "Tênis";
    produtoGenero.textContent = produto.genero || "Unissex";
    produtoPreco.textContent = formatarPreco(produto.preco);
    produtoDescricao.textContent = produto.descricao || "Produto selecionado com atendimento direto pelo WhatsApp.";

    if (desconto !== null) {
        produtoPrecoAntigo.textContent = formatarPreco(produto.precoAntigo);
        produtoDesconto.textContent = `-${desconto}%`;
    } else {
        produtoPrecoAntigo.style.display = "none";
        produtoDesconto.style.display = "none";
    }
}

function renderizarGaleria() {
    const imagens = produto.imagens?.length ? produto.imagens : [pegarImagemPrincipal()];

    imagemPrincipal.src = `../${imagens[0]}`;
    imagemPrincipal.alt = produto.nome;

    miniaturas.innerHTML = "";

    imagens.forEach((imagem, index) => {
        const miniatura = document.createElement("img");

        miniatura.src = `../${imagem}`;
        miniatura.alt = `${produto.nome} ${index + 1}`;

        if (index === 0) miniatura.classList.add("ativo");

        miniatura.addEventListener("click", () => {
            imagemPrincipal.src = `../${imagem}`;

            document
                .querySelectorAll(".miniaturas img")
                .forEach(img => img.classList.remove("ativo"));

            miniatura.classList.add("ativo");
        });

        miniaturas.appendChild(miniatura);
    });
}

function renderizarTamanhos() {
    const todosTamanhos = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

    tamanhosContainer.innerHTML = "";

    todosTamanhos.forEach(tamanho => {
        const botao = document.createElement("button");

        botao.textContent = tamanho;
        botao.classList.add("tamanho-btn");

        const disponivel = produto.tamanhos.includes(tamanho);

        if (!disponivel) {
            botao.classList.add("indisponivel");
            botao.disabled = true;
        } else {
            botao.addEventListener("click", () => {
                document
                    .querySelectorAll(".tamanho-btn")
                    .forEach(btn => btn.classList.remove("ativo"));

                botao.classList.add("ativo");

                tamanhoSelecionado = tamanho;
                quantidadeAtual = 1;

                avisoTamanho.style.display = "none";
                quantidadeProduto.style.display = "block";

                atualizarBotaoCarrinho();
            });
        }

        tamanhosContainer.appendChild(botao);
    });
}

diminuirQuantidade.addEventListener("click", () => {
    if (quantidadeAtual > 1) {
        quantidadeAtual--;
        atualizarQuantidadeVisual();
    }
});

aumentarQuantidade.addEventListener("click", () => {
    if (quantidadeAtual < LIMITE_POR_TAMANHO) {
        quantidadeAtual++;
        atualizarQuantidadeVisual();
        return;
    }

    mostrarFeedback(`Limite de ${LIMITE_POR_TAMANHO} unidades por tamanho.`, "erro");
});

botaoAdicionar.addEventListener("click", () => {
    if (!tamanhoSelecionado) {
        avisoTamanho.style.display = "block";
        return;
    }

    quantidadeAtual = Math.min(quantidadeAtual, LIMITE_POR_TAMANHO);

    let carrinho = pegarCarrinho();

    const itemExistente = carrinho.find(item =>
        item.id === produto.id && item.tamanho === tamanhoSelecionado
    );

    if (itemExistente) {
        itemExistente.quantidade = quantidadeAtual;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            marca: produto.marca,
            categoria: produto.categoria,
            genero: produto.genero,
            preco: produto.preco,
            imagem: pegarImagemPrincipal(),
            tamanho: tamanhoSelecionado,
            quantidade: quantidadeAtual
        });
    }

    salvarCarrinho(carrinho);

    atualizarBotaoCarrinho();
    renderizarItensAdicionados();
    atualizarHeader();
    mostrarFeedback("Carrinho atualizado com sucesso!");
});

botaoRemover.addEventListener("click", () => {
    if (!tamanhoSelecionado) return;

    let carrinho = pegarCarrinho();

    carrinho = carrinho.filter(item =>
        !(item.id === produto.id && item.tamanho === tamanhoSelecionado)
    );

    salvarCarrinho(carrinho);

    quantidadeAtual = 1;

    atualizarQuantidadeVisual();
    atualizarBotaoCarrinho();
    renderizarItensAdicionados();
    atualizarHeader();
    mostrarFeedback("Item removido do carrinho.");
});

preencherDadosProduto();
renderizarGaleria();
renderizarTamanhos();
renderizarItensAdicionados();
atualizarBotaoCarrinho();
atualizarHeader();