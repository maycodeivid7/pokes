// Seleciona os elementos do HTML que serão manipulados pelo JavaScript.
// Isso permite acessar o formulário, o campo de busca e os elementos de resultado.
const formulario = document.getElementById('formulario-pesquisa');
const pokemonProcurado = document.getElementById('pesquisa-nome-pokemon');
const informacoesPokemon = document.getElementById('informacoes-pokemon');
const mensagemStatus = document.getElementById('mensagem-status');

// Limpa a lista de resultados para remover qualquer conteúdo anterior.
function limpaResultado() {
  informacoesPokemon.innerHTML = '';
}

// Exibe uma mensagem de feedback para o usuário.
// O parâmetro type define a classe CSS: 'error' ou 'success'.
function defineStatus(mensagem, type = 'error') {
  mensagemStatus.textContent = mensagem;
  mensagemStatus.classList.add('visible');
  mensagemStatus.classList.remove('error', 'success');
  mensagemStatus.classList.add(type);
}

// Remove a mensagem de status e esconde a caixa de aviso.
function limpaStatus() {
  mensagemStatus.textContent = '';
  mensagemStatus.classList.remove('visible', 'error', 'success');
}

// Recebe o objeto retornado pela API e monta a lista com os dados do Pokémon.
function renderizaPokemon(pokemon) {
  // Extrai apenas os nomes das habilidades e junta em uma string separada por vírgula.
  const habilidades = pokemon.abilities.map((ability) => ability.ability.name).join(', ');

  // A API retorna altura e peso em decímetros e hectogramas.
  // Dividindo por 10, convertemos para metros e quilos.
  const altura = (pokemon.height / 10).toFixed(1);
  const peso = (pokemon.weight / 10).toFixed(1);

  // Cria um array com os dados que serão exibidos na tela.
  const items = [
    { titulo: 'Nome', conteudo: pokemon.name },
    { titulo: 'ID', conteudo: pokemon.id },
    { titulo: 'Altura', conteudo: `${altura} m` },
    { titulo: 'Peso', conteudo: `${peso} kg` },
    { titulo: 'Habilidades', conteudo: habilidades }
  ];

  // Limpa qualquer resultado anterior antes de inserir os novos dados.
  limpaResultado();

  // Para cada item, cria um <li> e insere na lista de resultados.
  items.forEach(({ titulo, conteudo }) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${titulo}:</strong> ${conteudo}`;
    informacoesPokemon.appendChild(li);
  });

  // Mensagem de sucesso após a busca funcionar corretamente.
  defineStatus('Pokémon encontrado com sucesso!', 'success');
}

// Função assíncrona responsável por buscar o Pokémon na API.
// O evento é disparado quando o formulário é enviado.
async function searchPokemon(event) {
  // Previne o comportamento padrão do formulário, que recarregaria a página.
  event.preventDefault();

  // Lê o nome digitado, remove espaços em branco e converte para texto limpo.
  const name = pokemonProcurado.value.trim();

  // Se o usuário não digitou nada, exibe uma mensagem de erro.
  if (!name) {
    limpaResultado();
    defineStatus('Informe o nome do Pokémon antes de pesquisar.', 'error');
    return;
  }

  // Limpa qualquer aviso anterior antes de iniciar a nova consulta.
  limpaStatus();

  try {
    // Consulta a API pública do Pokémon usando o nome informado.
    // encodeURIComponent garante que nomes com caracteres especiais ou espaços sejam enviados corretamente.
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`);

    // Se a resposta não for bem-sucedida, verifica se é um erro de Pokémon não encontrado.
    if (!response.ok) {
      if (response.status === 404) {
        limpaResultado();
        defineStatus('Pokémon não encontrado. Verifique o nome informado.', 'error');
        return;
      }

      // Qualquer outro erro da API é tratado como falha geral.
      throw new Error('Erro ao consultar a API.');
    }

    // Converte a resposta da API em um objeto JavaScript.
    const pokemon = await response.json();

    // Chama a função que renderiza os dados na tela.
    renderizaPokemon(pokemon);
  } catch (error) {
    // Se houver falha de rede, erro de API ou qualquer problema, mostra uma mensagem ao usuário.
    limpaResultado();
    defineStatus(error.message || 'Ocorreu um erro na comunicação com a API.', 'error');
  }
}

// Escuta o evento de envio do formulário e chama a função de busca.
formulario.addEventListener('submit', searchPokemon);
