<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function close() {
        dispatch('close');
    }
</script>

<div class="commitment-view" role="dialog" aria-modal="true">
    <button class="close-button" on:click={close}>&times;</button>
    <div class="content">
        <header>
            <h1>我们的承诺</h1>
            <h2>代码即法律，协议即信任</h2>
        </header>
        
        <section>
            <p>《众语史书》的永久存续，不依赖于任何个人或团队的道德，而是建立在冰冷、公开、不可篡改的代码之上。</p>
            <p>我们在此做出两点核心技术承诺：</p>
        </section>

        <section>
            <h3>1. 合约权限被永久销毁</h3>
            <p>部署完成后，智能合约的所有权将通过调用 <code>renounceOwnership()</code> 函数被<strong>立即放弃</strong>。</p>
            <p>这意味着，包括我们自己在内，全世界<strong>没有任何人</strong>可以修改、暂停或删除这个合约。它将成为一个在Arbitrum网络上自主运行的公共设施，直到网络本身消亡。</p>
            <p class="verification">
                <strong>状态:</strong> <span class="status-done">已完成</span> <br>
                <strong>验证交易:</strong> <a href="https://arbiscan.io/tx/0xbde3d6831ae46730872567b1e6866a7def1c41f3ca00566fcaf3a97343f94b48" target="_blank" rel="noopener noreferrer" class="tx-link">0xbde3d6831ae46730872567b1e6866a7def1c41f3ca00566fcaf3a97343f94b48</a>
            </p>
        </section>

        <section>
            <h3>2. 前端代码完全开源</h3>
            <p>我们不依赖任何中心化服务器。官网是一个纯粹的静态网站，其全部代码100%开源。</p>
            <p>即使我们的官方网站无法访问，任何人都可以下载代码，通过Vercel, Netlify或GitHub Pages等服务在<strong>一分钟内</strong>部署一个功能完全相同的前端入口，接入同一个永恒的后端合约。</p>
        </section>

        <section class="final-cta">
            <p>我们的信任，来自彻底的无需信任。</p>
        </section>
    </div>
</div>

<style>
    .commitment-view {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: var(--background-color); z-index: 100;
        overflow-y: auto; animation: fadeIn 0.5s ease-in-out; text-align: left;
    }
    .content {
        width: 100%; max-width: 720px; margin: 0 auto;
        padding: 4rem 2rem 6rem;
    }
    .close-button {
        position: fixed; top: 1rem; right: 1.5rem; font-size: 2.5rem;
        color: var(--accent-color); background: transparent; border: none;
        cursor: pointer; z-index: 110;
    }
    .close-button:hover { color: var(--primary-color); }
    header {
        text-align: center; margin-bottom: 3rem;
        border-bottom: 1px solid var(--accent-color); padding-bottom: 2rem;
    }
    header h1 { font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem; }
    header h2 { font-size: 1.2rem; font-weight: 400; }
    section { margin-bottom: 2.5rem; }
    section h3 { font-size: 1.5rem; color: var(--primary-color); margin-bottom: 1rem; font-weight: 700; }
    section p { font-size: 1.1rem; line-height: 1.8; margin-bottom: 1rem; color: var(--text-color); }
    .final-cta {
        text-align: center; font-size: 1.3rem; margin-top: 3rem;
        font-weight: 700; color: var(--primary-color);
    }
    .verification {
        background-color: #1A1A1A;
        border-left: 3px solid var(--accent-color);
        padding: 1rem;
        font-family: monospace;
        line-height: 1.6;
        word-break: break-all;
    }
    .status-done {
        color: var(--success-color);
        font-weight: bold;
    }
    code {
        background-color: #2a2a2a;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: monospace;
    }
    .tx-link {
        color: var(--primary-color);
        text-decoration: none;
    }
    .tx-link:hover {
        text-decoration: underline;
    }
</style>