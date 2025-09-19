// Variáveis globais
let contadorCarrinho = 0;
let modoEscuro = false;


// 1. INICIALIZAÇÃO DA PÁGINA

document.addEventListener('DOMContentLoaded', function () {
  inicializarFuncionalidades();
});

function inicializarFuncionalidades() {
  // Adicionar data e hora no rodapé
  adicionarDataHora();

  // Configurar botões de compra
  configurarBotoesCompra();

  // Adicionar botão de tema
  adicionarBotaoTema();

  // Adicionar contador do carrinho
  adicionarContadorCarrinho();

  // Configurar validação de pesquisa (se existir)
  configurarPesquisa();

  // Adicionar seções de detalhes dos produtos
  adicionarDetalhesJogos();
}


// 2. FUNCIONALIDADE: DATA E HORA ATUAL

function adicionarDataHora() {
  const footer = document.querySelector('footer');
  if (footer) {
    const dataHoraDiv = document.createElement('div');
    dataHoraDiv.id = 'data-hora';
    dataHoraDiv.style.cssText = `
            background: rgba(0,0,0,0.1);
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        `;

    footer.insertBefore(dataHoraDiv, footer.firstChild);
    atualizarDataHora();

    // Atualizar a cada segundo
    setInterval(atualizarDataHora, 1000);
  }
}

function atualizarDataHora() {
  const agora = new Date();
  const opcoes = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const dataHoraFormatada = agora.toLocaleDateString('pt-BR', opcoes);
  const elementoDataHora = document.getElementById('data-hora');

  if (elementoDataHora) {
    elementoDataHora.innerHTML = `🕒 ${dataHoraFormatada}`;
  }
}


// 3. FUNCIONALIDADE: BOTÕES DE COMPRA

function configurarBotoesCompra() {
  const botoes = document.querySelectorAll('.jogo button');

  botoes.forEach((botao, index) => {
    botao.addEventListener('click', function () {
      const jogo = this.closest('.jogo');
      const nomeJogo = jogo.querySelector('h3').textContent;
      const precoJogo = jogo.querySelector('.preco').textContent;

      // Incrementar contador
      contadorCarrinho++;
      atualizarContadorCarrinho();

      // Mostrar confirmação
      mostrarConfirmacaoCompra(nomeJogo, precoJogo);

      // Adicionar efeito visual
      adicionarEfeitoCompra(this);
    });
  });
}

function mostrarConfirmacaoCompra(nome, preco) {
  const confirmacao = confirm(
    ` Adicionar "${nome}" ao carrinho?\n Preço: ${preco}\n\n Confirmar compra?`
  );

  if (confirmacao) {
    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso(nome);
  } else {
    // Decrementar contador se cancelar
    contadorCarrinho--;
    atualizarContadorCarrinho();
  }
}

function mostrarMensagemSucesso(nome) {

  const notificacao = document.createElement('div');
  notificacao.innerHTML = ` "${nome}" adicionado ao carrinho!`;
  notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(notificacao);

  // Remover após 3 segundos
  setTimeout(() => {
    notificacao.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, 3000);
}

function adicionarEfeitoCompra(botao) {
  botao.style.transform = 'scale(0.95)';
  botao.style.background = '#4CAF50';

  setTimeout(() => {
    botao.style.transform = 'scale(1)';
    botao.style.background = '';
  }, 200);
}


// 4. FUNCIONALIDADE: CONTADOR DO CARRINHO

function adicionarContadorCarrinho() {
  const header = document.querySelector('header');
  if (header) {
    const contadorDiv = document.createElement('div');
    contadorDiv.id = 'contador-carrinho';
    contadorDiv.innerHTML = `🛒 Carrinho: <span id="numero-carrinho">0</span>`;
    contadorDiv.style.cssText = `
            position: absolute;
            top: 10px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        `;

    header.style.position = 'relative';
    header.appendChild(contadorDiv);
  }
}

function atualizarContadorCarrinho() {
  const numeroCarrinho = document.getElementById('numero-carrinho');
  if (numeroCarrinho) {
    numeroCarrinho.textContent = contadorCarrinho;

    // Efeito de animação
    numeroCarrinho.style.transform = 'scale(1.3)';
    setTimeout(() => {
      numeroCarrinho.style.transform = 'scale(1)';
    }, 200);
  }
}


// 5. FUNCIONALIDADE: MODO ESCURO/CLARO

function adicionarBotaoTema() {
  const body = document.body;
  const botaoTema = document.createElement('button');
  botaoTema.id = 'botao-tema';
  botaoTema.innerHTML = '🌙';
  botaoTema.title = 'Alternar tema';
  botaoTema.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: #333;
        color: white;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    `;

  botaoTema.addEventListener('click', alternarTema);
  body.appendChild(botaoTema);
}

function alternarTema() {
  const body = document.body;
  const botaoTema = document.getElementById('botao-tema');

  modoEscuro = !modoEscuro;

  if (modoEscuro) {
    // Aplicar modo escuro
    body.style.cssText += `
            background: #1a1a1a !important;
            color: #ffffff !important;
        `;

    // Estilizar elementos específicos
    const elementos = document.querySelectorAll(
      'header, footer, .jogo, .hero, .contato-info'
    );
    elementos.forEach((el) => {
      el.style.background = '#2d2d2d';
      el.style.color = '#ffffff';
    });

    botaoTema.innerHTML = '☀️';
    botaoTema.style.background = '#ffd700';
    botaoTema.style.color = '#333';
  } else {
    // Voltar ao modo claro
    body.style.cssText = '';

    const elementos = document.querySelectorAll(
      'header, footer, .jogo, .hero, .contato-info'
    );
    elementos.forEach((el) => {
      el.style.background = '';
      el.style.color = '';
    });

    botaoTema.innerHTML = '🌙';
    botaoTema.style.background = '#333';
    botaoTema.style.color = 'white';
  }
}

// 6. FUNCIONALIDADE: DETALHES DOS JOGOS

function adicionarDetalhesJogos() {
  const jogos = document.querySelectorAll('.jogo');

  jogos.forEach((jogo, index) => {
    // Adicionar botão "Ver Detalhes"
    const botaoDetalhes = document.createElement('button');
    botaoDetalhes.textContent = 'Ver Detalhes';
    botaoDetalhes.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 15px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
        `;

    // Criar seção de detalhes (inicialmente oculta)
    const detalhes = document.createElement('div');
    detalhes.className = 'detalhes-jogo';
    detalhes.style.display = 'none';
    detalhes.style.cssText += `
            margin-top: 10px;
            padding: 15px;
            background: rgba(0,0,0,0.05);
            border-radius: 5px;
            font-size: 14px;
        `;

    // Adicionar conteúdo dos detalhes baseado no jogo
    const detalhesConteudo = obterDetalhesJogo(index);
    detalhes.innerHTML = detalhesConteudo;

    // Adicionar evento de clique
    botaoDetalhes.addEventListener('click', function () {
      if (detalhes.style.display === 'none') {
        detalhes.style.display = 'block';
        this.textContent = 'Ocultar Detalhes';
      } else {
        detalhes.style.display = 'none';
        this.textContent = 'Ver Detalhes';
      }
    });

    // Inserir elementos no jogo
    jogo.appendChild(botaoDetalhes);
    jogo.appendChild(detalhes);
  });
}

function obterDetalhesJogo(index) {
  const detalhes = [
    {
      titulo: 'FIFA 24',
      info: '🏆 <strong>Gênero:</strong> Esportes<br>👥 <strong>Modo:</strong> Single/Multiplayer<br>💾 <strong>Tamanho:</strong> 50GB<br>⭐ <strong>Avaliação:</strong> 4.5/5',
    },
    {
      titulo: 'Call of Duty',
      info: '🎯 <strong>Gênero:</strong> FPS/Ação<br>👥 <strong>Modo:</strong> Multiplayer<br>💾 <strong>Tamanho:</strong> 80GB<br>⭐ <strong>Avaliação:</strong> 4.7/5',
    },
    {
      titulo: 'Minecraft',
      info: '🏗️ <strong>Gênero:</strong> Sandbox<br>👥 <strong>Modo:</strong> Single/Multiplayer<br>💾 <strong>Tamanho:</strong> 1GB<br>⭐ <strong>Avaliação:</strong> 4.8/5',
    },
    {
      titulo: 'GTA V',
      info: '🌆 <strong>Gênero:</strong> Ação/Aventura<br>👥 <strong>Modo:</strong> Single/Multiplayer<br>💾 <strong>Tamanho:</strong> 95GB<br>⭐ <strong>Avaliação:</strong> 4.6/5',
    },
    {
      titulo: 'Fortnite',
      info: '⚔️ <strong>Gênero:</strong> Battle Royale<br>�� <strong>Modo:</strong> Multiplayer<br>💾 <strong>Tamanho:</strong> 30GB<br>⭐ <strong>Avaliação:</strong> 4.3/5',
    },
    {
      titulo: 'Cyberpunk 2077',
      info: '🤖 <strong>Gênero:</strong> RPG<br>👥 <strong>Modo:</strong> Single Player<br>💾 <strong>Tamanho:</strong> 70GB<br>⭐ <strong>Avaliação:</strong> 4.2/5',
    },
  ];

  return detalhes[index] ? detalhes[index].info : 'Detalhes não disponíveis';
}


// 7. FUNCIONALIDADE: PESQUISA 

function configurarPesquisa() {
  // Adicionar campo de pesquisa se não existir
  const header = document.querySelector('header nav');
  if (header && !document.getElementById('campo-pesquisa')) {
    const campoPesquisa = document.createElement('input');
    campoPesquisa.type = 'text';
    campoPesquisa.id = 'campo-pesquisa';
    campoPesquisa.placeholder = 'Pesquisar jogos...';
    campoPesquisa.style.cssText = `
            margin-left: 20px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        `;

    campoPesquisa.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') {
        validarPesquisa(this.value);
      }
    });

    header.appendChild(campoPesquisa);
  }
}

function validarPesquisa(termo) {
  if (termo.trim() === '') {
    alert('⚠️ Por favor, digite algo para pesquisar!');
    return;
  }

  if (termo.length < 3) {
    alert('⚠️ Digite pelo menos 3 caracteres para pesquisar!');
    return;
  }


  const jogosEncontrados = [
    'FIFA 24',
    'Call of Duty',
    'Minecraft',
    'GTA V',
    'Fortnite',
    'Cyberpunk 2077',
  ].filter((jogo) => jogo.toLowerCase().includes(termo.toLowerCase()));

  if (jogosEncontrados.length > 0) {
    alert(
      `🎮 Encontrados ${
        jogosEncontrados.length
      } jogo(s):\n${jogosEncontrados.join('\n')}`
    );
  } else {
    alert('😞 Nenhum jogo encontrado com esse termo!');
  }
}


// 8. ANIMAÇÕES CSS (ADICIONAR AO STYLE)

function adicionarAnimacoes() {
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        #contador-carrinho {
            transition: all 0.3s ease;
        }
        
        #botao-tema:hover {
            transform: scale(1.1);
        }
        
        .jogo button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    `;

  document.head.appendChild(style);
}

// Adicionar animações quando a página carregar
document.addEventListener('DOMContentLoaded', adicionarAnimacoes);
