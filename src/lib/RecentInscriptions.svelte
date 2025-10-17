<script>
    export let inscriptions = [];

    function formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
                <p class="inscription-content">"{item.content}"</p>
                <div class="inscription-meta">
                    <span>{formatDate(item.timestamp)}</span>
                    <a href={`https://arbiscan.io/address/${item.author}`} target="_blank" rel="noopener noreferrer">
                        by: {formatAddress(item.author)}
                    </a>
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
    }

    .inscription-content {
      font-size: 1.1rem;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 1rem;
    }

    .inscription-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--accent-color);
      font-family: monospace;
    }

    .inscription-meta a {
      color: var(--accent-color);
      text-decoration: none;
    }

    .inscription-meta a:hover {
      color: var(--primary-color);
    }
</style>