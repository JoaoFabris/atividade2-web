// ========================================
// GAMESTORE - FUNCIONALIDADES PRINCIPAIS
// Aplicando princípios de Clean Code
// ========================================

/**
 * Classe principal para gerenciar funcionalidades da GameStore
 * Implementa padrão de responsabilidade única
 */
class GameStoreManager {
    constructor() {
        this.cartCounter = 0;
        this.isDarkMode = false;
        this.isInitialized = false;
        
        // Configurações
        this.config = {
            animationDelay: 200,
            notificationDuration: 3000,
            clockUpdateInterval: 1000
        };

        // Elementos DOM cachados
        this.elements = {};
        
        this.initializeApplication();
    }

    /**
     * Inicializar aplicação quando DOM estiver pronto
     */
    initializeApplication() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApplication());
        } else {
            this.setupApplication();
        }
    }

    /**
     * Configurar todas as funcionalidades da aplicação
     */
    setupApplication() {
        if (this.isInitialized) return;

        try {
            this.cacheElements();
            this.setupDateTime();
            this.setupShoppingCart();
            this.setupThemeToggle();
            this.setupSearchFunctionality();
            this.setupProductDetails();
            this.setupContactForm();
            this.addCustomStyles();
            
            this.isInitialized = true;
            console.log('GameStore inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar GameStore:', error);
        }
    }

    /**
     * Cachear elementos DOM para melhor performance
     */
    cacheElements() {
        this.elements = {
            body: document.body,
            header: document.querySelector('header'),
            footer: document.querySelector('footer'),
            main: document.querySelector('main'),
            buyButtons: document.querySelectorAll('.btn-comprar, .jogo button'),
            productCards: document.querySelectorAll('.jogo, .produto-api'),
            navigationLinks: document.querySelectorAll('nav a'),
            contactForm: document.getElementById('form-contato')
        };
    }

    // ========================================
    // FUNCIONALIDADE: DATA E HORA
    // ========================================

    /**
     * Configurar exibição de data e hora
     */
    setupDateTime() {
        this.createDateTimeDisplay();
        this.startClockUpdate();
    }

    /**
     * Criar elemento para exibir data e hora
     */
    createDateTimeDisplay() {
        if (!this.elements.footer) return;

        const dateTimeContainer = this.createElement('div', {
            id: 'data-hora',
            className: 'date-time-display',
            styles: {
                background: 'rgba(0,0,0,0.1)',
                padding: '1rem',
                margin: '1rem 0',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.95rem'
            }
        });

        this.elements.footer.insertBefore(dateTimeContainer, this.elements.footer.firstChild);
        this.elements.dateTime = dateTimeContainer;
    }

    /**
     * Iniciar atualização do relógio
     */
    startClockUpdate() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), this.config.clockUpdateInterval);
    }

    /**
     * Atualizar exibição de data e hora
     */
    updateDateTime() {
        if (!this.elements.dateTime) return;

        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo'
        };

        const formattedDateTime = now.toLocaleDateString('pt-BR', options);
        this.elements.dateTime.innerHTML = `🕒 ${formattedDateTime}`;
    }

    // ========================================
    // FUNCIONALIDADE: CARRINHO DE COMPRAS
    // ========================================

    /**
     * Configurar funcionalidades do carrinho
     */
    setupShoppingCart() {
        this.createCartCounter();
        this.bindPurchaseEvents();
    }

    /**
     * Criar contador visual do carrinho
     */
    createCartCounter() {
        if (!this.elements.header) return;

        const cartCounter = this.createElement('div', {
            id: 'contador-carrinho',
            className: 'cart-counter',
            innerHTML: '🛒 Carrinho: <span id="numero-carrinho">0</span>',
            styles: {
                position: 'absolute',
                top: '10px',
                right: '20px',
                background: '#e74c3c',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }
        });

        this.elements.header.style.position = 'relative';
        this.elements.header.appendChild(cartCounter);
        this.elements.cartCounter = cartCounter;
        this.elements.cartNumber = document.getElementById('numero-carrinho');
    }

    /**
     * Vincular eventos de compra aos botões
     */
    bindPurchaseEvents() {
        // Botões existentes
        this.elements.buyButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePurchaseClick(e));
        });

        // Observer para novos botões (produtos da API)
        this.observeNewButtons();
    }

    /**
     * Observar novos botões adicionados dinamicamente
     */
    observeNewButtons() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const newButtons = node.querySelectorAll?.('.btn-comprar') || [];
                        newButtons.forEach(button => {
                            button.addEventListener('click', (e) => this.handlePurchaseClick(e));
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Gerenciar clique em botão de compra
     * @param {Event} event - Evento de clique
     */
    handlePurchaseClick(event) {
        const button = event.target;
        const productCard = button.closest('.jogo, .produto-api');
        
        if (!productCard) return;

        const productInfo = this.extractProductInfo(productCard);
        
        if (this.showPurchaseConfirmation(productInfo)) {
            this.addToCart(productInfo);
            this.showSuccessNotification(productInfo.name);
            this.addPurchaseAnimation(button);
        }
    }

    /**
     * Extrair informações do produto
     * @param {HTMLElement} productCard - Card do produto
     * @returns {Object} - Informações do produto
     */
    extractProductInfo(productCard) {
        const nameElement = productCard.querySelector('h3');
        const priceElement = productCard.querySelector('.preco');
        const imageElement = productCard.querySelector('img');

        return {
            name: nameElement?.textContent || 'Produto',
            price: priceElement?.textContent || 'Preço não disponível',
            image: imageElement?.src || '',
            id: productCard.dataset?.productId || Date.now()
        };
    }

    /**
     * Mostrar confirmação de compra
     * @param {Object} productInfo - Informações do produto
     * @returns {boolean} - Se a compra foi confirmada
     */
    showPurchaseConfirmation(productInfo) {
        const message = `🎮 Adicionar "${productInfo.name}" ao carrinho?\n💰 Preço: ${productInfo.price}\n\n✅ Confirmar compra?`;
        return confirm(message);
    }

    /**
     * Adicionar produto ao carrinho
     * @param {Object} productInfo - Informações do produto
     */
    addToCart(productInfo) {
        this.cartCounter++;
        this.updateCartDisplay();
        
        // Salvar no localStorage (persistência)
        this.saveCartToStorage();
    }

    /**
     * Atualizar exibição do contador
     */
    updateCartDisplay() {
        if (this.elements.cartNumber) {
            this.elements.cartNumber.textContent = this.cartCounter;
            
            // Animação do contador
            this.elements.cartNumber.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.elements.cartNumber.style.transform = 'scale(1)';
            }, this.config.animationDelay);
        }
    }

    /**
     * Salvar carrinho no localStorage
     */
    saveCartToStorage() {
        try {
            localStorage.setItem('gamestore_cart_count', this.cartCounter.toString());
        } catch (error) {
            console.warn('Não foi possível salvar o carrinho:', error);
        }
    }

    /**
     * Carregar carrinho do localStorage
     */
    loadCartFromStorage() {
        try {
            const savedCount = localStorage.getItem('gamestore_cart_count');
            if (savedCount) {
                this.cartCounter = parseInt(savedCount, 10) || 0;
                this.updateCartDisplay();
            }
        } catch (error) {
            console.warn('Não foi possível carregar o carrinho:', error);
        }
    }

    // ========================================
    // FUNCIONALIDADE: TEMA ESCURO/CLARO
    // ========================================

    /**
     * Configurar alternador de tema
     */
    setupThemeToggle() {
        this.createThemeButton();
        this.loadThemePreference();
    }

    /**
     * Criar botão de alternância de tema
     */
    createThemeButton() {
        const themeButton = this.createElement('button', {
            id: 'botao-tema',
            className: 'theme-toggle',
            innerHTML: '🌙',
            title: 'Alternar tema',
            styles: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                background: '#2c3e50',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: '1000',
                transition: 'all 0.3s ease'
            }
        });

        themeButton.addEventListener('click', () => this.toggleTheme());
        themeButton.addEventListener('mouseenter', () => {
            themeButton.style.transform = 'scale(1.1)';
        });
        themeButton.addEventListener('mouseleave', () => {
            themeButton.style.transform = 'scale(1)';
        });

        this.elements.body.appendChild(themeButton);
        this.elements.themeButton = themeButton;
    }

    /**
     * Alternar entre tema claro e escuro
     */
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.saveThemePreference();
    }

    /**
     * Aplicar tema atual
     */
    applyTheme() {
        const { body, themeButton } = this.elements;

        if (this.isDarkMode) {
            this.applyDarkTheme(body, themeButton);
        } else {
            this.applyLightTheme(body, themeButton);
        }
    }

    /**
     * Aplicar tema escuro
     * @param {HTMLElement} body - Elemento body
     * @param {HTMLElement} button - Botão de tema
     */
    applyDarkTheme(body, button) {
        body.style.cssText += `
            background: #1a1a1a !important;
            color: #ffffff !important;
            transition: all 0.3s ease;
        `;

        const elementsToStyle = document.querySelectorAll(`
            header, footer, .jogo, .produto-api, .hero, 
            .contato-info, .info-item, .formulario-contato,
            .produtos-destaque, .usuarios-online, .usuario-card
        `);
        
        elementsToStyle.forEach(el => {
            el.style.background = '#2d2d2d';
            el.style.color = '#ffffff';
            el.style.borderColor = '#444';
        });

        button.innerHTML = '☀️';
        button.style.background = '#ffd700';
        button.style.color = '#333';
    }

    /**
     * Aplicar tema claro
     * @param {HTMLElement} body - Elemento body
     * @param {HTMLElement} button - Botão de tema
     */
    applyLightTheme(body, button) {
        body.style.cssText = '';

        const elementsToStyle = document.querySelectorAll(`
            header, footer, .jogo, .produto-api, .hero, 
            .contato-info, .info-item, .formulario-contato,
            .produtos-destaque, .usuarios-online, .usuario-card
        `);
        
        elementsToStyle.forEach(el => {
            el.style.background = '';
            el.style.color = '';
            el.style.borderColor = '';
        });

        button.innerHTML = '🌙';
        button.style.background = '#2c3e50';
        button.style.color = 'white';
    }

    /**
     * Salvar preferência de tema
     */
    saveThemePreference() {
        try {
            localStorage.setItem('gamestore_theme', this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.warn('Não foi possível salvar preferência de tema:', error);
        }
    }

    /**
     * Carregar preferência de tema
     */
    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('gamestore_theme');
            if (savedTheme === 'dark') {
                this.isDarkMode = true;
                this.applyTheme();
            }
        } catch (error) {
            console.warn('Não foi possível carregar preferência de tema:', error);
        }
    }

    // ========================================
    // FUNCIONALIDADE: PESQUISA
    // ========================================

    /**
     * Configurar funcionalidade de pesquisa
     */
    setupSearchFunctionality() {
        this.createSearchField();
    }

    /**
     * Criar campo de pesquisa
     */
    createSearchField() {
        const navigation = document.querySelector('header nav');
        if (!navigation || document.getElementById('campo-pesquisa')) return;

        const searchInput = this.createElement('input', {
            type: 'text',
            id: 'campo-pesquisa',
            placeholder: 'Pesquisar jogos...',
            styles: {
                marginLeft: '1rem',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease'
            }
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });

        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = '#3498db';
            searchInput.style.boxShadow = '0 0 0 2px rgba(52, 152, 219, 0.2)';
        });

        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = 'none';
        });

        navigation.appendChild(searchInput);
    }

    /**
     * Realizar pesquisa
     * @param {string} searchTerm - Termo de pesquisa
     */
    performSearch(searchTerm) {
        if (!this.validateSearchTerm(searchTerm)) return;

        const gamesList = [
            'FIFA 24', 'Call of Duty', 'Minecraft', 'GTA V', 
            'Fortnite', 'Cyberpunk 2077', 'The Witcher 3',
            'Red Dead Redemption 2', 'Assassin\'s Creed'
        ];

        const results = this.filterGames(gamesList, searchTerm);
        this.displaySearchResults(results, searchTerm);
    }

    /**
     * Validar termo de pesquisa
     * @param {string} term - Termo a ser validado
     * @returns {boolean} - Se o termo é válido
     */
    validateSearchTerm(term) {
        const trimmedTerm = term.trim();

        if (trimmedTerm === '') {
            this.showNotification('⚠️ Por favor, digite algo para pesquisar!', 'warning');
            return false;
        }

        if (trimmedTerm.length < 3) {
            this.showNotification('⚠️ Digite pelo menos 3 caracteres para pesquisar!', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Filtrar jogos baseado no termo
     * @param {Array} games - Lista de jogos
     * @param {string} term - Termo de pesquisa
     * @returns {Array} - Jogos filtrados
     */
    filterGames(games, term) {
        return games.filter(game => 
            game.toLowerCase().includes(term.toLowerCase())
        );
    }

    /**
     * Exibir resultados da pesquisa
     * @param {Array} results - Resultados encontrados
     * @param {string} searchTerm - Termo pesquisado
     */
    displaySearchResults(results, searchTerm) {
        if (results.length > 0) {
            const message = `🎮 Encontrados ${results.length} jogo(s) para "${searchTerm}":\n\n${results.join('\n')}`;
            this.showNotification(message, 'success');
        } else {
            this.showNotification(`😞 Nenhum jogo encontrado para "${searchTerm}"!`, 'info');
        }
    }

    // ========================================
    // FUNCIONALIDADE: DETALHES DOS PRODUTOS
    // ========================================

    /**
     * Configurar detalhes expandíveis dos produtos
     */
    setupProductDetails() {
        this.addDetailsToExistingProducts();
    }

    /**
     * Adicionar detalhes aos produtos existentes
     */
    addDetailsToExistingProducts() {
        const localProducts = document.querySelectorAll('.jogo:not(.produto-api)');
        
        localProducts.forEach((product, index) => {
            this.addProductDetailsSection(product, index);
        });
    }

    /**
     * Adicionar seção de detalhes a um produto
     * @param {HTMLElement} productElement - Elemento do produto
     * @param {number} index - Índice do produto
     */
    addProductDetailsSection(productElement, index) {
        const detailsButton = this.createElement('button', {
            className: 'btn-detalhes',
            textContent: 'Ver Detalhes',
            styles: {
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                margin: '0.3rem',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }
        });

        const detailsSection = this.createElement('div', {
            className: 'detalhes-jogo',
            innerHTML: this.getProductDetails(index),
            styles: {
                display: 'none',
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(52, 152, 219, 0.05)',
                borderLeft: '4px solid #3498db',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.9rem'
            }
        });

        detailsButton.addEventListener('click', () => {
            this.toggleProductDetails(detailsSection, detailsButton);
        });

        productElement.appendChild(detailsButton);
        productElement.appendChild(detailsSection);
    }

    /**
     * Alternar visibilidade dos detalhes
     * @param {HTMLElement} detailsSection - Seção de detalhes
     * @param {HTMLElement} button - Botão de alternância
     */
    toggleProductDetails(detailsSection, button) {
        const isVisible = detailsSection.style.display !== 'none';

        if (isVisible) {
            detailsSection.style.display = 'none';
            button.textContent = 'Ver Detalhes';
        } else {
            detailsSection.style.display = 'block';
            button.textContent = 'Ocultar Detalhes';
            detailsSection.classList.add('fade-in');
        }
    }

    /**
     * Obter detalhes do produto baseado no índice
     * @param {number} index - Índice do produto
     * @returns {string} - HTML dos detalhes
     */
    getProductDetails(index) {
        const productDetails = [
            {
                genre: 'Esportes',
                mode: 'Single/Multiplayer',
                size: '50GB',
                rating: '4.5/5',
                features: 'Ultimate Team, Career Mode, Volta Football'
            },
            {
                genre: 'FPS/Ação',
                mode: 'Multiplayer',
                size: '80GB',
                rating: '4.7/5',
                features: 'Warzone, Multiplayer, Campanha'
            },
            {
                genre: 'Sandbox',
                mode: 'Single/Multiplayer',
                size: '1GB',
                rating: '4.8/5',
                features: 'Modo Criativo, Sobrevivência, Redstone'
            },
            {
                genre: 'Ação/Aventura',
                mode: 'Single/Multiplayer',
                size: '95GB',
                rating: '4.6/5',
                features: 'Mundo Aberto, GTA Online, Mods'
            },
            {
                genre: 'Battle Royale',
                mode: 'Multiplayer',
                size: '30GB',
                rating: '4.3/5',
                features: 'Battle Royale, Modo Criativo, Eventos'
            },
            {
                genre: 'RPG',
                mode: 'Single Player',
                size: '70GB',
                rating: '4.2/5',
                features: 'Mundo Aberto, Customização, História Ramificada'
            }
        ];

        const details = productDetails[index] || productDetails[0];

        return `
            <strong>🎮 Gênero:</strong> ${details.genre}<br>
            <strong>👥 Modo:</strong> ${details.mode}<br>
            <strong>💾 Tamanho:</strong> ${details.size}<br>
            <strong>⭐ Avaliação:</strong> ${details.rating}<br>
            <strong>🎯 Características:</strong> ${details.features}
        `;
    }

    // ========================================
    // FUNCIONALIDADE: FORMULÁRIO DE CONTATO
    // ========================================

    /**
     * Configurar formulário de contato
     */
    setupContactForm() {
        if (!this.elements.contactForm) return;

        this.elements.contactForm.addEventListener('submit', (e) => {
            this.handleContactFormSubmit(e);
        });

        this.addFormValidation();
    }

    /**
     * Gerenciar envio do formulário
     * @param {Event} event - Evento de submit
     */
    handleContactFormSubmit(event) {
        event.preventDefault();

        const formData = this.extractFormData();
        
        if (this.validateFormData(formData)) {
            this.simulateFormSubmission(formData);
        }
    }

    /**
     * Extrair dados do formulário
     * @returns {Object} - Dados do formulário
     */
    extractFormData() {
        return {
            name: document.getElementById('nome')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            message: document.getElementById('mensagem')?.value.trim() || ''
        };
    }

    /**
     * Validar dados do formulário
     * @param {Object} data - Dados a serem validados
     * @returns {boolean} - Se os dados são válidos
     */
    validateFormData(data) {
        if (!data.name) {
            this.showNotification('❌ Por favor, preencha seu nome!', 'error');
            return false;
        }

        if (!this.isValidEmail(data.email)) {
            this.showNotification('❌ Por favor, insira um email válido!', 'error');
            return false;
        }

        if (data.message.length < 10) {
            this.showNotification('❌ A mensagem deve ter pelo menos 10 caracteres!', 'error');
            return false;
        }

        return true;
    }

    /**
     * Validar formato do email
     * @param {string} email - Email a ser validado
     * @returns {boolean} - Se o email é válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Simular envio do formulário
     * @param {Object} formData - Dados do formulário
     */
    simulateFormSubmission(formData) {
        // Mostrar loading
        const submitButton = this.elements.contactForm.querySelector('.btn-enviar');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        // Simular delay de envio
        setTimeout(() => {
            this.showNotification(`✅ Obrigado, ${formData.name}! Sua mensagem foi enviada com sucesso!`, 'success');
            this.elements.contactForm.reset();
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    }

    /**
     * Adicionar validação em tempo real
     */
    addFormValidation() {
        const inputs = this.elements.contactForm?.querySelectorAll('input, textarea') || [];
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * Validar campo individual
     * @param {HTMLElement} field - Campo a ser validado
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.isValidEmail(value);
                errorMessage = 'Email inválido';
                break;
            case 'text':
                isValid = value.length >= 2;
                errorMessage = 'Mínimo 2 caracteres';
                break;
            default:
                isValid = value.length >= 10;
                errorMessage = 'Mínimo 10 caracteres';
        }

        if (!isValid && value !== '') {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
    }

    /**
     * Mostrar erro no campo
     * @param {HTMLElement} field - Campo com erro
     * @param {string} message - Mensagem de erro
     */
    showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = this.createElement('span', {
                className: 'field-error',
                textContent: message,
                styles: {
                    color: '#e74c3c',
                    fontSize: '0.8rem',
                    display: 'block',
                    marginTop: '0.3rem'
                }
            });
            field.parentNode.appendChild(errorElement);
        }
    }

    /**
     * Limpar erro do campo
     * @param {HTMLElement} field - Campo a ser limpo
     */
    clearFieldError(field) {
        field.style.borderColor = '';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // ========================================
    // UTILITÁRIOS E HELPERS
    // ========================================

    /**
     * Criar elemento DOM com propriedades
     * @param {string} tag - Tag do elemento
     * @param {Object} properties - Propriedades do elemento
     * @returns {HTMLElement} - Elemento criado
     */
    createElement(tag, properties = {}) {
        const element = document.createElement(tag);

        Object.entries(properties).forEach(([key, value]) => {
            if (key === 'styles') {
                Object.assign(element.style, value);
            } else if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        return element;
    }

    /**
     * Mostrar notificação para o usuário
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo da notificação
     */
    showNotification(message, type = 'info') {
        const notification = this.createElement('div', {
            className: `notification notification-${type}`,
            textContent: message,
            styles: {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '15px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: '10000',
                maxWidth: '350px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.3s ease-out',
                background: this.getNotificationColor(type)
            }
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, this.config.notificationDuration);
    }

    /**
     * Obter cor da notificação baseada no tipo
     * @param {string} type - Tipo da notificação
     * @returns {string} - Cor em hexadecimal
     */
    getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    }

    /**
     * Mostrar notificação de sucesso para compra
     * @param {string} productName - Nome do produto
     */
    showSuccessNotification(productName) {
        this.showNotification(`✅ "${productName}" adicionado ao carrinho!`, 'success');
    }

    /**
     * Adicionar animação ao botão de compra
     * @param {HTMLElement} button - Botão a ser animado
     */
    addPurchaseAnimation(button) {
        const originalStyles = {
            transform: button.style.transform,
            background: button.style.background
        };

        button.style.transform = 'scale(0.95)';
        button.style.background = '#27ae60';

        setTimeout(() => {
            button.style.transform = originalStyles.transform;
            button.style.background = originalStyles.background;
        }, this.config.animationDelay);
    }

    /**
     * Adicionar estilos customizados
     */
    addCustomStyles() {
        const styleSheet = this.createElement('style', {
            textContent: `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .fade-in {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .cart-counter {
                    transition: all 0.3s ease;
                }
                
                .theme-toggle:hover {
                    transform: scale(1.1) !important;
                }
                
                .btn-comprar:hover,
                .jogo button:hover,
                .produto-api button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .notification {
                    word-wrap: break-word;
                    white-space: pre-line;
                }
                
                .field-error {
                    animation: fadeIn 0.3s ease-out;
                }
                
                /* Responsividade para elementos JavaScript */
                @media (max-width: 768px) {
                    .cart-counter {
                        position: static !important;
                        display: inline-block;
                        margin-top: 1rem;
                    }
                    
                    .theme-toggle {
                        bottom: 15px !important;
                        right: 15px !important;
                        width: 50px !important;
                        height: 50px !important;
                        font-size: 20px !important;
                    }
                    
                    .notification {
                        right: 10px !important;
                        left: 10px !important;
                        max-width: none !important;
                    }
                    
                    #campo-pesquisa {
                        margin-left: 0 !important;
                        margin-top: 0.5rem;
                        width: 100%;
                    }
                }
                
                /* Acessibilidade */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                
                /* Foco para navegação por teclado */
                .cart-counter:focus,
                .theme-toggle:focus,
                #campo-pesquisa:focus {
                    outline: 2px solid #3498db;
                    outline-offset: 2px;
                }
            `
        });

        document.head.appendChild(styleSheet);
    }

    /**
     * Método público para limpar dados
     */
    clearAllData() {
        try {
            localStorage.removeItem('gamestore_cart_count');
            localStorage.removeItem('gamestore_theme');
            this.cartCounter = 0;
            this.updateCartDisplay();
            this.showNotification('✅ Dados limpos com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            this.showNotification('❌ Erro ao limpar dados!', 'error');
        }
    }
}

// ========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================

// Instância global da GameStore
let gameStoreApp;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameStore);
} else {
    initializeGameStore();
}

/**
 * Função de inicialização principal
 */
function initializeGameStore() {
    try {
        gameStoreApp = new GameStoreManager();
        
        // Carregar dados salvos
        gameStoreApp.loadCartFromStorage();
        
        console.log('🎮 GameStore inicializada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar GameStore:', error);
    }
}

// Expor funções globais necessárias
window.toggleProductDetails = function(productId) {
    const detailsElement = document.getElementById(`detalhes-${productId}`);
    const button = document.querySelector(`button[onclick="toggleProductDetails(${productId})"]`);
    
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
};

window.clearGameStoreData = function() {
    if (gameStoreApp) {
        gameStoreApp.clearAllData();
    }
};

// ========================================
// REFLEXÃO SOBRE CLEAN CODE APLICADO
// ========================================

/*
PRINCÍPIOS DE CLEAN CODE APLICADOS NESTE PROJETO:

1. **NOMES SIGNIFICATIVOS**
   - Variáveis: `cartCounter`, `isDarkMode`, `productInfo`
   - Funções: `setupShoppingCart()`, `validateSearchTerm()`, `showSuccessNotification()`
   - Classes: `GameStoreManager`, `ApiManager`, `ProductRenderer`

2. **FUNÇÕES PEQUENAS E FOCADAS**
   - Cada função tem uma responsabilidade única
   - Funções não ultrapassam 20-30 linhas
   - Parâmetros limitados e bem definidos

3. **COMENTÁRIOS ÚTEIS**
   - JSDoc para documentação de métodos
   - Comentários explicam o "porquê", não o "como"
   - Seções bem organizadas com separadores visuais

4. **ESTRUTURA E ORGANIZAÇÃO**
   - Código organizado em classes com responsabilidades específicas
   - Separação clara entre funcionalidades
   - Arquivos separados por responsabilidade (api.js, script.js)

5. **TRATAMENTO DE ERROS**
   - Try-catch em operações que podem falhar
   - Validações antes de executar operações
   - Mensagens de erro claras para o usuário

6. **REUTILIZAÇÃO E DRY (Don't Repeat Yourself)**
   - Métodos utilitários como `createElement()` e `showNotification()`
   - Configurações centralizadas no objeto `config`
   - Padrões consistentes para criação de elementos

7. **ACESSIBILIDADE E RESPONSIVIDADE**
   - Atributos ARIA adequados
   - Suporte a navegação por teclado
   - Design responsivo para diferentes dispositivos

MELHORIAS FUTURAS IDENTIFICADAS:

1. **TESTES UNITÁRIOS**
   - Implementar testes para validar funcionalidades
   - Cobertura de código para garantir qualidade

2. **TYPESCRIPT**
   - Adicionar tipagem estática para maior segurança
   - Melhor IntelliSense e detecção de erros

3. **PERFORMANCE**
   - Implementar lazy loading para imagens
   - Debounce para pesquisa em tempo real
   - Service Workers para cache offline

4. **MODULARIZAÇÃO**
   - Separar em módulos ES6
   - Sistema de build com Webpack/Vite
   - Componentes reutilizáveis

5. **PERSISTÊNCIA DE DADOS**
   - IndexedDB para dados mais complexos
   - Sincronização com backend real
   - Estado global com Redux/Zustand

Este código demonstra a aplicação prática dos princípios de Clean Code,
resultando em um projeto maintível, escalável e de fácil compreensão.
*/