<script>
    import { createEventDispatcher } from 'svelte';

    export let isLoading;
    export let account;
    export let statusMessage;
    export let errorMessage;
    export let txHash;

    let content = "";
    export let view = "form"; // 'form', 'success'

    const dispatch = createEventDispatcher();

    function handleInscribeClick() {
        dispatch('inscribe', { content });
    }

    function handleResetClick() {
        content = "";
        view = "form";
        dispatch('reset');
    }

    function copyTxHash() {
        navigator.clipboard.writeText(txHash);
    }
</script>

{#if view === 'form'}
    <div class="altar">
        <textarea 
            class="verse-box" 
            bind:value={content}
            placeholder="今天，你愿意铭刻下什么，留给一千年后的世界？"
            disabled={isLoading}
        ></textarea>
        
        <button 
            class="inscribe-button" 
            on:click={handleInscribeClick}
            disabled={isLoading || (statusMessage === '请安装 MetaMask 钱包')}
        >
            {account ? statusMessage : '连接钱包 (Connect Wallet)'}
        </button>
        
        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}
    </div>
{:else if view === 'success'}
    <div class="success-view">
        <h2>铭刻成功 (Inscribed)</h2>
        <p>你的永恒数字坐标：</p>
        <div class="tx-hash-wrapper">
            <span class="tx-hash">{txHash}</span>
            <button class="copy-button" on:click={copyTxHash}>复制</button>
        </div>
        <a 
            href={`https://arbiscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            class="arbiscan-link"
        >
            在 Arbiscan 上验证 &rarr;
        </a>
        <button class="inscribe-button" on:click={handleResetClick}>
            再铭刻一条 (Inscribe Another)
        </button>
    </div>
{/if}

<style>
    .altar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: opacity 0.5s ease-in-out;
      margin-bottom: 4rem; /* Space between altar and recent inscriptions */
    }

    .verse-box {
      background-color: #1A1A1A;
      border: 1px solid var(--accent-color);
      border-radius: 4px;
      color: var(--text-color);
      font-family: var(--font-family);
      font-size: 1.1rem;
      padding: 1rem;
      min-height: 200px;
      resize: vertical;
      width: 100%;
    }

    .verse-box:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .inscribe-button {
      background-color: transparent;
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      padding: 0.75rem 1.5rem;
      font-family: var(--font-family);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 50px;
    }

    .inscribe-button:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: var(--background-color);
    }

    .inscribe-button:disabled {
      border-color: var(--accent-color);
      color: var(--accent-color);
      cursor: not-allowed;
      animation: pulse 2s infinite ease-in-out;
    }

    .success-view {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      animation: fadeIn 0.8s ease-in-out;
      margin-bottom: 4rem;
    }

    .success-view h2 {
      font-size: 1.8rem;
      color: var(--success-color);
    }

    .tx-hash-wrapper {
      background-color: #1A1A1A;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid var(--accent-color);
      word-break: break-all;
      position: relative;
    }

    .tx-hash {
      font-family: monospace;
      color: var(--primary-color);
    }

    .copy-button {
      position: absolute;
      top: 5px;
      right: 5px;
      background: var(--accent-color);
      border: none;
      color: var(--text-color);
      padding: 5px 8px;
      cursor: pointer;
      border-radius: 3px;
    }

    .arbiscan-link {
      color: var(--primary-color);
      text-decoration: none;
      border-bottom: 1px dotted var(--primary-color);
    }
    
    .error {
        color: #ef5350;
    }
</style>