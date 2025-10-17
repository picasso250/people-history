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
            <h1>缘起</h1>
            <h2>我们正在失去记忆，但这一次，我们选择反抗。</h2>
        </header>
        
        <section>
            <h3>切肤之痛</h3>
            <p>一种遗忘：时间轴上被凭空抹去的那三年，那场在某个十二月被画上句号、从此绝口不提的集体高烧。</p>
            <p>它也是百度贴吧中，一夜之间化为乌有的、2017年之前的所有帖子，那里面有我们最早的追星、游戏攻略和青涩的争论。</p>
            <p>是天涯论坛的无法访问，宣告了一个时代BBS文化的落幕，无数人的青春记忆与思想火花被一并埋葬。</p>
            <p>我们曾以为互联网是永恒的，但现实是，我们正生活在一个记忆被大规模、静默清除的时代。我们的数字遗产，脆弱得不堪一击。</p>
            <p>我们正在集体失忆。而比失忆更可怕的，是习惯失忆。</p>
        </section>

        <section>
            <h3>来自两千年前的启示</h3>
            <p>1975年，湖北云梦县，一批深埋于地下的秦简被发掘。在这些竹简之中，藏着两片小小的木牍。那不是法律条文，也不是官方纪事，而是两千多年前，两个名叫“黑夫”和“惊”的普通秦国士兵，从淮阳前线写给家里的信。</p>
            <p>信里，他们没有谈论开疆拓土的宏图伟业。他们只是在跟母亲和兄长焦急地解释，战事紧急，请求家里赶紧寄钱和衣物来。</p>
            <p>这就是历史的真相。它往往隐藏在帝王将相的功业之外，隐藏在这些最朴素、最真实的个体记录之中。人民的、个体的、日常的记录，才是文明最坚韧的基石。</p>
        </section>

        <section>
            <h3>伟大的愿景：成为文明的守夜人</h3>
            <p>我们正在发起的，不仅仅是一个项目，更是一场“数字考古运动”。</p>
            <p>我们服务的终极用户，不是今天的我们，而是百年后、千年后的历史学家、社会学者，以及所有希望回望我们这个时代的后人。</p>
            <p>现在，我们把书写的权利交给你。</p>
            <p>今天，你愿意铭刻下什么，留给一千年后的世界？</p>
            <p>我们邀请你，加入我们，成为数字文明的守夜人。为我们的时代，留下第一手的、未经篡改的、真正属于人民的信史。</p>
            <p class="final-cta">Inscribe your verse.<br>(铭刻下，你的诗篇。)</p>
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
</style>