export function atualizarCarrinhoHeader() {
    const contador = document.getElementById("contadorCarrinho");

    if (!contador) return;

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const total = carrinho.reduce((soma, item) => {
        return soma + Number(item.quantidade || 0);
    }, 0);

    contador.textContent = total;
}

export function atualizarFavoritosHeader() {
    const contador = document.getElementById("contadorFavoritos");

    if (!contador) return;

    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    contador.textContent = favoritos.length;
}

export function atualizarHeader() {
    atualizarCarrinhoHeader();
    atualizarFavoritosHeader();
}