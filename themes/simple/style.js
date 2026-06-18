/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
  :root {
    --simple-page-width: 1400px;
    --simple-article-width: 1040px;
    --simple-bg: #f4f7fb;
    --simple-bg-soft: #edf4fb;
    --simple-card: rgba(255, 255, 255, 0.92);
    --simple-card-solid: #ffffff;
    --simple-text: #243241;
    --simple-muted: #6b7c8f;
    --simple-faint: #edf2f7;
    --simple-border: rgba(124, 146, 169, 0.22);
    --simple-primary: #2f6f9f;
    --simple-primary-deep: #1f4f78;
    --simple-accent: #f1aa52;
    --simple-shadow: 0 18px 50px rgba(45, 77, 108, 0.12);
    --simple-shadow-soft: 0 10px 24px rgba(45, 77, 108, 0.09);
    --simple-radius: 18px;
    --simple-radius-sm: 10px;
  }

  .dark {
    --simple-bg: #15191f;
    --simple-bg-soft: #10141a;
    --simple-card: rgba(31, 37, 46, 0.92);
    --simple-card-solid: #1f252e;
    --simple-text: #e7edf4;
    --simple-muted: #9aa8b8;
    --simple-faint: #2a323d;
    --simple-border: rgba(207, 222, 238, 0.14);
    --simple-primary: #7db7df;
    --simple-primary-deep: #b7dcf6;
    --simple-accent: #f2bd72;
    --simple-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
    --simple-shadow-soft: 0 10px 24px rgba(0, 0, 0, 0.24);
  }

  body {
    background:
      radial-gradient(circle at 8% 4%, rgba(83, 153, 204, 0.18), transparent 30rem),
      radial-gradient(circle at 92% 8%, rgba(241, 170, 82, 0.16), transparent 26rem),
      linear-gradient(135deg, var(--simple-bg), var(--simple-bg-soft));
    color: var(--simple-text);
    font-family: "MiSans VF", "OPPO Sans", "LXGW WenKai Screen", "Noto Serif SC", "Microsoft Yahei", sans-serif;
  }

  .dark body {
    background:
      radial-gradient(circle at 10% 0%, rgba(72, 130, 174, 0.18), transparent 30rem),
      radial-gradient(circle at 90% 8%, rgba(210, 137, 54, 0.12), transparent 28rem),
      linear-gradient(135deg, var(--simple-bg), var(--simple-bg-soft));
  }

  .forbid-copy {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  #theme-simple {
    background: transparent !important;
    color: var(--simple-text);
  }

  #theme-simple::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(47, 111, 159, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(47, 111, 159, 0.045) 1px, transparent 1px);
    background-size: 38px 38px;
    mask-image: linear-gradient(to bottom, #000, transparent 78%);
  }

  #theme-simple #container-wrapper {
    width: min(var(--simple-page-width), calc(100vw - 48px)) !important;
    max-width: none !important;
    gap: 14px;
    padding-top: 28px !important;
    padding-bottom: 48px;
  }

  #theme-simple #container-inner,
  #theme-simple [id="container-inner "] {
    min-width: 0;
  }

  @media (min-width: 1280px) {
    #theme-simple .xl\:max-w-4xl,
    #theme-simple .xl\:max-w-5xl {
      max-width: var(--simple-article-width) !important;
    }
  }

  #theme-simple header.h-80 {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    height: auto !important;
    min-height: 220px;
    margin: 28px auto 18px;
    border: 1px solid var(--simple-border);
    border-radius: 28px;
    background: #f9fbfd !important;
    box-shadow: var(--simple-shadow);
    overflow: hidden;
    isolation: isolate;
  }

  #theme-simple header.h-80::before {
    content: "";
    position: absolute;
    inset: -10px;
    z-index: 0;
    background-image: url("/images/simple-hero-bg.webp");
    background-size: cover;
    background-position: center 43%;
    filter: saturate(0.82) contrast(0.94) brightness(1.06) blur(0.6px);
    opacity: 0.74;
    transform: scale(1.018);
  }

  #theme-simple header.h-80::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(ellipse 30% 74% at 50% 42%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.84) 34%, rgba(255, 255, 255, 0.36) 58%, rgba(255, 255, 255, 0.08) 100%),
      linear-gradient(90deg, rgba(248, 252, 255, 0.22), rgba(248, 252, 255, 0.06) 24%, rgba(248, 252, 255, 0.04) 76%, rgba(248, 252, 255, 0.22)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(0.4px);
  }

  .dark #theme-simple header.h-80 {
    background: #1f252e !important;
  }

  .dark #theme-simple header.h-80::before {
    filter: saturate(0.72) contrast(0.88) brightness(0.78) blur(0.8px);
    opacity: 0.58;
  }

  .dark #theme-simple header.h-80::after {
    background:
      radial-gradient(ellipse 30% 74% at 50% 42%, rgba(31, 37, 46, 0.90) 0%, rgba(31, 37, 46, 0.78) 36%, rgba(31, 37, 46, 0.42) 62%, rgba(31, 37, 46, 0.16) 100%),
      linear-gradient(90deg, rgba(21, 25, 31, 0.28), rgba(21, 25, 31, 0.10) 24%, rgba(21, 25, 31, 0.08) 76%, rgba(21, 25, 31, 0.30)),
      linear-gradient(180deg, rgba(21, 25, 31, 0.24), rgba(21, 25, 31, 0.10));
  }

  #theme-simple header.h-80 > div {
    position: relative;
    z-index: 2;
    padding: 42px 28px !important;
  }

  #theme-simple header.h-80 img {
    border: 4px solid rgba(255, 255, 255, 0.82);
    box-shadow: 0 12px 30px rgba(47, 111, 159, 0.18);
  }

  #theme-simple header.h-80 .font-serif {
    color: var(--simple-text) !important;
    font-family: "Noto Serif SC", "LXGW WenKai Screen", serif;
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  #theme-simple header.h-80 .font-light,
  #theme-simple header.h-80 .text-xs {
    color: var(--simple-muted) !important;
  }

  #theme-simple nav.w-full {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    margin: 0 auto;
    border: 1px solid var(--simple-border) !important;
    border-radius: 999px;
    background: var(--simple-card) !important;
    box-shadow: var(--simple-shadow-soft);
    backdrop-filter: blur(18px);
  }

  #theme-simple #nav-bar-inner {
    width: 100%;
    max-width: none !important;
    height: 58px !important;
    padding: 0 58px 0 22px;
  }

  #theme-simple .menu-link {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    color: var(--simple-muted);
    text-decoration: none;
    background-image: none;
    transition:
      background-color 0.18s ease,
      color 0.18s ease,
      transform 0.18s ease;
  }

  #theme-simple .menu-link:hover {
    color: var(--simple-primary-deep);
    background: var(--simple-faint);
    transform: translateY(-1px);
    cursor: pointer;
  }

  #theme-simple nav .absolute.right-12 {
    right: 18px;
    color: var(--simple-primary) !important;
  }

  #theme-simple .blog-item-title {
    color: var(--simple-primary-deep) !important;
    letter-spacing: -0.02em;
  }

  .dark #theme-simple .blog-item-title {
    color: var(--simple-primary-deep) !important;
  }

  #theme-simple #posts-wrapper > div > div {
    position: relative;
    min-height: 150px;
    height: auto !important;
    margin: 0 0 18px !important;
    padding: 24px 26px !important;
    border: 1px solid var(--simple-border) !important;
    border-radius: var(--simple-radius);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
    overflow: hidden;
    transition:
      transform 0.24s ease,
      border-color 0.24s ease,
      box-shadow 0.24s ease;
  }

  #theme-simple #posts-wrapper > div > div:hover {
    transform: translateY(-3px);
    border-color: rgba(47, 111, 159, 0.46) !important;
    box-shadow: var(--simple-shadow);
  }

  #theme-simple #posts-wrapper .article-info {
    min-width: 0;
    flex: 1;
  }

  #theme-simple #posts-wrapper h2 {
    margin-bottom: 10px !important;
  }

  #theme-simple #posts-wrapper h2 a {
    font-size: clamp(1.15rem, 1.6vw, 1.55rem) !important;
    line-height: 1.45;
  }

  #theme-simple #posts-wrapper header {
    margin-bottom: 12px !important;
    color: var(--simple-muted) !important;
    font-size: 0.86rem !important;
  }

  #theme-simple #posts-wrapper main {
    color: var(--simple-muted) !important;
    line-height: 1.8 !important;
  }

  #theme-simple #posts-wrapper a.inline-block.rounded-sm {
    height: auto !important;
    min-height: 36px;
    padding: 8px 16px !important;
    border-radius: 999px !important;
    border-color: var(--simple-border) !important;
    color: var(--simple-primary) !important;
    background: rgba(47, 111, 159, 0.06);
  }

  #theme-simple #right-sidebar {
    top: 24px !important;
    width: 300px !important;
    padding-left: 0 !important;
    border-left: 0 !important;
  }

  #theme-simple #right-sidebar > * {
    margin-bottom: 16px;
    padding: 18px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius-sm);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
  }

  #theme-simple #right-sidebar .catalog-item {
    border-left-color: var(--simple-border) !important;
    color: var(--simple-muted) !important;
    line-height: 1.8;
  }

  #theme-simple #right-sidebar .catalog-item:hover,
  #theme-simple #right-sidebar .catalog-item span.font-bold {
    color: var(--simple-primary-deep) !important;
  }

  #theme-simple section.mt-2 {
    max-width: var(--simple-article-width);
    margin: 0 auto 18px !important;
    padding: 26px 30px 22px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
  }

  #theme-simple section.mt-2 h2 {
    font-size: clamp(1.65rem, 3vw, 2.45rem) !important;
    line-height: 1.35;
    color: var(--simple-text) !important;
  }

  #theme-simple section.mt-2,
  #theme-simple section.mt-2 .text-gray-700,
  #theme-simple section.mt-2 .dark\\:text-gray-300 {
    color: var(--simple-muted) !important;
  }

  #theme-simple #article-wrapper {
    max-width: var(--simple-article-width);
    margin: 0 auto;
    padding: 28px 30px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius);
    background: var(--simple-card-solid);
    box-shadow: var(--simple-shadow);
  }

  #theme-simple .notion {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    color: var(--simple-text);
  }

  #theme-simple .notion-page-content {
    padding: 0 !important;
    max-width: 100% !important;
  }

  #theme-simple .notion-text,
  #theme-simple .notion-list,
  #theme-simple .notion-callout,
  #theme-simple .notion-quote {
    line-height: 1.9;
    font-size: 1rem;
  }

  #theme-simple .notion-h1,
  #theme-simple .notion-h2,
  #theme-simple .notion-h3 {
    color: var(--simple-text);
    letter-spacing: -0.02em;
  }

  #theme-simple .notion-h1 {
    font-size: clamp(1.8rem, 3vw, 2.35rem);
  }

  #theme-simple .notion-h2 {
    margin-top: 2rem;
    padding-bottom: 0.45rem;
    border-bottom: 1px solid var(--simple-border);
    font-size: clamp(1.35rem, 2.2vw, 1.75rem);
  }

  #theme-simple .notion-h3 {
    font-size: 1.18rem;
    color: var(--simple-primary-deep);
  }

  #theme-simple .notion-callout {
    border: 1px solid var(--simple-border);
    border-radius: 14px;
    background: rgba(47, 111, 159, 0.06);
  }

  #theme-simple .notion-quote {
    border-left: 4px solid var(--simple-accent);
    color: var(--simple-muted);
    background: rgba(241, 170, 82, 0.08);
    border-radius: 0 12px 12px 0;
    padding: 0.75rem 1rem;
  }

  #theme-simple .notion-table,
  #theme-simple .notion-simple-table {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--simple-border);
  }

  #theme-simple .notion-table th,
  #theme-simple .notion-simple-table th,
  #theme-simple .notion-table td,
  #theme-simple .notion-simple-table td {
    border-color: var(--simple-border) !important;
  }

  #theme-simple .notion-table th,
  #theme-simple .notion-simple-table th {
    background: var(--simple-faint);
    color: var(--simple-text);
  }

  #theme-simple .notion-code {
    border: 1px solid var(--simple-border);
    border-radius: 14px;
    background: #17212b !important;
    box-shadow: var(--simple-shadow-soft);
  }

  #theme-simple .notion-link,
  #theme-simple .notion-page-link {
    color: var(--simple-primary);
    text-decoration-color: rgba(47, 111, 159, 0.35);
    text-underline-offset: 3px;
  }

  #theme-simple .notion-page-link:hover {
    color: var(--simple-primary-deep);
  }

  #theme-simple footer.bg-black {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    margin: 0 auto 28px;
    border: 1px solid var(--simple-border) !important;
    border-radius: var(--simple-radius);
    background: var(--simple-card) !important;
    box-shadow: var(--simple-shadow-soft);
  }

  #theme-simple footer .text-yellow-300 {
    color: var(--simple-muted) !important;
  }

  #theme-simple footer a {
    color: var(--simple-primary) !important;
  }

  @media (max-width: 1024px) {
    #theme-simple #container-wrapper {
      width: min(100vw - 28px, var(--simple-page-width)) !important;
      padding-top: 18px !important;
    }

    #theme-simple header.h-80,
    #theme-simple nav.w-full,
    #theme-simple footer.bg-black {
      width: min(100vw - 28px, var(--simple-page-width));
    }

    #theme-simple #article-wrapper,
    #theme-simple section.mt-2 {
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    body {
      background: var(--simple-bg);
    }

    #theme-simple header.h-80 {
      margin-top: 14px;
      border-radius: 20px;
      min-height: 0;
    }

    #theme-simple header.h-80::before {
      background-position: center center;
      opacity: 0.46;
    }

    #theme-simple header.h-80::after {
      background:
        radial-gradient(ellipse 72% 76% at 50% 42%, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.80) 55%, rgba(255, 255, 255, 0.34) 100%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.30), rgba(255, 255, 255, 0.16));
    }

    .dark #theme-simple header.h-80::after {
      background:
        radial-gradient(ellipse 72% 76% at 50% 42%, rgba(31, 37, 46, 0.92) 0%, rgba(31, 37, 46, 0.76) 55%, rgba(31, 37, 46, 0.38) 100%),
        linear-gradient(180deg, rgba(21, 25, 31, 0.36), rgba(21, 25, 31, 0.20));
    }

    #theme-simple header.h-80 > div {
      padding: 28px 16px !important;
    }

    #theme-simple header.h-80 .flex.space-x-6 {
      gap: 14px;
    }

    #theme-simple header.h-80 img {
      width: 76px !important;
      height: 76px !important;
    }

    #theme-simple nav.w-full {
      border-radius: 16px;
      overflow: hidden;
    }

    #theme-simple #nav-bar-inner {
      height: auto !important;
      min-height: 56px;
      padding: 8px 48px 8px 12px;
    }

    #theme-simple #posts-wrapper > div > div,
    #theme-simple section.mt-2,
    #theme-simple #article-wrapper {
      border-radius: 16px;
      padding: 20px 16px !important;
    }

    #theme-simple #posts-wrapper > div > div > .flex {
      display: block;
    }
  }
  `}</style>
}

export { Style }
