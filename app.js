document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÕES FIXAS DE SINCRONIZAÇÃO ---
    const GITHUB_USER = 'TheDandyHoneybadger';
    const GITHUB_REPO = 'DomiScan2';
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/ref/heads/main`;
    const GITHUB_ACTIONS_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/actions/workflows/update_database.yml/dispatches`;

    const DB = {
        get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
        set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    };

    let currentUser = null;
    let currentCart = [];
    let currentProduct = null;
    let currentQuantity = 1;
    let isScannerActive = false;
    let scannerTargetInput = null;
    let pairableProductsList = [];
    let editableProductsList = [];
    let currentPayments = [];
    let productForStockAdjustment = null;
    let localChangesExist = false;

    // --- ELEMENTOS DA UI ---
    const setupView = document.getElementById('setup-view');
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtnConfig = document.getElementById('logout-btn-config');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const keepLoggedInCheckbox = document.getElementById('keep-logged-in');
    const loginError = document.getElementById('login-error');
    const codeInput = document.getElementById('code-input');
    const scanCodeBtn = document.getElementById('scan-code-btn');
    const productInfo = document.getElementById('product-info');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const finalizeSaleBtn = document.getElementById('finalize-sale-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const historyContent = document.getElementById('history-content');
    const alertModal = document.getElementById('alert-modal');
    const alertMessage = document.getElementById('alert-message');
    const closeAlertBtn = document.getElementById('close-alert-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    const scannerModal = document.getElementById('scanner-modal');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeAddProductBtn = document.getElementById('close-add-product-btn');
    const addProductForm = document.getElementById('add-product-form');
    const scanNewCodeBtn = document.getElementById('scan-new-code-btn');
    const decreaseQtyBtn = document.getElementById('decrease-qty-btn');
    const increaseQtyBtn = document.getElementById('increase-qty-btn');
    const productQuantitySpan = document.getElementById('product-quantity');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const discountInfo = document.getElementById('discount-info');
    const discountAmountSpan = document.getElementById('discount-amount');
    const discount5PercentCheckbox = document.getElementById('discount-5-percent');
    const discountCustomAmountInput = document.getElementById('discount-custom-amount');
    const historyDateInput = document.getElementById('history-date');
    const historyTotalSpan = document.getElementById('history-total');
    const addProductScannerContainer = document.getElementById('add-product-scanner-container');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const adminTabBtn = document.getElementById('admin-tab-btn');
    const historyUserFilterContainer = document.getElementById('history-user-filter-container');
    const historyUserFilter = document.getElementById('history-user-filter');
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const closeAddUserBtn = document.getElementById('close-add-user-btn');
    const addUserForm = document.getElementById('add-user-form');
    const currentUserInfo = document.getElementById('current-user-info');
    const dbVersionInfo = document.getElementById('db-version-info');
    const pairProductBtn = document.getElementById('pair-product-btn');
    const pairProductModal = document.getElementById('pair-product-modal');
    const closePairProductBtn = document.getElementById('close-pair-product-btn');
    const pairCategorySelect = document.getElementById('pair-category');
    const pairSubcategorySelect = document.getElementById('pair-subcategory');
    const pairSubsubcategoryContainer = document.getElementById('pair-subsubcategory-container');
    const pairSubsubcategorySelect = document.getElementById('pair-subsubcategory');
    const pairProductSelect = document.getElementById('pair-product');
    const pairedProductInfo = document.getElementById('paired-product-info');
    const pairedProductName = document.getElementById('paired-product-name');
    const pairedProductCod = document.getElementById('paired-product-cod');
    const pairedProductCurrentBarcode = document.getElementById('paired-product-current-barcode');
    const newBarcodePairInput = document.getElementById('new-barcode-pair');
    const scanNewBarcodePairBtn = document.getElementById('scan-new-barcode-pair-btn');
    const savePairBtn = document.getElementById('save-pair-btn');
    const pairProductScannerContainer = document.getElementById('pair-product-scanner-container');
    const paymentEntries = document.getElementById('payment-entries');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const paymentAmountInput = document.getElementById('payment-amount-input');
    const addPaymentBtn = document.getElementById('add-payment-btn');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const totalPaidSpan = document.getElementById('total-paid');
    const remainingBalanceSpan = document.getElementById('remaining-balance');
    const installmentsContainer = document.getElementById('installments-container');
    const installmentsSelect = document.getElementById('installments-select');
    const adjustStockBtn = document.getElementById('adjust-stock-btn');
    const adjustStockModal = document.getElementById('adjust-stock-modal');
    const closeAdjustStockBtn = document.getElementById('close-adjust-stock-btn');
    const adjustStockCodeInput = document.getElementById('adjust-stock-code-input');
    const scanAdjustStockBtn = document.getElementById('scan-adjust-stock-btn');
    const adjustStockProductInfo = document.getElementById('adjust-stock-product-info');
    const adjustStockProductName = document.getElementById('adjust-stock-product-name');
    const adjustStockCurrentStock = document.getElementById('adjust-stock-current-stock');
    const adjustStockControls = document.getElementById('adjust-stock-controls');
    const adjustStockNewStock = document.getElementById('adjust-stock-new-stock');
    const saveStockAdjustmentBtn = document.getElementById('save-stock-adjustment-btn');
    const adjustStockScannerContainer = document.getElementById('adjust-stock-scanner-container');
    const stockDecreaseBtn = document.getElementById('stock-decrease-btn');
    const stockIncreaseBtn = document.getElementById('stock-increase-btn');
    const exportDataModal = document.getElementById('export-data-modal');
    const closeExportDataBtn = document.getElementById('close-export-data-btn');
    const exportAllDataBtn = document.getElementById('export-all-data-btn');
    const importFileInput = document.getElementById('import-file-input');
    const importDataBtn = document.getElementById('import-data-btn');
    const focusButtons = document.querySelectorAll('.focus-btn');
    const editBarcodeBtn = document.getElementById('edit-barcode-btn');
    const editBarcodeModal = document.getElementById('edit-barcode-modal');
    const closeEditBarcodeBtn = document.getElementById('close-edit-barcode-btn');
    const editCategorySelect = document.getElementById('edit-category');
    const editSubcategorySelect = document.getElementById('edit-subcategory');
    const editSubsubcategoryContainer = document.getElementById('edit-subsubcategory-container');
    const editSubsubcategorySelect = document.getElementById('edit-subsubcategory');
    const editProductSelect = document.getElementById('edit-product');
    const editedProductInfo = document.getElementById('edited-product-info');
    const editedProductName = document.getElementById('edited-product-name');
    const editedProductCod = document.getElementById('edited-product-cod');
    const editedProductCurrentBarcode = document.getElementById('edited-product-current-barcode');
    const newBarcodeEditInput = document.getElementById('new-barcode-edit');
    const scanNewBarcodeEditBtn = document.getElementById('scan-new-barcode-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const editBarcodeScannerContainer = document.getElementById('edit-barcode-scanner-container');
    const newStockPairInput = document.getElementById('new-stock-pair');
    const newStockEditInput = document.getElementById('new-stock-edit');
    const syncStatus = document.getElementById('sync-status');
    const statusDot = document.getElementById('status-dot');
    const syncBtn = document.getElementById('sync-btn');
    const syncMessage = document.getElementById('sync-message');
    const githubUserInput = document.getElementById('github-user');
    const githubRepoInput = document.getElementById('github-repo');
    const githubPatInput = document.getElementById('github-pat');
    const updateNotification = document.getElementById('update-notification');
    const downloadUpdateBtn = document.getElementById('download-update-btn');
    const checkUpdateBtn = document.getElementById('check-update-btn');
    const exportReportsBtn = document.getElementById('export-reports-btn');
    const exportReportsModal = document.getElementById('export-reports-modal');
    const closeExportReportsBtn = document.getElementById('close-export-reports-btn');
    const exportSalesReportBtn = document.getElementById('export-sales-report-btn');
    const exportStockReportBtn = document.getElementById('export-stock-report-btn');
    const importExportDataBtn = document.getElementById('import-export-data-btn');
    const scannerErrorMessages = document.querySelectorAll('.scanner-error-message');

    // --- LÓGICA DE HASHING ---
    function hashPassword(password) {
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    // --- LÓGICA DE VERSIONAMENTO ---
    function compareVersions(v1, v2) {
        const s1 = String(v1);
        const s2 = String(v2);

        const isV1Semantic = s1.includes('.');
        const isV2Semantic = s2.includes('.');

        if (isV1Semantic && !isV2Semantic) return 1;
        if (!isV1Semantic && isV2Semantic) return -1;
        
        if (!isV1Semantic && !isV2Semantic) {
            return parseFloat(s1) > parseFloat(s2) ? 1 : -1;
        }

        const parts1 = s1.split('.').map(Number);
        const parts2 = s2.split('.').map(Number);
        const len = Math.max(parts1.length, parts2.length);
        for (let i = 0; i < len; i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }

    // --- LÓGICA DE SINCRONIZAÇÃO ---
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        if (isOnline) {
            syncStatus.textContent = 'Online';
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');
            syncBtn.disabled = false;
            checkUpdateBtn.disabled = false;
            syncMessage.textContent = 'Pronto para sincronizar.';
            checkForUpdates();
        } else {
            syncStatus.textContent = 'Offline';
            statusDot.classList.add('offline');
            statusDot.classList.remove('online');
            syncBtn.disabled = true;
            checkUpdateBtn.disabled = true;
            syncMessage.textContent = 'Funcionalidades online desativadas.';
        }
    }

    async function checkForUpdates() {
        if (!navigator.onLine) return;
        
        syncMessage.textContent = 'A verificar atualizações...';

        try {
            const apiResponse = await fetch(GITHUB_API_URL);
            if (!apiResponse.ok) throw new Error('Falha ao contactar a API do GitHub.');
            const refData = await apiResponse.json();
            const latestCommitHash = refData.object.sha;
            const GITHUB_DB_URL_COMMIT = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${latestCommitHash}/dados_offline.json`;

            const response = await fetch(GITHUB_DB_URL_COMMIT);
            if (!response.ok) throw new Error('Falha ao obter dados do GitHub.');
            
            const remoteData = await response.json();
            
            const localData = DB.get('database_info');
            const localChanges = DB.get('change_log');

            if (compareVersions(remoteData.version, localData.version) > 0 && localChanges.length === 0) {
                updateNotification.classList.remove('hidden');
                downloadUpdateBtn.classList.remove('hidden');
                syncMessage.textContent = 'Nova versão da base de dados encontrada!';
            } else if (localChanges.length > 0) {
                syncMessage.textContent = 'Você tem alterações locais para enviar.';
                localChangesExist = true;
            } else {
                syncMessage.textContent = 'A sua base de dados está atualizada.';
                localChangesExist = false;
                downloadUpdateBtn.classList.add('hidden');
                updateNotification.classList.add('hidden');
            }

        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
            syncMessage.textContent = 'Erro ao contactar o GitHub.';
        }
    }
    
    async function uploadChangesToGitHub() {
        const pat = githubPatInput.value.trim();
        if (!pat) {
            showAlert('Por favor, preencha o Token de Acesso Pessoal do GitHub.');
            return;
        }

        if (!localChangesExist) {
            showAlert('Não existem alterações locais para enviar.');
            return;
        }

        const changesToUpload = {
            sales: DB.get('vendas_log'),
            changes: DB.get('change_log')
        };
        
        console.log('Enviando para o GitHub:', JSON.stringify(changesToUpload, null, 2));

        syncMessage.textContent = 'A enviar alterações para o GitHub Actions...';
        syncBtn.disabled = true;

        try {
            const response = await fetch(GITHUB_ACTIONS_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${pat}`
                },
                body: JSON.stringify({
                    ref: 'main',
                    inputs: {
                        changes: JSON.stringify(changesToUpload)
                    }
                })
            });

            if (response.status !== 204) {
                throw new Error(`O GitHub respondeu com o status ${response.status}. Verifique as suas credenciais.`);
            }
            
            showAlert('Pedido de atualização enviado com sucesso para o GitHub Actions! Aguarde alguns minutos para que a base de dados seja atualizada.');
            syncMessage.textContent = 'Pedido enviado. A base de dados será atualizada em breve.';
            DB.set('change_log', []);
            localChangesExist = false;

        } catch (error) {
            console.error('Erro no upload:', error);
            showAlert(`Ocorreu um erro ao enviar as alterações: ${error.message}`);
            syncMessage.textContent = 'Falha no envio. Tente novamente.';
        } finally {
            syncBtn.disabled = false;
        }
    }

    // --- LÓGICA DE INICIALIZAÇÃO ---
    function initializeApp() {
        if (localStorage.getItem('db_initialized')) {
            checkLoggedInState();
        } else {
            setupView.classList.remove('hidden');
            loginView.classList.add('hidden');
            appView.classList.add('hidden');
            setupFileLoadListeners();
        }
    }

    function setupFileLoadListeners() {
        const fileInput = document.getElementById('import-db-input');
        const loadBtn = document.getElementById('load-db-btn');
        const setupError = document.getElementById('setup-error');
        let fileContent = null;

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.name.endsWith('.json')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileContent = e.target.result;
                    loadBtn.disabled = false;
                    setupError.textContent = '';
                };
                reader.onerror = () => {
                    setupError.textContent = 'Erro ao ler o ficheiro.';
                    loadBtn.disabled = true;
                    fileContent = null;
                };
                reader.readAsText(file);
            } else {
                setupError.textContent = 'Por favor, selecione um ficheiro .json válido.';
                loadBtn.disabled = true;
                fileContent = null;
            }
        });

        loadBtn.addEventListener('click', () => {
            if (!fileContent) {
                setupError.textContent = 'Nenhum ficheiro carregado.';
                return;
            }
            try {
                const data = JSON.parse(fileContent);
                if (data.products && data.users && data.version) {
                    DB.set('products', data.products);
                    DB.set('users', data.users);
                    DB.set('vendas_log', data.vendas_log || []);
                    DB.set('change_log', []);
                    DB.set('database_info', { version: data.version });
                    localStorage.setItem('db_initialized', 'true');
                    
                    location.reload();
                } else {
                    throw new Error('Ficheiro JSON inválido. Faltam as chaves "products", "users" ou "version".');
                }
            } catch (err) {
                setupError.textContent = `Erro: ${err.message}`;
            }
        });
    }

    function checkLoggedInState() {
        let savedUser = localStorage.getItem('loggedInUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showAppView();
        } else {
            showLoginView();
        }
    }

    function showLoginView() {
        setupView.classList.add('hidden');
        appView.classList.add('hidden');
        loginView.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
    }

    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const hashedPassword = hashPassword(password);
        loginError.textContent = '';
        if (!username || !password) {
            loginError.textContent = 'Utilizador e senha são obrigatórios.';
            return;
        }
        
        const users = DB.get('users');
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPassword);

        if (user) {
            if (keepLoggedInCheckbox.checked) {
                localStorage.setItem('loggedInUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            }
            currentUser = user;
            showAppView();
        } else {
            loginError.textContent = 'Utilizador ou senha inválidos.';
        }
    }
    
    function logout() {
        showConfirm("Tem a certeza que deseja sair da sua conta?", (confirmed) => {
            if (confirmed) {
                currentUser = null;
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
                showLoginView();
            }
        });
    }

    function showAppView() {
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        currentUserInfo.textContent = `${currentUser.username} (${currentUser.role})`;
        
        const dbInfo = DB.get('database_info');
        if (dbInfo && dbInfo.version) {
            dbVersionInfo.textContent = dbInfo.version;
        } else {
            dbVersionInfo.textContent = 'N/A';
        }

        const syncSection = document.getElementById('sync-section');
        if (currentUser.role === 'admin') {
            adminTabBtn.classList.remove('hidden');
            historyUserFilterContainer.classList.remove('hidden');
            populateUserFilter();
            syncSection.classList.remove('hidden');
            githubUserInput.value = GITHUB_USER;
            githubRepoInput.value = GITHUB_REPO;
            updateOnlineStatus();
        } else {
            adminTabBtn.classList.add('hidden');
            historyUserFilterContainer.classList.add('hidden');
            syncSection.classList.add('hidden');
        }
        switchTab('vender-view');
        startNewSale();
    }
    
    function switchTab(tabId) {
        tabContents.forEach(content => content.classList.add('hidden'));
        tabButtons.forEach(button => button.classList.remove('tab-active'));
        document.getElementById(tabId).classList.remove('hidden');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('tab-active');
        if (tabId === 'historico-view') {
            historyDateInput.valueAsDate = new Date();
            showHistory();
        }
    }

    function lookupProduct(identifier) {
        if (!identifier) return;
        const products = DB.get('products');
        const product = products.find(p => p.cod === identifier || p.barcode === identifier);
        const foundControls = document.getElementById('product-found-controls');
        const notFoundControls = document.getElementById('product-not-found-controls');
        const registerNewProductLink = document.getElementById('register-new-product-link');
        const notFoundMessage = document.getElementById('product-not-found-message');

        if (product) {
            currentProduct = product;
            productName.textContent = product.name;
            productPrice.textContent = `R$ ${product.price.toFixed(2)}`;
            currentQuantity = 1;
            productQuantitySpan.textContent = currentQuantity;
            foundControls.classList.remove('hidden');
            notFoundControls.classList.add('hidden');
        } else {
            currentProduct = null;
            foundControls.classList.add('hidden');
            notFoundControls.classList.remove('hidden');
            if (currentUser.role === 'admin') {
                notFoundMessage.textContent = 'Produto não encontrado. Deseja registá-lo?';
                registerNewProductLink.classList.remove('hidden');
            } else {
                notFoundMessage.textContent = 'Produto não encontrado.';
                registerNewProductLink.classList.add('hidden');
            }
        }
        productInfo.classList.remove('hidden');
    }

    function addToCart() {
        if (currentProduct) {
            const existingItem = currentCart.find(item => item.cod === currentProduct.cod);
            if (existingItem) {
                existingItem.quantity += currentQuantity;
            } else {
                currentCart.push({ ...currentProduct, quantity: currentQuantity });
            }
            updateCartUI();
            resetProductLookup();
        }
    }

    function resetProductLookup() {
        currentProduct = null;
        codeInput.value = '';
        productInfo.classList.add('hidden');
        document.getElementById('product-found-controls').classList.add('hidden');
        document.getElementById('product-not-found-controls').classList.add('hidden');
    }

    function removeFromCart(code) {
        currentCart = currentCart.filter(item => item.cod !== code);
        updateCartUI();
    }

    function updateCartUI() {
        if (currentCart.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center">Carrinho vazio</p>';
        } else {
            cartItems.innerHTML = '';
            currentCart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'relative flex justify-between items-center p-2 bg-gray-50 rounded';
                itemElement.innerHTML = `
                    <div><p class="font-medium text-sm">${item.name}</p><p class="text-xs text-gray-600">${item.quantity} x R$ ${item.price.toFixed(2)}</p></div>
                    <p class="font-semibold text-sm">R$ ${(item.quantity * item.price).toFixed(2)}</p>
                    <button class="remove-from-cart-btn absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs" data-code="${item.cod}">&times;</button>`;
                cartItems.appendChild(itemElement);
            });
        }
        updateSaleTotals();
    }

    function addPayment() {
        const method = paymentMethodSelect.value;
        const amount = parseFloat(paymentAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            showAlert('Por favor, insira um valor de pagamento válido.');
            return;
        }
        const payment = { method, amount };
        if (method === 'Cartão de Crédito') {
            payment.installments = installmentsSelect.value;
        }
        currentPayments.push(payment);
        paymentAmountInput.value = '';
        updatePaymentsUI();
        updateSaleTotals();
    }

    function removePayment(index) {
        currentPayments.splice(index, 1);
        updatePaymentsUI();
        updateSaleTotals();
    }

    function updatePaymentsUI() {
        paymentEntries.innerHTML = '';
        currentPayments.forEach((payment, index) => {
            const paymentElement = document.createElement('div');
            paymentElement.className = 'flex justify-between items-center p-2 bg-gray-100 rounded text-sm';
            let paymentText = payment.method;
            if (payment.installments) {
                paymentText += ` (${payment.installments})`;
            }
            paymentElement.innerHTML = `
                <div><span class="font-medium">${paymentText}</span></div>
                <div class="flex items-center gap-2"><span class="font-semibold">R$ ${payment.amount.toFixed(2)}</span><button class="remove-payment-btn w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs" data-index="${index}">&times;</button></div>`;
            paymentEntries.appendChild(paymentElement);
        });
    }

    function updateSaleTotals() {
        const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        const customDiscountValue = parseFloat(discountCustomAmountInput.value);

        if (discount5PercentCheckbox.checked) {
            discount = subtotal * 0.05;
        } else if (!isNaN(customDiscountValue) && customDiscountValue > 0) {
            discount = customDiscountValue;
        }

        if (discount > subtotal) {
            discount = subtotal;
        }

        let finalTotal = subtotal - discount;
        
        cartSubtotalSpan.textContent = `R$ ${subtotal.toFixed(2)}`;
        if (discount > 0) {
            discountAmountSpan.textContent = `- R$ ${discount.toFixed(2)}`;
            discountInfo.classList.remove('hidden');
        } else {
            discountInfo.classList.add('hidden');
        }

        const totalPaid = currentPayments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = finalTotal - totalPaid;
        
        cartTotal.textContent = `R$ ${finalTotal.toFixed(2)}`;
        totalPaidSpan.textContent = `R$ ${totalPaid.toFixed(2)}`;
        remainingBalanceSpan.textContent = `R$ ${remaining.toFixed(2)}`;
        remainingBalanceSpan.classList.toggle('text-red-600', remaining > 0.01);
        remainingBalanceSpan.classList.toggle('text-green-600', remaining <= 0.01);
        
        const isFullyPaid = Math.abs(remaining) < 0.01;
        finalizeSaleBtn.disabled = currentCart.length === 0 || !isFullyPaid;
    }

    function finalizeSale() {
        if (currentCart.length === 0 || currentPayments.length === 0) return;
        
        const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        const customDiscountValue = parseFloat(discountCustomAmountInput.value);
        if (discount5PercentCheckbox.checked) {
            discount = subtotal * 0.05;
        } else if (!isNaN(customDiscountValue) && customDiscountValue > 0) {
            discount = customDiscountValue;
        }
        if (discount > subtotal) discount = subtotal;

        const finalTotal = subtotal - discount;

        const vendasLog = DB.get('vendas_log');
        const saleData = {
            timestamp: new Date().toISOString(),
            vendedor: currentUser.username,
            produtos: currentCart.map(item => `${item.quantity}x ${item.name}`).join(', '),
            formas_pagamento: currentPayments.map(p => p.method).join(', '),
            valores_pagos: currentPayments.map(p => p.amount.toFixed(2)).join(', '),
            desconto: discount.toFixed(2),
            valor_total: finalTotal.toFixed(2)
        };
        vendasLog.push(saleData);
        DB.set('vendas_log', vendasLog);
        
        let products = DB.get('products');
        currentCart.forEach(cartItem => {
            const productIndex = products.findIndex(p => p.cod === cartItem.cod);
            if (productIndex !== -1 && products[productIndex].estoque != null) {
                products[productIndex].estoque -= cartItem.quantity;
            }
        });
        DB.set('products', products);
        
        showAlert('Venda finalizada e guardada localmente!');
        startNewSale();
    }

    function startNewSale() {
        currentCart = [];
        currentPayments = [];
        discount5PercentCheckbox.checked = false;
        discountCustomAmountInput.value = '';
        updateCartUI();
        updatePaymentsUI();
        resetProductLookup();
    }

    function populateUserFilter() {
        const users = DB.get('users');
        historyUserFilter.innerHTML = '<option value="all">Todos os Funcionários</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = `${user.username} (${user.role})`;
            historyUserFilter.appendChild(option);
        });
    }

    function showHistory() {
        const selectedDate = historyDateInput.value;
        let allSales = DB.get('vendas_log');
        
        if (selectedDate) {
            allSales = allSales.filter(sale => sale.timestamp.startsWith(selectedDate));
        }

        if (currentUser.role !== 'admin') {
            allSales = allSales.filter(sale => sale.vendedor === currentUser.username);
        } else {
            const selectedUser = historyUserFilter.value;
            if (selectedUser !== 'all') {
                allSales = allSales.filter(sale => sale.vendedor === selectedUser);
            }
        }
        
        allSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        historyContent.innerHTML = '';
        let totalSalesValue = 0;

        if (allSales.length === 0) {
            historyContent.innerHTML = '<p class="text-gray-500">Nenhuma venda registada para esta data/filtro.</p>';
        } else {
            allSales.forEach(sale => {
                totalSalesValue += parseFloat(sale.valor_total);
                const saleElement = document.createElement('div');
                saleElement.className = 'p-3 border rounded-lg bg-gray-50';
                const saleTimestamp = new Date(sale.timestamp);
                const discountHtml = sale.desconto > 0 ? `<div class="text-xs text-green-600 mt-1">Desconto: - R$ ${parseFloat(sale.desconto).toFixed(2)}</div>` : '';
                
                saleElement.innerHTML = `
                    <div class="flex justify-between font-semibold text-sm">
                        <p>${saleTimestamp.toLocaleDateString('pt-BR')} ${saleTimestamp.toLocaleTimeString('pt-BR')}</p>
                        <p>Total: R$ ${parseFloat(sale.valor_total).toFixed(2)}</p>
                    </div>
                    <div class="text-xs text-gray-600 mt-1"><span>Vendedor: ${sale.vendedor}</span></div>
                    ${discountHtml}
                    <div class="mt-2 text-xs">
                        <p class="font-semibold mb-1">Pagamentos: ${sale.formas_pagamento} (${sale.valores_pagos})</p>
                    </div>
                    <div class="mt-2 text-xs">
                        <p class="font-semibold mb-1">Itens:</p>
                        <p>${sale.produtos}</p>
                    </div>`;
                historyContent.appendChild(saleElement);
            });
        }
        historyTotalSpan.textContent = `R$ ${totalSalesValue.toFixed(2)}`;
    }
    
    function logChange(action, details) {
        const log = DB.get('change_log');
        log.push({
            user: currentUser.username,
            action: action,
            timestamp: new Date().toISOString(),
            details: details
        });
        DB.set('change_log', log);
        localChangesExist = true;
        if (syncMessage) {
            syncMessage.textContent = 'Você tem alterações locais para enviar.';
        }
    }

    function addNewProduct(event) {
        event.preventDefault();
        stopScanner();
        const cod = document.getElementById('new-cod').value.trim();
        const name = document.getElementById('new-product-name').value.trim();
        const price = parseFloat(document.getElementById('new-product-price').value);
        const barcode = document.getElementById('new-barcode').value.trim();
        const category = document.getElementById('new-category').value.trim();
        const subcategory = document.getElementById('new-subcategory').value.trim();
        const subsubcategory = document.getElementById('new-subsubcategory').value.trim();
        const estoque = parseInt(document.getElementById('new-estoque').value, 10) || null;
        if (!cod || !name || isNaN(price) || price <= 0) {
            showAlert('Por favor, preencha os campos obrigatórios (Código, Nome, Preço) corretamente.');
            return;
        }
        let products = DB.get('products');
        if (products.some(p => p.cod === cod)) {
            showAlert('Já existe um produto com este código.');
            return;
        }
        const newProduct = { cod, name, price, barcode, category, subcategory, subsubcategory, estoque, prc_total: null };
        products.push(newProduct);
        DB.set('products', products);
        logChange('create_product', { cod: newProduct.cod, name: newProduct.name });
        showAlert('Produto registado com sucesso localmente.');
        addProductForm.reset();
        addProductModal.classList.add('hidden');
    }

    function saveProductPairing(cod, newBarcode, stock, modal, refreshCallback) {
        if(!cod || !newBarcode) {
            showAlert('Selecione um produto e forneça um novo código de barras.');
            return;
        }
        let products = DB.get('products');
        const productIndex = products.findIndex(p => p.cod === cod);
        if (productIndex === -1) {
            showAlert('Produto não encontrado para casar o código.');
            return;
        }
        
        products[productIndex].barcode = newBarcode;
        
        const newStock = parseInt(stock, 10);
        if (!isNaN(newStock)) {
            products[productIndex].estoque = newStock;
        }

        DB.set('products', products);
        logChange('pair_product', { cod: cod, newBarcode: newBarcode, newStock: newStock });
        showAlert('Código de barras e estoque atualizados com sucesso!');
        
        refreshCallback();
    }

    function saveStockAdjustment() {
        if (!productForStockAdjustment) return;
        const newStock = parseInt(adjustStockNewStock.value, 10);
        if (isNaN(newStock) || newStock < 0) {
            showAlert('Por favor, insira um valor de estoque válido.');
            return;
        }
        let products = DB.get('products');
        const productIndex = products.findIndex(p => p.cod === productForStockAdjustment.cod);
        if (productIndex === -1) {
            showAlert('Produto não encontrado para ajustar o estoque.');
            return;
        }
        products[productIndex].estoque = newStock;
        DB.set('products', products);
        logChange('adjust_stock', { cod: productForStockAdjustment.cod, oldStock: products[productIndex].estoque, newStock: newStock });
        showAlert('Estoque atualizado com sucesso localmente!');
        adjustStockModal.classList.add('hidden');
    }

    function addNewUser(event) {
        event.preventDefault();
        const newUsername = document.getElementById('new-username').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const newRole = document.getElementById('new-role').value;
        if (!newUsername || !newPassword) {
            showAlert('Nome de utilizador e senha são obrigatórios.');
            return;
        }
        let users = DB.get('users');
        if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
            showAlert('Já existe um utilizador com este nome.');
            return;
        }

        const hashedPassword = hashPassword(newPassword);
        users.push({ username: newUsername, password: hashedPassword, role: newRole });
        DB.set('users', users);
        logChange('create_user', { username: newUsername, password: hashedPassword, role: newRole });
        showAlert('Utilizador registado com sucesso localmente.');
        addUserForm.reset();
        addUserModal.classList.add('hidden');
        if (document.querySelector('.tab-active').dataset.tab === 'historico-view') {
            populateUserFilter();
        }
    }
    
    function exportSalesToCSV() {
        const sales = DB.get('vendas_log');
        if (sales.length === 0) {
            showAlert("Nenhuma venda para exportar.");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Data e Hora;Vendedor;Produtos;Formas de Pagamento;Valores Pagos;Desconto;Valor Total\r\n";
        sales.forEach(sale => {
            let row = `"${sale.timestamp}";"${sale.vendedor}";"${sale.produtos}";"${sale.formas_pagamento}";"${sale.valores_pagos}";"${sale.desconto}";"${sale.valor_total}"`;
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function exportAllData() {
        const allData = { 
            products: DB.get('products'), 
            users: DB.get('users'), 
            vendas_log: DB.get('vendas_log'), 
            change_log: DB.get('change_log'),
            database_info: DB.get('database_info')
        };
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_dados_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showAlert('Backup de dados exportado com sucesso!');
    }

    function importAllData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.products && data.users) {
                    showConfirm("Tem a certeza que deseja substituir todos os dados locais por este backup?", (confirmed) => {
                        if (confirmed) {
                            DB.set('products', data.products);
                            DB.set('users', data.users);
                            DB.set('vendas_log', data.vendas_log || []);
                            DB.set('change_log', data.change_log || []);
                            DB.set('database_info', data.database_info || { version: "0.0.0.0.0.1" });
                            localStorage.setItem('db_initialized', 'true');
                            showAlert('Dados importados com sucesso! A aplicação será recarregada.');
                            setTimeout(() => location.reload(), 1500);
                        }
                    });
                } else {
                    showAlert('Arquivo de backup inválido.');
                }
            } catch (err) {
                showAlert(`Erro ao ler o arquivo: ${err.message}`);
            }
        };
        reader.readAsText(file);
    }

    function exportUserChanges() {
        const userSales = DB.get('vendas_log').filter(s => s.vendedor === currentUser.username);
        const userChanges = DB.get('change_log').filter(c => c.user === currentUser.username);

        if (userSales.length === 0 && userChanges.length === 0) {
            showAlert('Nenhuma mudança ou venda encontrada para este utilizador.');
            return;
        }

        const exportData = {
            exportedBy: currentUser.username,
            exportDate: new Date().toISOString(),
            sales: userSales,
            changes: userChanges
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mudancas_${currentUser.username}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function openBarcodeModal(modal, categorySelect, onlyUnpaired) {
        const subcategorySelect = modal.querySelector('select[id*="-subcategory"]');
        const subsubcategorySelect = modal.querySelector('select[id*="-subsubcategory"]');
        const productSelect = modal.querySelector('select[id*="-product"]');
        
        categorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        subcategorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        subsubcategorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        productSelect.innerHTML = '<option value="">-- Escolha --</option>';

        const products = DB.get('products');
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        modal.classList.remove('hidden');
    }
    
    function populateSubcategoriesFor(categorySelect, subcategorySelect, subsubcategorySelect, productSelect, productList, onlyUnpaired) {
        const selectedCategory = categorySelect.value;
        subcategorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        subsubcategorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        productSelect.innerHTML = '<option value="">-- Escolha --</option>';
        if (!selectedCategory) return;

        const products = DB.get('products');
        const subcategories = [...new Set(products.filter(p => p.category === selectedCategory && p.subcategory).map(p => p.subcategory))].sort();
        subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
        subcategorySelect.disabled = false;
    }

    function populateSubsubcategoriesFor(categorySelect, subcategorySelect, subsubcategorySelect, productSelect, productList, onlyUnpaired) {
        const selectedCategory = categorySelect.value;
        const selectedSubcategory = subcategorySelect.value;
        const subsubcategoryContainer = subsubcategorySelect.closest('div');
        
        subsubcategorySelect.innerHTML = '<option value="">-- Escolha --</option>';
        productSelect.innerHTML = '<option value="">-- Escolha --</option>';
        if (!selectedSubcategory) return;

        const products = DB.get('products');
        const subsubcategories = [...new Set(products.filter(p => p.category === selectedCategory && p.subcategory === selectedSubcategory && p.subsubcategory).map(p => p.subsubcategory))].sort();
        
        if (subsubcategories.length > 0) {
            subsubcategoryContainer.classList.remove('hidden');
            subsubcategorySelect.disabled = false;
            subsubcategorySelect.innerHTML = '<option value="">-- Produtos sem Sub-Subcategoria --</option>';
            subsubcategories.forEach(subsub => {
                const option = document.createElement('option');
                option.value = subsub;
                option.textContent = subsub;
                subsubcategorySelect.appendChild(option);
            });
        } else {
            subsubcategoryContainer.classList.add('hidden');
            populateProductsFor(categorySelect, subcategorySelect, subsubcategorySelect, productSelect, productList, onlyUnpaired);
        }
    }

    function populateProductsFor(categorySelect, subcategorySelect, subsubcategorySelect, productSelect, productListRef, onlyUnpaired) {
        const selectedCategory = categorySelect.value;
        const selectedSubcategory = subcategorySelect.value;
        const selectedSubsubcategory = subsubcategorySelect.value || null;
        if (!selectedCategory || !selectedSubcategory) return;

        let products = DB.get('products');
        let filteredProducts = products.filter(p => 
            p.category === selectedCategory && 
            p.subcategory === selectedSubcategory && 
            (selectedSubsubcategory ? p.subsubcategory === selectedSubsubcategory : !p.subsubcategory)
        );

        if (onlyUnpaired) {
            filteredProducts = filteredProducts.filter(p => !p.barcode);
        }
        
        if (productListRef === 'pair') pairableProductsList = filteredProducts;
        else editableProductsList = filteredProducts;

        productSelect.innerHTML = '<option value="">-- Escolha --</option>';
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name)).forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.cod;
            option.textContent = prod.name;
            productSelect.appendChild(option);
        });
        productSelect.disabled = false;
    }

    function showSelectedProductInfoFor(productSelect, productInfo, productList, stockInput) {
        const selectedCod = productSelect.value;
        const nameEl = productInfo.querySelector('[id*="-name"]');
        const codEl = productInfo.querySelector('[id*="-cod"]');
        const barcodeEl = productInfo.querySelector('[id*="-current-barcode"]');
        const saveBtn = productSelect.closest('.space-y-4').querySelector('button[id*="save-"]');

        if (!selectedCod) {
            productInfo.classList.add('hidden');
            saveBtn.disabled = true;
            return;
        }
        const product = productList.find(p => p.cod === selectedCod);
        if (product) {
            nameEl.textContent = product.name;
            codEl.textContent = `Cód: ${product.cod}`;
            barcodeEl.textContent = `Barcode Atual: ${product.barcode || 'Nenhum'}`;
            stockInput.value = product.estoque || '';
            productInfo.classList.remove('hidden');
            saveBtn.disabled = false;
        }
    }

    function openAdjustStockModal() {
        productForStockAdjustment = null;
        adjustStockCodeInput.value = '';
        adjustStockProductInfo.classList.add('hidden');
        adjustStockControls.classList.add('hidden');
        adjustStockNewStock.value = '';
        saveStockAdjustmentBtn.disabled = true;
        adjustStockModal.classList.remove('hidden');
    }

    function lookupProductForStock(identifier) {
        if (!identifier) return;
        const products = DB.get('products');
        productForStockAdjustment = products.find(p => p.cod === identifier || p.barcode === identifier);
        if (productForStockAdjustment) {
            adjustStockProductName.textContent = productForStockAdjustment.name;
            adjustStockCurrentStock.textContent = productForStockAdjustment.estoque ?? 'N/A';
            adjustStockNewStock.value = productForStockAdjustment.estoque ?? 0;
            adjustStockProductInfo.classList.remove('hidden');
            adjustStockControls.classList.remove('hidden');
            saveStockAdjustmentBtn.disabled = false;
        } else {
            showAlert('Produto não encontrado.');
            productForStockAdjustment = null;
            adjustStockProductInfo.classList.add('hidden');
            adjustStockControls.classList.add('hidden');
            saveStockAdjustmentBtn.disabled = true;
        }
    }
    
    // Funções de alerta e confirmação
    function showAlert(message) {
        alertMessage.textContent = message;
        alertModal.classList.remove('hidden');
    }

    function showConfirm(message, callback) {
        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        confirmYesBtn.onclick = () => {
            confirmModal.classList.add('hidden');
            callback(true);
        };
        confirmNoBtn.onclick = () => {
            confirmModal.classList.add('hidden');
            callback(false);
        };
    }

    async function requestCameraPermission(target) {
        scannerTargetInput = target;
        scannerErrorMessages.forEach(el => el.classList.add('hidden'));

        if (!navigator.mediaDevices?.getUserMedia) {
            return showAlert('O seu navegador não suporta o acesso à câmara.');
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach(track => track.stop());

            const modal = target.closest('.modal-bg, #app-view');
            const viewport = modal.querySelector('.scanner-viewport');
            const scannerContainer = modal.querySelector('.scanner-container');

            if (modal.id === 'app-view') {
                scannerModal.classList.remove('hidden');
                startScanner('#scanner-viewport');
            } else {
                 if (scannerContainer) {
                    scannerContainer.classList.remove('hidden');
                }
                startScanner(`#${viewport.id}`);
            }

        } catch (error) {
            let msg = 'A permissão da câmara é necessária.';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                msg = 'Você negou o acesso à câmara. Habilite nas configurações do seu navegador.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                msg = 'Nenhuma câmara foi encontrada no seu dispositivo.';
            }
            showAlert(msg);
            console.error("Camera Error:", error);
        }
    }
    
    function triggerFocus() {
        if (Quagga && isScannerActive) {
            try {
                const track = Quagga.CameraAccess.getActiveTrack();
                if (track && typeof track.applyConstraints === 'function') {
                    track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] })
                        .then(() => console.log('Autofoco acionado.'))
                        .catch(e => console.error('Este dispositivo não suporta o controlo de foco.', e));
                }
            } catch (e) {
                console.error('Erro ao obter a faixa da câmara:', e);
            }
        }
    }

    function startScanner(viewportSelector) {
        Quagga.init({
            inputStream: { name: "Live", type: "LiveStream", target: document.querySelector(viewportSelector), constraints: { facingMode: "environment" } },
            locator: { patchSize: "medium", halfSample: true },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: { readers: ["ean_reader", "upc_reader", "code_128_reader"], multiple: false },
            locate: true
        }, (err) => {
            if (err) { showAlert('Erro ao iniciar a câmara.'); return; }
            Quagga.start();
            isScannerActive = true;
            const container = document.querySelector(viewportSelector).closest('.modal-bg, .scanner-container');
            if (container) {
                const focusBtn = container.querySelector('.focus-btn');
                if (focusBtn) focusBtn.classList.remove('hidden');
            }
        });
    }

    function stopScanner() {
        if (isScannerActive) {
            Quagga.stop();
            isScannerActive = false;
        }
        [scannerModal, addProductScannerContainer, pairProductScannerContainer, adjustStockScannerContainer, editBarcodeScannerContainer].forEach(el => el.classList.add('hidden'));
        focusButtons.forEach(btn => btn.classList.add('hidden'));
    }

    Quagga.onDetected((result) => {
        if (result?.codeResult?.code) {
            const code = result.codeResult.code.replace(/\s/g, '');
            if (!scannerTargetInput) return;

            const products = DB.get('products');
            const product = products.find(p => p.cod === code || p.barcode === code);
            
            let productShouldExist = (
                scannerTargetInput.id === 'code-input' || 
                scannerTargetInput.id === 'adjust-stock-code-input'
            );

            if (!productShouldExist || (productShouldExist && product)) {
                scannerTargetInput.value = code;
                if (scannerTargetInput.id === 'code-input') {
                   lookupProduct(code);
                } else if (scannerTargetInput.id === 'adjust-stock-code-input') {
                   lookupProductForStock(code);
                }
                if ('vibrate' in navigator) navigator.vibrate(100);
                stopScanner();
            } else {
                const activeModal = scannerTargetInput.closest('.modal-bg, #app-view');
                const errorElement = activeModal.querySelector('.scanner-error-message');
                
                if (errorElement) {
                    errorElement.textContent = 'Código não encontrado.';
                    errorElement.classList.remove('hidden');
                    setTimeout(() => {
                        errorElement.classList.add('hidden');
                    }, 2500);
                }
                if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            }
        }
    });

    // --- EVENT LISTENERS ---
    loginBtn.addEventListener('click', login);
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') login(); });
    logoutBtnConfig.addEventListener('click', logout);
    codeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') lookupProduct(codeInput.value.trim()); });
    scanCodeBtn.addEventListener('click', () => requestCameraPermission(document.getElementById('code-input')));
    scanNewCodeBtn.addEventListener('click', () => requestCameraPermission(document.getElementById('new-cod')));
    addToCartBtn.addEventListener('click', addToCart);
    finalizeSaleBtn.addEventListener('click', finalizeSale);
    clearCartBtn.addEventListener('click', () => { if (currentCart.length > 0) showConfirm("Limpar o carrinho e pagamentos?", (c) => c && startNewSale()); else startNewSale(); });
    exportReportsBtn.addEventListener('click', () => exportReportsModal.classList.remove('hidden'));
    closeExportReportsBtn.addEventListener('click', () => exportReportsModal.classList.add('hidden'));
    exportSalesReportBtn.addEventListener('click', exportSalesToCSV);
    importExportDataBtn.addEventListener('click', () => exportDataModal.classList.remove('hidden'));
    closeExportDataBtn.addEventListener('click', () => exportDataModal.classList.add('hidden'));
    exportAllDataBtn.addEventListener('click', exportAllData);
    importFileInput.addEventListener('change', (e) => { importDataBtn.disabled = !e.target.files.length; });
    importDataBtn.addEventListener('click', () => importAllData({ target: importFileInput }));
    document.getElementById('register-new-product-link').addEventListener('click', () => {
        const code = codeInput.value.trim();
        addProductModal.classList.remove('hidden');
        document.getElementById('new-cod').value = code;
        document.getElementById('new-barcode').value = code;
        resetProductLookup();
    });
    closeAlertBtn.addEventListener('click', () => alertModal.classList.add('hidden'));
    closeScannerBtn.addEventListener('click', stopScanner);
    addProductBtn.addEventListener('click', () => addProductModal.classList.remove('hidden'));
    closeAddProductBtn.addEventListener('click', () => { stopScanner(); addProductModal.classList.add('hidden'); });
    addUserBtn.addEventListener('click', () => addUserModal.classList.remove('hidden'));
    closeAddUserBtn.addEventListener('click', () => addUserModal.classList.add('hidden'));
    addProductForm.addEventListener('submit', addNewProduct);
    addUserForm.addEventListener('submit', addNewUser);
    historyDateInput.addEventListener('change', showHistory);
    historyUserFilter.addEventListener('change', showHistory);
    cancelAddBtn.addEventListener('click', resetProductLookup);
    increaseQtyBtn.addEventListener('click', () => { currentQuantity++; productQuantitySpan.textContent = currentQuantity; });
    decreaseQtyBtn.addEventListener('click', () => { if (currentQuantity > 1) { currentQuantity--; productQuantitySpan.textContent = currentQuantity; } });
    cartItems.addEventListener('click', (e) => { if (e.target.classList.contains('remove-from-cart-btn')) removeFromCart(e.target.dataset.code); });
    tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    addPaymentBtn.addEventListener('click', addPayment);
    paymentEntries.addEventListener('click', (e) => { if (e.target.classList.contains('remove-payment-btn')) removePayment(parseInt(e.target.dataset.index, 10)); });
    paymentMethodSelect.addEventListener('change', () => installmentsContainer.classList.toggle('hidden', paymentMethodSelect.value !== 'Cartão de Crédito'));
    
    pairProductBtn.addEventListener('click', () => openBarcodeModal(pairProductModal, pairCategorySelect, true));
    editBarcodeBtn.addEventListener('click', () => openBarcodeModal(editBarcodeModal, editCategorySelect, false));
    
    closePairProductBtn.addEventListener('click', () => { stopScanner(); pairProductModal.classList.add('hidden'); });
    closeEditBarcodeBtn.addEventListener('click', () => { stopScanner(); editBarcodeModal.classList.add('hidden'); });
    
    pairCategorySelect.addEventListener('change', () => populateSubcategoriesFor(pairCategorySelect, pairSubcategorySelect, pairSubsubcategorySelect, pairProductSelect, 'pair', true));
    pairSubcategorySelect.addEventListener('change', () => populateSubsubcategoriesFor(pairCategorySelect, pairSubcategorySelect, pairSubsubcategorySelect, pairProductSelect, 'pair', true));
    pairSubsubcategorySelect.addEventListener('change', () => populateProductsFor(pairCategorySelect, pairSubcategorySelect, pairSubsubcategorySelect, pairProductSelect, 'pair', true));
    pairProductSelect.addEventListener('change', () => showSelectedProductInfoFor(pairProductSelect, pairedProductInfo, pairableProductsList, newStockPairInput));

    editCategorySelect.addEventListener('change', () => populateSubcategoriesFor(editCategorySelect, editSubcategorySelect, editSubsubcategorySelect, editProductSelect, 'edit', false));
    editSubcategorySelect.addEventListener('change', () => populateSubsubcategoriesFor(editCategorySelect, editSubcategorySelect, editSubsubcategorySelect, editProductSelect, 'edit', false));
    editSubsubcategorySelect.addEventListener('change', () => populateProductsFor(editCategorySelect, editSubcategorySelect, editSubsubcategorySelect, editProductSelect, 'edit', false));
    editProductSelect.addEventListener('change', () => showSelectedProductInfoFor(editProductSelect, editedProductInfo, editableProductsList, newStockEditInput));

    savePairBtn.addEventListener('click', () => saveProductPairing(pairProductSelect.value, newBarcodePairInput.value.trim(), newStockPairInput.value, pairProductModal, () => {
        populateProductsFor(pairCategorySelect, pairSubcategorySelect, pairSubsubcategorySelect, pairProductSelect, 'pair', true);
        newBarcodePairInput.value = '';
        newStockPairInput.value = '';
        pairedProductInfo.classList.add('hidden');
    }));
    saveEditBtn.addEventListener('click', () => saveProductPairing(editProductSelect.value, newBarcodeEditInput.value.trim(), newStockEditInput.value, editBarcodeModal, () => {
        populateProductsFor(editCategorySelect, editSubcategorySelect, editSubsubcategorySelect, editProductSelect, 'edit', false);
        newBarcodeEditInput.value = '';
        newStockEditInput.value = '';
        editedProductInfo.classList.add('hidden');
    }));

    scanNewBarcodePairBtn.addEventListener('click', () => requestCameraPermission(newBarcodePairInput));
    scanNewBarcodeEditBtn.addEventListener('click', () => requestCameraPermission(newBarcodeEditInput));
    
    adjustStockBtn.addEventListener('click', openAdjustStockModal);
    closeAdjustStockBtn.addEventListener('click', () => { stopScanner(); adjustStockModal.classList.add('hidden'); });
    adjustStockCodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') lookupProductForStock(adjustStockCodeInput.value.trim()); });
    scanAdjustStockBtn.addEventListener('click', () => requestCameraPermission(adjustStockCodeInput));
    saveStockAdjustmentBtn.addEventListener('click', saveStockAdjustment);
    stockDecreaseBtn.addEventListener('click', () => { const val = parseInt(adjustStockNewStock.value, 10) || 0; if (val > 0) adjustStockNewStock.value = val - 1; });
    stockIncreaseBtn.addEventListener('click', () => { const val = parseInt(adjustStockNewStock.value, 10) || 0; adjustStockNewStock.value = val + 1; });
    discount5PercentCheckbox.addEventListener('change', () => {
        if (discount5PercentCheckbox.checked) {
            discountCustomAmountInput.value = '';
        }
        updateSaleTotals();
    });
    discountCustomAmountInput.addEventListener('input', () => {
        if (discountCustomAmountInput.value) {
            discount5PercentCheckbox.checked = false;
        }
        updateSaleTotals();
    });
    focusButtons.forEach(btn => {
        btn.addEventListener('click', triggerFocus);
    });
    
    syncBtn.addEventListener('click', uploadChangesToGitHub);
    checkUpdateBtn.addEventListener('click', checkForUpdates);
    downloadUpdateBtn.addEventListener('click', async () => {
        showConfirm('Tem a certeza que deseja baixar e substituir a sua base de dados local pela nova versão online?', async (confirmed) => {
            if (confirmed) {
                try {
                    const apiResponse = await fetch(GITHUB_API_URL);
                    if (!apiResponse.ok) throw new Error('Falha ao contactar a API do GitHub.');
                    const refData = await apiResponse.json();
                    const latestCommitHash = refData.object.sha;
                    const GITHUB_DB_URL_COMMIT = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${latestCommitHash}/dados_offline.json`;

                    const response = await fetch(GITHUB_DB_URL_COMMIT);
                    if (!response.ok) throw new Error('Falha ao obter dados do GitHub.');
                    const remoteData = await response.json();

                    DB.set('products', remoteData.products);
                    DB.set('users', remoteData.users);
                    DB.set('vendas_log', remoteData.vendas_log || []);
                    DB.set('change_log', []);
                    DB.set('database_info', { version: remoteData.version });
                    showAlert('Base de dados atualizada com sucesso! A aplicação será recarregada.');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    showAlert('Não foi possível baixar a atualização. Tente novamente.');
                    console.error('Erro ao baixar atualização:', error);
                }
            }
        });
    });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // --- INICIA A APLICAÇÃO ---
    initializeApp();
});
