// === КОНФИГУРАЦИЯ API-КЛЮЧЕЙ ===
const BITQUERY_API_KEY = 'ory_at_PLs7PLFfYMM0kwFc5pRG1TorLuYz279TFJS-w6q8xQc.yBCHdlCBJiQ6DaVPTjqRx51d3UpUt0tNJoZ5x9ctOuA';
const TRONGRID_API_KEY = '6f1ae13f-3084-44c6-ac92-012e26c552cf'; // <-- ВАШ КЛЮЧ TRONGRID
// const SOLANA_API_KEY = ''; // если потребуется, можно добавить

// === КОНФИГУРАЦИЯ API URL ===
const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';
const BLOCKCHAIN_API_URL = 'https://blockchain.info/rawaddr/';
const TRON_API_URL = 'https://api.trongrid.io/v1/accounts/';
const SOLANA_API_URL = 'https://api.mainnet-beta.solana.com';

const BLOCKCHAIR_API_KEY = 'public-api';
const BLOCKCHAIR_API_URL = 'https://api.blockchair.com/bitcoin/dashboards/address/';

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
                'Authorization': 'Bearer ' + BITQUERY_API_KEY
            },
            body: JSON.stringify({ query })
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error(text);
        }
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

// Функция для запроса к Tron API (расширенная)
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
        // Получаем историю транзакций (до 100)
        let txs = [];
        const txResp = await fetch(`https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=100&address=${address}`);
        const txData = await txResp.json();
        if (txData.data) txs = txData.data;
        // Анализируем даты и контрагентов
        let firstDate = null;
        let lastDate = null;
        let allRecipients = [];
        let allSenders = [];
        txs.forEach(tx => {
            const ts = tx.timestamp;
            if (!firstDate || ts < firstDate) firstDate = ts;
            if (!lastDate || ts > lastDate) lastDate = ts;
            if (tx.toAddress) allRecipients.push(tx.toAddress);
            if (tx.ownerAddress) allSenders.push(tx.ownerAddress);
        });
        // Топ-3 получателя
        const freq = {};
        allRecipients.forEach(addr => { if (addr) freq[addr] = (freq[addr]||0)+1; });
        const topRecipients = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([addr,count])=>({addr,count}));
        const uniqueCounterparties = new Set([...allRecipients, ...allSenders].filter(Boolean));
        return {
            balance: data.balance / 1000000, // Конвертация из SUN в TRX
            trc20: data.trc20 || {},
            transactions: txs,
            first_tx_date: firstDate ? new Date(firstDate).toLocaleString() : null,
            last_tx_date: lastDate ? new Date(lastDate).toLocaleString() : null,
            unique_counterparties: uniqueCounterparties.size,
            top_recipients: topRecipients
        };
    } catch (error) {
        console.error('Ошибка при запросе к Tron API:', error);
        throw error;
    }
}

// Функция для запроса к Solscan API (расширенная)
async function querySolana(address) {
    try {
        // Получаем историю транзакций (до 100)
        const txResp = await fetch(`https://public-api.solscan.io/account/transactions?address=${address}&limit=100`);
        const txs = await txResp.json();
        let firstDate = null;
        let lastDate = null;
        let allRecipients = [];
        let allSenders = [];
        txs.forEach(tx => {
            const ts = tx.blockTime * 1000;
            if (!firstDate || ts < firstDate) firstDate = ts;
            if (!lastDate || ts > lastDate) lastDate = ts;
            if (tx.parsedInstruction && tx.parsedInstruction.length > 0) {
                tx.parsedInstruction.forEach(instr => {
                    if (instr.type === 'transfer') {
                        if (instr.info && instr.info.destination) allRecipients.push(instr.info.destination);
                        if (instr.info && instr.info.source) allSenders.push(instr.info.source);
                    }
                });
            }
        });
        // Топ-3 получателя
        const freq = {};
        allRecipients.forEach(addr => { if (addr) freq[addr] = (freq[addr]||0)+1; });
        const topRecipients = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([addr,count])=>({addr,count}));
        const uniqueCounterparties = new Set([...allRecipients, ...allSenders].filter(Boolean));
        // Получаем баланс и владельца
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
        return {
            balance: data.result.value.lamports / 1000000000,
            owner: data.result.value.owner,
            executable: data.result.value.executable,
            first_tx_date: firstDate ? new Date(firstDate).toLocaleString() : null,
            last_tx_date: lastDate ? new Date(lastDate).toLocaleString() : null,
            unique_counterparties: uniqueCounterparties.size,
            top_recipients: topRecipients
        };
    } catch (error) {
        console.error('Ошибка при запросе к Solana API:', error);
        throw error;
    }
}

// Функция для получения базовых данных через ethers.js
async function getEthersBaseInfo(address) {
    try {
        const provider = new ethers.JsonRpcProvider("https://green-thrumming-mountain.quiknode.pro/8a77a6ba8c1788e8a4c683d8fb4b85e52c4fe66f/");
        const [balance, txCount, block, ensName] = await Promise.all([
            provider.getBalance(address),
            provider.getTransactionCount(address),
            provider.getBlock("latest"),
            provider.lookupAddress(address)
        ]);
        return {
            eth_balance: ethers.formatEther(balance),
            nonce: txCount,
            gasLimit: block.gasLimit.toString(),
            ens: ensName || "—"
        };
    } catch (err) {
        return null;
    }
}

// Функция для запроса к Blockchair API (Bitcoin)
async function queryBlockchairBTC(address) {
    try {
        const response = await fetch(`${BLOCKCHAIR_API_URL}${address}?key=${BLOCKCHAIR_API_KEY}`);
        const data = await response.json();
        if (!data.data || !data.data[address]) throw new Error('Нет данных от Blockchair');
        const info = data.data[address].address;
        const txs = data.data[address].transactions || [];
        const tags = data.data[address].tags || [];
        // Получаем список транзакций (ограничим до 100 для анализа)
        let txList = [];
        if (txs.length > 0) {
            const txResp = await fetch(`https://api.blockchair.com/bitcoin/dashboards/transactions/${txs.slice(0,100).join(',')}?key=${BLOCKCHAIR_API_KEY}`);
            const txData = await txResp.json();
            txList = Object.values(txData.data || {});
        }
        // Анализируем контрагентов и даты
        let allOutputs = [];
        let allInputs = [];
        let firstDate = null;
        let lastDate = null;
        txList.forEach(tx => {
            const t = tx.transaction;
            if (!firstDate || t.time < firstDate) firstDate = t.time;
            if (!lastDate || t.time > lastDate) lastDate = t.time;
            allOutputs.push(...(tx.outputs || []).map(o => o.recipient));
            allInputs.push(...(tx.inputs || []).map(i => i.recipient));
        });
        // Топ-3 получателя
        const freq = {};
        allOutputs.forEach(addr => { if (addr) freq[addr] = (freq[addr]||0)+1; });
        const topRecipients = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([addr,count])=>({addr,count}));
        // Уникальные контрагенты
        const uniqueCounterparties = new Set([...allOutputs, ...allInputs].filter(Boolean));
        return {
            first_tx_date: firstDate,
            last_tx_date: lastDate,
            unique_counterparties: uniqueCounterparties.size,
            top_recipients: topRecipients,
            tags: tags.map(t=>t.label)
        };
    } catch (error) {
        console.error('Ошибка при запросе к Blockchair API:', error);
        return null;
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
                            address(address: {is: \"${address}\"}) {
                                balance
                                smartContract {
                                    contractType
                                    currency {
                                        symbol
                                        name
                                    }
                                }
                                tokenBalances {
                                    currency {
                                        address
                                        symbol
                                        name
                                        decimals
                                    }
                                    value
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
                                annotation {
                                    type
                                    description
                                }
                                firstTx: transactions(orderBy: {asc: block, asc: index}, limit: 1) {
                                    timestamp
                                }
                                lastTx: transactions(orderBy: {desc: block, desc: index}, limit: 1) {
                                    timestamp
                                }
                                outgoingTxs: transactions(sender: {is: \"${address}\"}) {
                                    to {
                                        address
                                    }
                                }
                            }
                        }
                    }
                `;
                const [bitqueryData, ethersBase] = await Promise.all([
                    queryBitquery(bitqueryQuery),
                    network === 'ETH' ? getEthersBaseInfo(address) : Promise.resolve(null)
                ]);
                const addrData = bitqueryData.data[network.toLowerCase()].address;
                // Анализируем контрагентов и топ-3 получателя
                let allRecipients = [];
                if (addrData && addrData.outgoingTxs) {
                    allRecipients = addrData.outgoingTxs.map(tx => tx.to && tx.to.address).filter(Boolean);
                }
                const freq = {};
                allRecipients.forEach(addr => { if (addr) freq[addr] = (freq[addr]||0)+1; });
                const topRecipients = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([addr,count])=>({addr,count}));
                const uniqueCounterparties = new Set(allRecipients);
                result.bitquery = addrData;
                result.bitquery_topRecipients = topRecipients;
                result.bitquery_uniqueCounterparties = uniqueCounterparties.size;
                result.bitquery_firstTx = addrData.firstTx && addrData.firstTx[0] ? addrData.firstTx[0].timestamp : null;
                result.bitquery_lastTx = addrData.lastTx && addrData.lastTx[0] ? addrData.lastTx[0].timestamp : null;
                result.bitquery_risk = addrData.annotation && addrData.annotation.length > 0 ? addrData.annotation.map(a=>a.type+': '+a.description).join(', ') : null;
                if (ethersBase) result.ethers = ethersBase;
                break;

            case 'blockchain':
                const [blockchainData, blockchairData] = await Promise.all([
                    queryBlockchain(address),
                    queryBlockchairBTC(address)
                ]);
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
                    })),
                    ...blockchairData
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
    
    if (data.ethers) {
        output += `📍 Адрес: ...\n`;
        output += `🔠 ENS: ${data.ethers.ens}\n`;
        output += `💰 Баланс (ethers.js): ${data.ethers.eth_balance} ETH\n`;
        output += `🔁 Кол-во транзакций (nonce): ${data.ethers.nonce}\n`;
        output += `⛽ Газовый лимит последнего блока: ${data.ethers.gasLimit}\n`;
    }

    if (data.bitquery) {
        output += `\nБаланс (Bitquery): ${data.bitquery.balance} ${data.network === 'ETH' ? 'ETH' : 'BNB'}\n`;
        
        if (data.bitquery.smartContract) {
            output += `Тип контракта: ${data.bitquery.smartContract.contractType}\n`;
            if (data.bitquery.smartContract.currency) {
                output += `Токен: ${data.bitquery.smartContract.currency.symbol} (${data.bitquery.smartContract.currency.name})\n`;
            }
            output += '\n';
        }
        
        if (data.bitquery.tokenBalances && data.bitquery.tokenBalances.length > 0) {
            output += 'Токены (ERC-20):\n';
            data.bitquery.tokenBalances.slice(0, 10).forEach(token => {
                output += `- ${token.currency.symbol}: ${token.value / Math.pow(10, token.currency.decimals)}\n`;
            });
        }
        
        if (data.bitquery_firstTx) output += `Первая транзакция: ${new Date(data.bitquery_firstTx * 1000).toLocaleString()}\n`;
        if (data.bitquery_lastTx) output += `Последняя активность: ${new Date(data.bitquery_lastTx * 1000).toLocaleString()}\n`;
        if (data.bitquery_uniqueCounterparties) output += `Уникальных контрагентов: ${data.bitquery_uniqueCounterparties}\n`;
        if (data.bitquery_topRecipients && data.bitquery_topRecipients.length > 0) {
            output += 'Топ-3 получателя:\n';
            data.bitquery_topRecipients.forEach((r,i)=>{
                output += `${i+1}. ${r.addr} (${r.count} раз)\n`;
            });
        }
        if (data.bitquery_risk) output += `Метки риска: ${data.bitquery_risk}\n`;
        if (data.bitquery.transactions && data.bitquery.transactions.length > 0) {
            output += '\nПоследние транзакции:\n';
            data.bitquery.transactions.slice(0, 10).forEach(tx => {
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
        output += `Текущий баланс: ${data.blockchain.final_balance} BTC\n`;
        output += `\nДата первой транзакции: ${data.blockchain.first_tx_date || 'нет данных'}\n`;
        output += `Дата последней активности: ${data.blockchain.last_tx_date || 'нет данных'}\n`;
        output += `Уникальных контрагентов: ${typeof data.blockchain.unique_counterparties === 'number' ? data.blockchain.unique_counterparties : 'нет данных'}\n`;
        if (data.blockchain.top_recipients && data.blockchain.top_recipients.length > 0) {
            output += 'Топ-3 получателя:\n';
            data.blockchain.top_recipients.forEach((r,i)=>{
                output += `${i+1}. ${r.addr} (${r.count} раз)\n`;
            });
        } else {
            output += 'Топ-3 получателя: нет данных\n';
        }
        if (data.blockchain.tags && data.blockchain.tags.length > 0) {
            output += `Метки риска: ${data.blockchain.tags.join(', ')}\n`;
        }
        if (data.blockchain.transactions && data.blockchain.transactions.length > 0) {
            output += '\nПоследние транзакции:\n';
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
        
        if (data.tron.first_tx_date) output += `Первая транзакция: ${data.tron.first_tx_date}\n`;
        if (data.tron.last_tx_date) output += `Последняя активность: ${data.tron.last_tx_date}\n`;
        if (data.tron.unique_counterparties) output += `Уникальных контрагентов: ${data.tron.unique_counterparties}\n`;
        if (data.tron.top_recipients && data.tron.top_recipients.length > 0) {
            output += 'Топ-3 получателя:\n';
            data.tron.top_recipients.forEach((r,i)=>{
                output += `${i+1}. ${r.addr} (${r.count} раз)\n`;
            });
        }
        if (data.tron.transactions && data.tron.transactions.length > 0) {
            output += 'Последние транзакции:\n';
            data.tron.transactions.slice(0, 5).forEach(tx => {
                output += `\nХеш: ${tx.txID}\n`;
                output += `Время: ${new Date(tx.timestamp).toLocaleString()}\n`;
            });
        }
    }

    if (data.solana) {
        output += `\nБаланс: ${data.solana.balance} SOL\n`;
        output += `Владелец: ${data.solana.owner}\n`;
        output += `Исполняемый: ${data.solana.executable ? 'Да' : 'Нет'}\n`;
        if (data.solana.first_tx_date) output += `Первая транзакция: ${data.solana.first_tx_date}\n`;
        if (data.solana.last_tx_date) output += `Последняя активность: ${data.solana.last_tx_date}\n`;
        if (data.solana.unique_counterparties) output += `Уникальных контрагентов: ${data.solana.unique_counterparties}\n`;
        if (data.solana.top_recipients && data.solana.top_recipients.length > 0) {
            output += 'Топ-3 получателя:\n';
            data.solana.top_recipients.forEach((r,i)=>{
                output += `${i+1}. ${r.addr} (${r.count} раз)\n`;
            });
        }
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