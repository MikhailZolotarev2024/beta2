// === КОНФИГУРАЦИЯ API-КЛЮЧЕЙ ===
const BITQUERY_API_KEY = 'ory_at_PLs7PLFfYMM0kwFc5pRG1TorLuYz279TFJS-w6q8xQc.yBCHdlCBJiQ6DaVPTjqRx51d3UpUt0tNJoZ5x9ctOuA';
const TRONGRID_API_KEY = '6f1ae13f-3084-44c6-ac92-012e26c552cf'; // <-- ВАШ КЛЮЧ TRONGRID
// const SOLANA_API_KEY = ''; // если потребуется, можно добавить

// === КОНФИГУРАЦИЯ API URL ===
const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';
const BLOCKCHAIN_API_URL = 'https://blockchain.info/rawaddr/';
const TRON_API_URL = 'https://api.trongrid.io/v1/accounts/';
const SOLANA_API_URL = 'https://api.mainnet-beta.solana.com';

// Поддерживаемые сети
const SUPPORTED_NETWORKS = {
    ETH: {
        name: 'Ethereum',
        prefix: '0x',
        length: 42,
        api: 'bitquery'
    },
    BTC: {
        name: 'Bitcoin',
        prefix: ['1', '3', 'bc1'],
        length: [26, 35, 42],
        api: 'blockchain'
    },
    BSC: {
        name: 'Binance Smart Chain',
        prefix: '0x',
        length: 42,
        api: 'bitquery'
    },
    TRX: {
        name: 'Tron',
        prefix: 'T',
        length: 34,
        api: 'tron'
    },
    SOL: {
        name: 'Solana',
        prefix: '',
        length: 44,
        api: 'solana'
    }
};

// Функция для определения сети по адресу
function detectNetwork(address) {
    const normalizedAddress = address.toLowerCase();
    
    for (const [network, config] of Object.entries(SUPPORTED_NETWORKS)) {
        if (Array.isArray(config.prefix)) {
            if (config.prefix.some(prefix => normalizedAddress.startsWith(prefix))) {
                return network;
            }
        } else if (normalizedAddress.startsWith(config.prefix)) {
            return network;
        }
    }
    
    return null;
}

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

// Функция для запроса к Blockchain API
async function queryBlockchain(address) {
    try {
        const response = await fetch(`${BLOCKCHAIN_API_URL}${address}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при запросе к Blockchain API:', error);
        throw error;
    }
}

// Функция для запроса к Tron API
async function queryTron(address) {
    try {
        const response = await fetch(`${TRON_API_URL}${address}`, {
            headers: {
                'TRON-PRO-API-KEY': TRONGRID_API_KEY
            }
        });
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return {
            balance: data.balance / 1000000, // Конвертация из SUN в TRX
            trc20: data.trc20 || {},
            transactions: data.transactions || []
        };
    } catch (error) {
        console.error('Ошибка при запросе к Tron API:', error);
        throw error;
    }
}

// Функция для запроса к Solana API
async function querySolana(address) {
    try {
        const response = await fetch(SOLANA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [
                    address,
                    {
                        encoding: 'jsonParsed'
                    }
                ]
            })
        });
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return {
            balance: data.result.value.lamports / 1000000000, // Конвертация из lamports в SOL
            owner: data.result.value.owner,
            executable: data.result.value.executable
        };
    } catch (error) {
        console.error('Ошибка при запросе к Solana API:', error);
        throw error;
    }
}

// Функция для анализа кошелька
async function analyzeWallet(address) {
    const network = detectNetwork(address);
    if (!network) {
        throw new Error('Неподдерживаемый формат адреса');
    }

    try {
        let result = { network: SUPPORTED_NETWORKS[network].name };

        switch (SUPPORTED_NETWORKS[network].api) {
            case 'bitquery':
                const bitqueryQuery = `
                    query {
                        ${network.toLowerCase()} {
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
                const bitqueryData = await queryBitquery(bitqueryQuery);
                result.bitquery = bitqueryData.data[network.toLowerCase()].address;
                break;

            case 'blockchain':
                const blockchainData = await queryBlockchain(address);
                result.blockchain = {
                    total_transactions: blockchainData.n_tx,
                    total_received: blockchainData.total_received / 100000000,
                    total_sent: blockchainData.total_sent / 100000000,
                    final_balance: blockchainData.final_balance / 100000000,
                    transactions: blockchainData.txs.slice(0, 5).map(tx => ({
                        hash: tx.hash,
                        time: new Date(tx.time * 1000).toLocaleString(),
                        size: tx.size,
                        fee: tx.fee / 100000000
                    }))
                };
                break;

            case 'tron':
                const tronData = await queryTron(address);
                result.tron = tronData;
                break;

            case 'solana':
                const solanaData = await querySolana(address);
                result.solana = solanaData;
                break;
        }

        return result;
    } catch (error) {
        console.error('Ошибка при анализе кошелька:', error);
        throw error;
    }
}

// Функция для форматирования вывода
function formatOutput(data) {
    if (!data) return 'Данные не найдены';
    
    let output = `=== Информация о кошельке (${data.network}) ===\n\n`;
    
    if (data.bitquery) {
        output += `Баланс: ${data.bitquery.balance} ${data.network === 'ETH' ? 'ETH' : 'BNB'}\n\n`;
        
        if (data.bitquery.smartContract) {
            output += `Тип контракта: ${data.bitquery.smartContract.contractType}\n`;
            if (data.bitquery.smartContract.currency) {
                output += `Токен: ${data.bitquery.smartContract.currency.symbol} (${data.bitquery.smartContract.currency.name})\n`;
            }
            output += '\n';
        }
        
        if (data.bitquery.transactions && data.bitquery.transactions.length > 0) {
            output += 'Последние транзакции:\n';
            data.bitquery.transactions.slice(0, 5).forEach(tx => {
                output += `\nХеш: ${tx.hash}\n`;
                output += `Сумма: ${tx.value} ${data.network === 'ETH' ? 'ETH' : 'BNB'}\n`;
                output += `От: ${tx.from.address}\n`;
                output += `Кому: ${tx.to.address}\n`;
                output += `Время: ${new Date(tx.timestamp).toLocaleString()}\n`;
            });
        }
    }

    if (data.blockchain) {
        output += '\n=== Информация о транзакциях ===\n\n';
        output += `Общее количество транзакций: ${data.blockchain.total_transactions}\n`;
        output += `Общий объем полученных средств: ${data.blockchain.total_received} BTC\n`;
        output += `Общий объем отправленных средств: ${data.blockchain.total_sent} BTC\n`;
        output += `Текущий баланс: ${data.blockchain.final_balance} BTC\n\n`;
        
        if (data.blockchain.transactions && data.blockchain.transactions.length > 0) {
            output += 'Последние транзакции:\n';
            data.blockchain.transactions.forEach(tx => {
                output += `\nХеш: ${tx.hash}\n`;
                output += `Время: ${tx.time}\n`;
                output += `Размер: ${tx.size} байт\n`;
                output += `Комиссия: ${tx.fee} BTC\n`;
            });
        }
    }

    if (data.tron) {
        output += `\nБаланс: ${data.tron.balance} TRX\n\n`;
        
        if (Object.keys(data.tron.trc20).length > 0) {
            output += 'TRC20 Токены:\n';
            for (const [token, balance] of Object.entries(data.tron.trc20)) {
                output += `${token}: ${balance}\n`;
            }
            output += '\n';
        }
        
        if (data.tron.transactions && data.tron.transactions.length > 0) {
            output += 'Последние транзакции:\n';
            data.tron.transactions.slice(0, 5).forEach(tx => {
                output += `\nХеш: ${tx.txID}\n`;
                output += `Время: ${new Date(tx.raw_data.timestamp).toLocaleString()}\n`;
            });
        }
    }

    if (data.solana) {
        output += `\nБаланс: ${data.solana.balance} SOL\n`;
        output += `Владелец: ${data.solana.owner}\n`;
        output += `Исполняемый: ${data.solana.executable ? 'Да' : 'Нет'}\n`;
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
        outputBlock.textContent = error.message || 'Произошла ошибка при анализе кошелька. Пожалуйста, попробуйте позже.';
    }
}); 