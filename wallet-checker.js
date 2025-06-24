document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('analyze-btn');
  const input = document.getElementById('wallet-address');
  const status = document.getElementById('wallet-status');

  btn.addEventListener('click', async () => {
    const address = input.value.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      status.textContent = 'Некорректный адрес Ethereum.';
      status.style.color = 'red';
      return;
    }

    status.textContent = '⏳ Анализируем адрес...';
    status.style.color = '#ffffff';

    try {
      const response = await fetch('http://localhost:3000/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) throw new Error('Ошибка при генерации отчета');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'wallet_report.pdf';
      link.click();

      status.textContent = '✅ Отчет успешно сгенерирован!';
      status.style.color = 'lightgreen';
    } catch (e) {
      status.textContent = '❌ Не удалось получить отчет.';
      status.style.color = 'red';
    }
  });
}); 