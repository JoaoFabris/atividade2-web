// ========================================
// GAMESTORE - GERENCIAMENTO DE APIS
// ========================================

/**
 * Classe responsável por gerenciar todas as chamadas de API
 * Implementa padrão Singleton para garantir uma única instância
 */
class ApiManager {
  constructor() {
    if (ApiManager.instance) {
      return ApiManager.instance;
    }

    this.baseUrls = {
      products: 'https://fakestoreapi.com/products',
      users: 'https://randomuser.me/api',
    };

    this.cache = new Map();
    this.requestTimeout = 10000; // 10 segundos

    ApiManager.instance = this;
  }

  /**
   * Método genérico para fazer requisições HTTP
   * @param {string} url - URL da API
   * @param {Object} options - Opções da requisição
   * @returns {Promise} - Dados da resposta
   */
  async makeRequest(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;

    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < 300000) {
        // 5 minutos
        return cachedData.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.requestTimeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Armazenar no cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw new Error(`Falha ao carregar dados: ${error.message}`);
    }
  }

  /**
   * Buscar produtos da Fake Store API
   * @param {number} limit - Limite de produtos
   * @returns {Promise<Array>} - Lista de produtos
   */
  async fetchProducts(limit = 6) {
    try {
      const url = `${this.baseUrls.products}?limit=${limit}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Buscar todos os produtos para catálogo
   * @returns {Promise<Array>} - Lista completa de produtos
   */
  async fetchAllProducts() {
    try {
      return await this.makeRequest(this.baseUrls.products);
    } catch (error) {
      console.error('Erro ao buscar catálogo:', error);
      return [];
    }
  }

  /**
   * Buscar produtos por categoria
   * @param {string} category - Categoria dos produtos
   * @returns {Promise<Array>} - Produtos da categoria
   */
  async fetchProductsByCategory(category) {
    try {
      const url = `${this.baseUrls.products}/category/${category}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }
  }

  /**
   * Buscar usuários aleatórios
   * @param {number} results - Número de usuários
   * @returns {Promise<Array>} - Lista de usuários
   */
  async fetchRandomUsers(results = 6) {
    try {
      const url = `${this.baseUrls.users}?results=${results}`;
      const response = await this.makeRequest(url);
      return response.results || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Buscar categorias disponíveis
   * @returns {Promise<Array>} - Lista de categorias
   */
  async fetchCategories() {
    try {
      const url = `${this.baseUrls.products}/categories`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }
}

/**
 * Classe para renderizar produtos na interface
 */
class ProductRenderer {
  constructor() {
    this.currencyFormatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Renderizar produtos em destaque na página inicial
   * @param {Array} products - Lista de produtos
   * @param {string} containerId - ID do container
   */
  renderFeaturedProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    products.forEach((product, index) => {
      const productElement = this.createProductElement(product, 'featured');
      productElement.style.animationDelay = `${index * 0.1}s`;
      productElement.classList.add('fade-in');
      container.appendChild(productElement);
    });
  }

  /**
   * Renderizar catálogo completo de produtos
   * @param {Array} products - Lista de produtos
   * @param {string} containerId - ID do container
   */
  renderProductCatalog(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    products.forEach((product, index) => {
      const productElement = this.createProductElement(product, 'catalog');
      productElement.style.animationDelay = `${index * 0.05}s`;
      productElement.classList.add('fade-in');
      productElement.dataset.category = product.category;
      container.appendChild(productElement);
    });
  }

  /**
   * Criar elemento HTML para um produto
   * @param {Object} product - Dados do produto
   * @param {string} type - Tipo de renderização
   * @returns {HTMLElement} - Elemento do produto
   */
  createProductElement(product, type = 'featured') {
    const article = document.createElement('article');
    article.className =
      type === 'featured' ? 'produto-api' : 'jogo produto-api';

    const price = this.currencyFormatter.format(product.price * 5.5); // Conversão USD para BRL
    const rating = this.createRatingStars(product.rating?.rate || 4);
    const shortDescription = this.truncateText(product.description, 100);

    article.innerHTML = `
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            <h3>${this.truncateText(product.title, 50)}</h3>
            <p>${shortDescription}</p>
            <div class="rating">
                <span class="stars">${rating}</span>
                <span>(${product.rating?.count || 0})</span>
            </div>
            <div class="preco">${price}</div>
            <button class="btn-comprar" data-product-id="${product.id}">
                Comprar
            </button>
            <button class="btn-detalhes" onclick="toggleProductDetails(${
              product.id
            })">
                Ver Detalhes
            </button>
            <div class="detalhes-jogo" id="detalhes-${
              product.id
            }" style="display: none;">
                <strong>Categoria:</strong> ${product.category}<br>
                <strong>Descrição completa:</strong> ${product.description}
            </div>
        `;

    return article;
  }

  /**
   * Criar estrelas de avaliação
   * @param {number} rating - Nota do produto
   * @returns {string} - HTML das estrelas
   */
  createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
    );
  }

  /**
   * Truncar texto para exibição
   * @param {string} text - Texto original
   * @param {number} maxLength - Tamanho máximo
   * @returns {string} - Texto truncado
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}

/**
 * Classe para renderizar usuários
 */
class UserRenderer {
  /**
   * Renderizar usuários online
   * @param {Array} users - Lista de usuários
   * @param {string} containerId - ID do container
   */
  renderOnlineUsers(users, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    users.forEach((user, index) => {
      const userElement = this.createUserElement(user);
      userElement.style.animationDelay = `${index * 0.1}s`;
      userElement.classList.add('fade-in');
      container.appendChild(userElement);
    });
  }

  /**
   * Criar elemento HTML para um usuário
   * @param {Object} user - Dados do usuário
   * @returns {HTMLElement} - Elemento do usuário
   */
  createUserElement(user) {
    const div = document.createElement('div');
    div.className = 'usuario-card';

    const fullName = `${user.name.first} ${user.name.last}`;
    const location = `${user.location.city}, ${user.location.country}`;

    div.innerHTML = `
            <img src="${user.picture.medium}" alt="Foto de ${fullName}" loading="lazy">
            <h4>${fullName}</h4>
            <p>📍 ${location}</p>
            <p>🎮 Online agora</p>
        `;

    return div;
  }
}

/**
 * Classe principal para gerenciar o carregamento de dados
 */
class DataLoader {
  constructor() {
    this.apiManager = new ApiManager();
    this.productRenderer = new ProductRenderer();
    this.userRenderer = new UserRenderer();
    this.isLoading = false;
  }

  /**
   * Inicializar carregamento de dados baseado na página atual
   */
  async initializePageData() {
    const currentPage = this.getCurrentPage();

    try {
      switch (currentPage) {
        case 'index':
          await this.loadHomepageData();
          break;
        case 'produtos':
          await this.loadProductsPageData();
          break;
        default:
          console.log('Página sem dados de API específicos');
      }
    } catch (error) {
      console.error('Erro ao inicializar dados da página:', error);
      this.showErrorMessage(
        'Erro ao carregar dados. Tente novamente mais tarde.'
      );
    }
  }

  /**
   * Carregar dados da página inicial
   */
  async loadHomepageData() {
    const loadingPromises = [
      this.loadFeaturedProducts(),
      this.loadOnlineUsers(),
    ];

    await Promise.allSettled(loadingPromises);
  }

  /**
   * Carregar dados da página de produtos
   */
  async loadProductsPageData() {
    await this.loadAllProducts();
    this.setupCategoryFilters();
  }

  /**
   * Carregar produtos em destaque
   */
  async loadFeaturedProducts() {
    const loadingElement = document.getElementById('loading-destaque');
    const containerElement = document.getElementById('produtos-api');

    if (!containerElement) return;

    try {
      if (loadingElement) loadingElement.style.display = 'block';

      const products = await this.apiManager.fetchProducts(6);

      if (products.length > 0) {
        this.productRenderer.renderFeaturedProducts(products, 'produtos-api');
      } else {
        containerElement.innerHTML =
          '<p>Nenhum produto encontrado no momento.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar produtos em destaque:', error);
      containerElement.innerHTML =
        '<p>Erro ao carregar produtos em destaque.</p>';
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }

  /**
   * Carregar usuários online
   */
  async loadOnlineUsers() {
    const loadingElement = document.getElementById('loading-usuarios');
    const containerElement = document.getElementById('usuarios-api');

    if (!containerElement) return;

    try {
      if (loadingElement) loadingElement.style.display = 'block';

      const users = await this.apiManager.fetchRandomUsers(6);

      if (users.length > 0) {
        this.userRenderer.renderOnlineUsers(users, 'usuarios-api');
      } else {
        containerElement.innerHTML = '<p>Nenhum usuário online no momento.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error);
      containerElement.innerHTML = '<p>Erro ao carregar usuários online.</p>';
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }

  /**
   * Carregar todos os produtos para o catálogo
   */
  async loadAllProducts() {
    const loadingElement = document.getElementById('loading-produtos');
    const containerElement = document.getElementById('produtos-completos');

    if (!containerElement) return;

    try {
      if (loadingElement) loadingElement.style.display = 'block';

      const products = await this.apiManager.fetchAllProducts();

      if (products.length > 0) {
        this.productRenderer.renderProductCatalog(
          products,
          'produtos-completos'
        );
      } else {
        containerElement.innerHTML =
          '<p>Nenhum produto encontrado no catálogo.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar catálogo completo:', error);
      containerElement.innerHTML =
        '<p>Erro ao carregar catálogo de produtos.</p>';
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }

  /**
   * Configurar filtros de categoria
   */
  setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filtro-btn');

    filterButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        this.handleCategoryFilter(e.target.dataset.categoria);

        // Atualizar botão ativo
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  /**
   * Filtrar produtos por categoria
   * @param {string} category - Categoria selecionada
   */
  handleCategoryFilter(category) {
    const products = document.querySelectorAll('.produto-api');

    products.forEach((product) => {
      if (category === 'todos' || product.dataset.category === category) {
        product.style.display = 'block';
        product.classList.add('fade-in');
      } else {
        product.style.display = 'none';
        product.classList.remove('fade-in');
      }
    });
  }

  /**
   * Obter página atual baseada na URL
   * @returns {string} - Nome da página atual
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
  }

  /**
   * Mostrar mensagem de erro para o usuário
   * @param {string} message - Mensagem de erro
   */
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-weight: bold;
        `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Remover após 5 segundos
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Limpar cache de dados
   */
  clearCache() {
    this.apiManager.cache.clear();
    console.log('Cache de API limpo');
  }
}

/**
 * Função global para alternar detalhes do produto
 * @param {number} productId - ID do produto
 */
function toggleProductDetails(productId) {
  const detailsElement = document.getElementById(`detalhes-${productId}`);
  const button = document.querySelector(
    `button[onclick="toggleProductDetails(${productId})"]`
  );

  if (detailsElement && button) {
    if (detailsElement.style.display === 'none') {
      detailsElement.style.display = 'block';
      button.textContent = 'Ocultar Detalhes';
      detailsElement.classList.add('fade-in');
    } else {
      detailsElement.style.display = 'none';
      button.textContent = 'Ver Detalhes';
      detailsElement.classList.remove('fade-in');
    }
  }
}

// Instância global do carregador de dados
const dataLoader = new DataLoader();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  dataLoader.initializePageData();
});

// Exportar classes para uso em outros arquivos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ApiManager,
    ProductRenderer,
    UserRenderer,
    DataLoader,
  };
}
