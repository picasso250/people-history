<script>
    export let inscriptions = [];

    function formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    function formatTxHash(hash) {
        if (!hash) return '';
        return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    }
    
    function formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }
</script>

<section class="recent-inscriptions">
    <h3>最近铭刻</h3>
    {#if inscriptions.length > 0}
        {#each inscriptions as item (item.transactionHash)}
            <div class="inscription-card">
                <div class="meta-top">
                    <span class="timestamp">{formatDate(item.timestamp)}</span>
                    <a class="tx-link" href={`https://arbiscan.io/tx/${item.transactionHash}`} target="_blank" rel="noopener noreferrer">
                       Tx: {formatTxHash(item.transactionHash)}
                    </a>
                </div>

                <p class="inscription-content">{item.content}</p>
                
                <div class="meta-bottom">
                    <span class="author" title={item.author}>
                        by: {formatAddress(item.author)}
                    </span>
                </div>
            </div>
        {/each}
    {:else}
        <p>正在加载历史记录...</p>
    {/if}
</section>

<style>
    .recent-inscriptions {
      text-align: left;
      border-top: 1px solid var(--accent-color);
      padding-top: 2rem;
    }

    .recent-inscriptions h3 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 400;
      color: var(--primary-color);
    }

    .inscription-card {
      background-color: #1A1A1A;
      border: 1px solid var(--accent-color);
      border-radius: 4px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      animation: fadeIn 0.5s ease-in-out;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .inscription-content {
      font-size: 1.1rem;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0; /* Reset margin */
    }

    .meta-top, .meta-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--accent-color);
      font-family: monospace;
    }

    .meta-bottom {
        justify-content: flex-end;
    }

    .tx-link {
      color: var(--accent-color);
      text-decoration: none;
      padding: 0.3rem 0.5rem;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.2s ease-in-out;
    }

    .tx-link:hover {
      color: var(--primary-color);
      border-color: var(--accent-color);
      background-color: #2a2a2a;
    }

    /* --- Mobile Responsive --- */
    @media (max-width: 600px) {
        .inscription-card {
            gap: 0.75rem;
        }

        .meta-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .meta-bottom {
            margin-top: 0.5rem;
        }
    }
</style>