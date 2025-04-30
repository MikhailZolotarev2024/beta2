// Конфигурация Bitquery API
const BITQUERY_API_KEY = 'YOUR_BITQUERY_API_KEY'; // Замените на ваш API ключ
const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';

// Функция для запроса к Bitquery API
async function queryBitquery(query) {
    try {
        const response = await fetch(BITQUERY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': BITQUERY_API_KEY
            },
            body: JSON.stringify({ query })
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка при запросе к Bitquery:', error);
        throw error;
    }
}

// Функция для анализа кошелька
async function analyzeWallet(address) {
    try {
        // Запрос для получения баланса и транзакций
        const query = `
            query {
                ethereum {
                    address(address: {is: "${address}"}) {
                        balance
                        smartContract {
                            contractType
                            currency {
                                symbol
                                name
                            }
                        }
                        transactions {
                            hash
                            value
                            timestamp
                            from {
                                address
                            }
                            to {
                                address
                            }
                        }
                    }
                }
            }
        `;

        const result = await queryBitquery(query);
        return result.data.ethereum.address;
    } catch (error) {
        console.error('Ошибка при анализе кошелька:', error);
        throw error;
    }
}

// Функция для форматирования вывода
function formatOutput(data) {
    if (!data) return 'Данные не найдены';
    
    let output = '=== Информация о кошельке ===\n\n';
    
    // Баланс
    output += `Баланс: ${data.balance} ETH\n\n`;
    
    // Информация о контракте, если это смарт-контракт
    if (data.smartContract) {
        output += `Тип контракта: ${data.smartContract.contractType}\n`;
        if (data.smartContract.currency) {
            output += `Токен: ${data.smartContract.currency.symbol} (${data.smartContract.currency.name})\n`;
        }
        output += '\n';
    }
    
    // Последние транзакции
    if (data.transactions && data.transactions.length > 0) {
        output += 'Последние транзакции:\n';
        data.transactions.slice(0, 5).forEach(tx => {
            output += `\nХеш: ${tx.hash}\n`;
            output += `Сумма: ${tx.value} ETH\n`;
            output += `От: ${tx.from.address}\n`;
            output += `Кому: ${tx.to.address}\n`;
            output += `Время: ${new Date(tx.timestamp).toLocaleString()}\n`;
        });
    }
    
    return output;
}

// Обработчик кнопки анализа
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const address = document.getElementById('wallet-address').value.trim();
    const outputBlock = document.getElementById('output-block');
    
    if (!address) {
        outputBlock.textContent = 'Пожалуйста, введите адрес кошелька';
        return;
    }
    
    try {
        outputBlock.textContent = 'Анализируем...';
        const walletData = await analyzeWallet(address);
        outputBlock.textContent = formatOutput(walletData);
    } catch (error) {
        outputBlock.textContent = 'Произошла ошибка при анализе кошелька. Пожалуйста, попробуйте позже.';
    }
}); 