import React, { useState, useEffect, useRef } from 'react';

export default function CryptoCalculatorModal({ coinData, onClose }) {
  const [amount, setAmount] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState(coinData[0]?.id || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    setResult(null);
  }, [amount, selectedCoinId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const isButtonDisabled = !amount || parseFloat(amount) <= 0;

  const handleCalculate = () => {
    const coin = coinData.find((c) => c.id === selectedCoinId);
    const inputAmount = parseFloat(amount);
    if (!coin) return;

    const changePercent = coin.price_change_percentage_24h;
    const changeDecimal = changePercent / 100;
    const profitOrLoss = inputAmount * changeDecimal;
    const finalAmount = inputAmount + profitOrLoss;

    setResult({
      finalAmount: finalAmount.toFixed(2),
      profitOrLoss: profitOrLoss.toFixed(2),
      isProfit: profitOrLoss >= 0,
      error: null,
    });
  };

  const filteredCoins = coinData.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCoin = coinData.find(c => c.id === selectedCoinId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>24h Profit/Loss Calculator</h2>

        <div className="modal-input-group">
          <label htmlFor="amount">Amount (USD)</label>
          <input
            id="amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100"
            className="modal-input"
          />
        </div>

        <div className="modal-input-group">
          <label htmlFor="crypto-search">Cryptocurrency</label>
          <div className="modal-dropdown-container" ref={dropdownRef}>
            <input
              id="crypto-search"
              type="text"
              className="modal-input"
              value={isDropdownOpen ? searchTerm : (selectedCoin?.name || '')}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search coin..."
            />
            {isDropdownOpen && (
              <div className="modal-dropdown-list">
                {filteredCoins.length > 0 ? (
                  filteredCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className="modal-dropdown-item"
                      onClick={() => {
                        setSelectedCoinId(coin.id);
                        setSearchTerm('');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <img src={coin.image} alt={coin.symbol} style={{ width: 20, height: 20 }}/>
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </div>
                  ))
                ) : (
                  <div className="modal-dropdown-item-none">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="modal-button" 
          disabled={isButtonDisabled} 
        >
          Calculate
        </button>

        {result && (
          <div className="modal-result">
            {result.error ? (
              <p style={{ color: 'var(--danger)' }}>{result.error}</p>
            ) : (
              <>
                <p>Your ${amount} invested 24h ago would now be worth:</p>
                <h3
                  style={{
                    color: result.isProfit ? '#16a34a' : 'var(--danger)',
                    fontSize: '1.5rem',
                    margin: '0.5rem 0',
                  }}
                >
                  ${result.finalAmount}
                </h3>
                <p>
                  A {result.isProfit ? 'profit' : 'loss'} of{' '}
                  <strong>
                    {result.isProfit ? '+' : ''}${result.profitOrLoss}
                  </strong>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
