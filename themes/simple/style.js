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
    --simple-glow: rgba(47, 111, 159, 0.34);
    --simple-shine: rgba(47, 111, 159, 0.22);
    --simple-hover-surface: rgba(47, 111, 159, 0.045);
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
    --simple-text: #f2f8ff;
    --simple-muted: #c3d0df;
    --simple-faint: #2a323d;
    --simple-border: rgba(207, 222, 238, 0.14);
    --simple-primary: #9cdbff;
    --simple-primary-deep: #d4efff;
    --simple-accent: #f2bd72;
    --simple-glow: rgba(156, 219, 255, 0.22);
    --simple-shine: rgba(255, 255, 255, 0.34);
    --simple-hover-surface: rgba(156, 219, 255, 0.04);
    --simple-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
    --simple-shadow-soft: 0 10px 24px rgba(0, 0, 0, 0.24);
  }

  @keyframes simple-fade-up {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes simple-shine {
    from {
      transform: translateX(-135%) skewX(-18deg);
    }
    to {
      transform: translateX(135%) skewX(-18deg);
    }
  }

  @keyframes simple-brand-vanish {
    0%,
    58% {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      filter: blur(3px);
      transform: translateY(-8px) scale(0.98);
    }
  }

  @keyframes simple-hero-scrim-vanish {
    0%,
    58% {
      opacity: 1;
    }
    100% {
      opacity: 0.08;
    }
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

  #theme-simple ::selection {
    color: #ffffff;
    background: rgba(47, 111, 159, 0.34);
    text-shadow: none;
  }

  .dark #theme-simple ::selection {
    color: #10141a;
    background: #d4efff;
    text-shadow: none;
  }

  #theme-simple {
    position: relative;
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

  #theme-simple::after {
    content: "";
    position: fixed;
    inset: 7% -14% auto;
    z-index: -1;
    height: 360px;
    pointer-events: none;
    background:
      radial-gradient(circle at 28% 44%, rgba(91, 163, 211, 0.20), transparent 34%),
      radial-gradient(circle at 68% 26%, rgba(241, 170, 82, 0.18), transparent 32%),
      radial-gradient(circle at 50% 72%, rgba(103, 198, 182, 0.12), transparent 30%);
    /* Keep the softened glow static instead of filtering a moving layer. */
    filter: blur(38px);
    opacity: 0.72;
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
    animation: simple-fade-up 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  #theme-simple header.h-80::before {
    content: "";
    position: absolute;
    inset: -10px;
    z-index: 0;
    background-image: url("/images/simple-hero-bg.webp");
    background-size: cover;
    background-position: 58% 45%;
    filter: saturate(0.94) contrast(0.98) brightness(1.02) blur(0.35px);
    opacity: 0.82;
    transform: scale(1.018);
  }

  #theme-simple header.h-80::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(ellipse 20% 60% at 50% 42%, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.28) 42%, rgba(255, 255, 255, 0.08) 68%, transparent 100%),
      linear-gradient(90deg, rgba(248, 252, 255, 0.08), transparent 28%, transparent 72%, rgba(248, 252, 255, 0.08)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 72%);
    opacity: 1;
    animation: simple-hero-scrim-vanish 7.2s ease forwards;
    transition: opacity 0.38s ease;
  }

  .dark #theme-simple header.h-80 {
    background: #1f252e !important;
  }

  .dark #theme-simple header.h-80::before {
    filter: saturate(0.86) contrast(0.94) brightness(0.72) blur(0.45px);
    opacity: 0.66;
  }

  .dark #theme-simple header.h-80::after {
    background:
      radial-gradient(ellipse 22% 62% at 50% 42%, rgba(21, 25, 31, 0.62) 0%, rgba(21, 25, 31, 0.34) 42%, rgba(21, 25, 31, 0.12) 68%, transparent 100%),
      linear-gradient(90deg, rgba(21, 25, 31, 0.14), transparent 28%, transparent 72%, rgba(21, 25, 31, 0.14)),
      linear-gradient(180deg, rgba(21, 25, 31, 0.12), transparent 72%);
  }

  #theme-simple header.h-80 > div {
    position: relative;
    z-index: 2;
    padding: 42px 28px !important;
    opacity: 1;
    transform-origin: center;
    animation: simple-brand-vanish 7.2s ease forwards;
    transition:
      opacity 0.38s ease,
      filter 0.38s ease,
      transform 0.38s ease;
  }

  #theme-simple header.h-80:hover::after,
  #theme-simple header.h-80:focus-within::after {
    opacity: 1;
    animation: none;
  }

  #theme-simple header.h-80:hover > div,
  #theme-simple header.h-80:focus-within > div {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0) scale(1);
    animation: none;
  }

  #theme-simple header.h-80 img {
    border: 3px solid rgba(255, 255, 255, 0.70);
    box-shadow:
      0 12px 30px rgba(47, 111, 159, 0.16),
      0 0 0 1px rgba(36, 50, 65, 0.08);
  }

  #theme-simple header.h-80 .font-serif {
    color: var(--simple-text) !important;
    font-family: "Noto Serif SC", "LXGW WenKai Screen", serif;
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.62),
      0 8px 22px rgba(255, 255, 255, 0.44),
      0 2px 12px rgba(47, 111, 159, 0.20);
  }

  #theme-simple header.h-80 .font-light,
  #theme-simple header.h-80 .text-xs {
    color: var(--simple-muted) !important;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.58),
      0 2px 10px rgba(255, 255, 255, 0.36);
  }

  #theme-simple header.h-80.simple-home-header {
    min-height: 180px;
    margin: 20px auto 14px;
  }

  #theme-simple header.h-80.simple-home-header > div {
    padding: 14px 20px !important;
  }

  #theme-simple header.h-80.simple-home-header .font-serif {
    padding: 0 0 4px;
    font-size: clamp(1.7rem, 3vw, 2.6rem);
    line-height: 1.15;
  }

  #theme-simple header.h-80.simple-home-header .font-light {
    padding: 0;
    font-size: 0.82rem;
    line-height: 1.25;
  }

  #theme-simple .simple-home-header > div > .text-xs {
    margin-top: 4px;
  }

  #theme-simple header.h-80.simple-home-header img {
    width: 72px !important;
    height: 72px !important;
  }

  #theme-simple nav.w-full {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    margin: 0 auto;
    border: 1px solid var(--simple-border) !important;
    border-radius: 999px;
    background: var(--simple-card) !important;
    box-shadow: var(--simple-shadow-soft);
    backdrop-filter: none;
    animation: simple-fade-up 0.72s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }

  #theme-simple nav.w-full:hover {
    border-color: rgba(47, 111, 159, 0.50) !important;
    box-shadow:
      0 16px 36px var(--simple-glow),
      0 0 0 1px rgba(47, 111, 159, 0.12);
  }

  #theme-simple #nav-bar-inner {
    width: 100%;
    max-width: none !important;
    height: 58px !important;
    padding: 0 58px 0 22px;
  }

  #theme-simple nav.w-full.simple-nav-with-categories {
    border-radius: var(--simple-radius);
  }

  #theme-simple .simple-category-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
    padding: 6px 18px;
    border-top: 1px solid var(--simple-border);
    list-style: none;
  }

  #theme-simple .simple-category-nav a {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 36px;
    padding: 4px 14px;
    border-radius: var(--simple-radius-sm);
    color: var(--simple-text);
    font-size: 0.88rem;
    text-align: center;
    overflow-wrap: anywhere;
  }

  #theme-simple .simple-category-nav a:hover,
  #theme-simple .simple-category-nav a[aria-current] {
    background: var(--simple-faint);
    color: var(--simple-primary-deep);
  }

  #theme-simple .simple-category-nav a[aria-current] {
    box-shadow: inset 0 0 0 1px var(--simple-border);
    font-weight: 700;
  }

  #theme-simple #simple-search {
    color: var(--simple-text);
    caret-color: var(--simple-primary-deep);
    background-color: var(--simple-card-solid);
    transition:
      color 0.18s ease,
      background-color 0.18s ease;
  }

  #theme-simple #simple-search::placeholder {
    color: var(--simple-muted);
    opacity: 0.72;
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

  #theme-simple .simple-home {
    display: grid;
    gap: 14px;
    min-width: 0;
  }

  #theme-simple .simple-home-panel {
    min-width: 0;
    padding: 14px 18px 5px;
    border: 1px solid var(--simple-border);
    border-radius: 14px;
    background: var(--simple-card);
  }

  #theme-simple .simple-home-pinned {
    border-left: 3px solid var(--simple-accent);
  }

  #theme-simple .simple-home-panel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--simple-border);
  }

  #theme-simple .simple-home-panel h2 {
    color: var(--simple-text);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  #theme-simple .simple-home-pinned h2 {
    justify-content: flex-start;
  }

  #theme-simple .simple-home-category-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  #theme-simple .simple-home-category-icon {
    display: inline-grid;
    flex: none;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    color: color-mix(in srgb, var(--category-accent) 55%, var(--simple-text));
    background: color-mix(in srgb, var(--category-accent) 18%, var(--simple-card-solid));
  }

  #theme-simple .simple-home-more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    color: var(--simple-primary-deep);
    font-size: 0.8rem;
    white-space: nowrap;
  }

  #theme-simple .simple-home-posts {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  #theme-simple .simple-home-posts li + li {
    border-top: 1px solid var(--simple-border);
  }

  #theme-simple .simple-home-posts a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    min-height: var(--simple-home-link-height, 44px);
    padding: 10px 0;
    color: var(--simple-text);
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.55;
  }

  #theme-simple .simple-home-posts a span {
    min-width: 0;
    overflow-wrap: anywhere;
    text-wrap: pretty;
  }

  #theme-simple .simple-home-posts time {
    flex-shrink: 0;
    color: var(--simple-muted);
    font-size: 0.77rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  #theme-simple .simple-home-posts a:hover span,
  #theme-simple .simple-home-more:hover {
    color: var(--simple-primary-deep);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  #theme-simple .simple-home a:focus-visible,
  #theme-simple .simple-category-nav a:focus-visible {
    outline: 2px solid var(--simple-primary);
    outline-offset: 2px;
  }

  #theme-simple .simple-home-panel.simple-home-latest {
    padding: clamp(12px, 1.6vw, 22px) 2px 0;
    border: 0;
    background: transparent;
    scroll-margin-top: 5rem;
  }

  #theme-simple .simple-home-latest h2 {
    margin: 0 0 12px;
    font-size: clamp(1.25rem, 2vw, 1.5rem);
  }

  #theme-simple .journal-updates { margin: 0; border-bottom: 1px solid var(--simple-border); }
  #theme-simple .journal-update-day {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    align-items: baseline;
    column-gap: clamp(12px, 2vw, 30px);
    padding: 4px 0;
    border-top: 1px solid var(--simple-border);
  }
  #theme-simple .journal-update-day dt {
    color: var(--simple-primary-deep);
    font-size: .95rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  #theme-simple .journal-update-day time span { color: var(--simple-muted); font-size: .8rem; font-weight: 450; }
  #theme-simple .journal-update-day dd { min-width: 0; margin: 0; }
  #theme-simple .journal-update-articles {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    column-gap: clamp(18px, 3vw, 44px);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  #theme-simple .journal-update-articles a {
    display: flex;
    align-items: baseline;
    gap: 9px;
    min-height: 44px;
    padding: 10px 0;
    color: var(--simple-text);
    font-size: 1rem;
    font-weight: 550;
    line-height: 1.5;
  }
  #theme-simple .journal-update-articles .journal-title-icon {
    flex: 0 0 1.35em;
    margin: 0;
    color: var(--simple-muted);
    text-align: center;
  }
  #theme-simple .journal-update-title { min-width: 0; overflow-wrap: anywhere; }
  #theme-simple .journal-update-articles a:is(:hover, :focus-visible) .journal-update-title {
    color: var(--simple-primary-deep);
    text-decoration: underline;
    text-underline-offset: .22em;
  }
  @media (min-width: 960px) {
    #theme-simple .journal-update-articles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    #theme-simple .journal-update-articles li:only-child { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    #theme-simple .journal-update-day { grid-template-columns: minmax(0, 1fr); padding: 10px 0 3px; }
    #theme-simple .journal-update-day dt { margin-bottom: 1px; }
  }

  #theme-simple .blog-item-title {
    color: var(--simple-primary-deep) !important;
    letter-spacing: -0.02em;
  }

  .dark #theme-simple .blog-item-title {
    color: var(--simple-primary-deep) !important;
    text-shadow: 0 0 14px rgba(156, 219, 255, 0.32);
  }

  .dark #theme-simple header.h-80 .font-serif,
  .dark #theme-simple section.mt-2 h2,
  .dark #theme-simple #posts-wrapper h2 a {
    text-shadow:
      0 0 16px rgba(156, 219, 255, 0.28),
      0 1px 1px rgba(0, 0, 0, 0.72);
  }

  #theme-simple #posts-wrapper > div > div {
    position: relative;
    min-height: 132px;
    height: auto !important;
    margin: 0 0 18px !important;
    padding: 24px 26px !important;
    border: 1px solid var(--simple-border) !important;
    border-radius: var(--simple-radius);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
    overflow: hidden;
    animation: simple-fade-up 0.68s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    transition:
      border-color 0.24s ease,
      box-shadow 0.24s ease;
  }

  #theme-simple #posts-wrapper > div > div:nth-child(1) {
    animation-delay: 0.08s;
  }

  #theme-simple #posts-wrapper > div > div:nth-child(2) {
    animation-delay: 0.14s;
  }

  #theme-simple #posts-wrapper > div > div:nth-child(3) {
    animation-delay: 0.20s;
  }

  #theme-simple #posts-wrapper > div > div:nth-child(4) {
    animation-delay: 0.26s;
  }

  #theme-simple #posts-wrapper > div > div::after {
    content: "";
    position: absolute;
    inset: -38% auto -38% -42%;
    width: 38%;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, var(--simple-shine), rgba(255, 255, 255, 0.46), var(--simple-shine), transparent);
    opacity: 0;
    transform: translateX(-135%) skewX(-18deg);
  }

  #theme-simple #posts-wrapper > div > div:hover::after {
    opacity: 1;
    animation: simple-shine 0.85s ease;
  }

  #theme-simple #right-sidebar > *::after,
  #theme-simple section.mt-2::after,
  #theme-simple #article-wrapper::after {
    content: none !important;
    animation: none !important;
  }

  #theme-simple #posts-wrapper > div > div:hover {
    border-color: rgba(47, 111, 159, 0.58) !important;
    background:
      linear-gradient(135deg, var(--simple-hover-surface), transparent 42%),
      var(--simple-card);
    box-shadow:
      0 20px 46px rgba(47, 111, 159, 0.18),
      0 0 0 1px rgba(47, 111, 159, 0.10);
  }

  .dark #theme-simple #posts-wrapper > div > div:hover {
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

  .dark #theme-simple #posts-wrapper header,
  .dark #theme-simple #posts-wrapper main,
  .dark #theme-simple section.mt-2,
  .dark #theme-simple .notion-text,
  .dark #theme-simple .notion-list {
    color: var(--simple-muted) !important;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45);
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
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
    padding: 18px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius-sm);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
    animation: simple-fade-up 0.68s 0.18s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }

  #theme-simple #right-sidebar > *:hover {
    border-color: rgba(47, 111, 159, 0.52);
    background:
      linear-gradient(135deg, var(--simple-hover-surface), transparent 42%),
      var(--simple-card);
    box-shadow:
      0 16px 36px var(--simple-glow),
      0 0 0 1px rgba(47, 111, 159, 0.10);
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

  .dark #theme-simple #right-sidebar .catalog-item:hover,
  .dark #theme-simple #right-sidebar .catalog-item span.font-bold {
    text-shadow: 0 0 12px rgba(156, 219, 255, 0.34);
  }

  #theme-simple section.mt-2 {
    position: relative;
    overflow: hidden;
    max-width: var(--simple-article-width);
    margin: 0 auto 18px !important;
    padding: 26px 30px 22px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius);
    background: var(--simple-card);
    box-shadow: var(--simple-shadow-soft);
    animation: simple-fade-up 0.68s 0.12s cubic-bezier(0.2, 0.8, 0.2, 1) both;
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
    position: relative;
    overflow: hidden;
    max-width: var(--simple-article-width);
    margin: 0 auto;
    padding: 28px 30px;
    border: 1px solid var(--simple-border);
    border-radius: var(--simple-radius);
    background: var(--simple-card-solid);
    box-shadow: var(--simple-shadow);
    animation: none;
    transition: none;
  }

  #theme-simple #article-wrapper:hover {
    border-color: var(--simple-border);
    box-shadow: var(--simple-shadow);
  }

  .dark #theme-simple #article-wrapper:hover {
    box-shadow: 0 22px 58px rgba(0, 0, 0, 0.42);
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

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table {
    display: table !important;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table td {
    padding: 9px 7px;
    border: 0 !important;
    background: transparent;
    color: var(--simple-text);
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.6;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table tr + tr td {
    border-top: 1px solid var(--simple-border) !important;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table-header-row td {
    background: var(--simple-faint);
    font-weight: 650;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table-header-row td:first-child {
    border-start-start-radius: 8px;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table-header-row td:last-child {
    border-start-end-radius: 8px;
  }

  /* The server and date columns leave the remaining width for update details. */
  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table td:first-child:nth-last-child(3) {
    width: 25% !important;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table td:nth-child(2):nth-last-child(2) {
    width: 21% !important;
    padding-inline: 4px;
    font-variant-numeric: tabular-nums;
  }

  #theme-simple[data-grouped-home] #announcement-content .notion-simple-table td:last-child:nth-child(3) {
    width: auto !important;
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

  #theme-simple #article-wrapper :is(.notion-gray, .notion-gray_co) {
    color: #6b7280 !important;
  }

  #theme-simple #article-wrapper :is(.notion-brown, .notion-brown_co) {
    color: #8b5e34 !important;
  }

  #theme-simple #article-wrapper :is(.notion-orange, .notion-orange_co) {
    color: #c2410c !important;
  }

  #theme-simple #article-wrapper :is(.notion-yellow, .notion-yellow_co) {
    color: #a16207 !important;
  }

  #theme-simple #article-wrapper :is(.notion-green, .notion-green_co, .notion-teal, .notion-teal_co) {
    color: #22a66a !important;
    font-weight: 700;
    text-shadow: 0 0 1px rgba(34, 166, 106, 0.16);
  }

  #theme-simple #article-wrapper :is(.notion-blue, .notion-blue_co) {
    color: #0b6e99 !important;
    font-weight: 700;
  }

  #theme-simple #article-wrapper :is(.notion-purple, .notion-purple_co) {
    color: #6d28d9 !important;
  }

  #theme-simple #article-wrapper :is(.notion-pink, .notion-pink_co) {
    color: #be185d !important;
  }

  #theme-simple #article-wrapper :is(.notion-red, .notion-red_co) {
    color: #dc2626 !important;
  }

  #theme-simple #article-wrapper .notion-link:has(.notion-page-title) {
    border-bottom: 0 !important;
    text-decoration: none;
    opacity: 1;
  }

  #theme-simple #article-wrapper .notion-link .notion-page-title {
    display: inline-flex;
    align-items: baseline;
    gap: 0.04em;
    line-height: inherit;
    vertical-align: baseline;
  }

  #theme-simple #article-wrapper .notion-link .notion-page-title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.95em;
    height: 0.95em;
    min-width: 0.95em;
    margin: 0;
    border-radius: 3px;
    vertical-align: -0.12em;
  }

  #theme-simple #article-wrapper .notion-link .notion-page-title-icon img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  #theme-simple #article-wrapper .notion-link .notion-page-title-text {
    position: static;
    top: auto;
    display: inline;
    border-bottom: 0 !important;
    line-height: inherit;
    font-weight: inherit;
    text-decoration: none;
  }

  .dark #theme-simple .notion-link,
  .dark #theme-simple .notion-page-link,
  .dark #theme-simple a {
    text-shadow: 0 0 10px rgba(156, 219, 255, 0.20);
  }

  .dark #theme-simple #article-wrapper :is(.notion-gray, .notion-gray_co) {
    color: #d5deea !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-brown, .notion-brown_co) {
    color: #d8b58a !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-orange, .notion-orange_co) {
    color: #ffbf80 !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-yellow, .notion-yellow_co) {
    color: #f6d77a !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-green, .notion-green_co, .notion-teal, .notion-teal_co) {
    color: #9cffb2 !important;
    font-weight: 700;
  }

  .dark #theme-simple #article-wrapper :is(.notion-blue, .notion-blue_co) {
    color: #8bd9ff !important;
    font-weight: 700;
  }

  .dark #theme-simple #article-wrapper :is(.notion-purple, .notion-purple_co) {
    color: #d9b8ff !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-pink, .notion-pink_co) {
    color: #ffadd7 !important;
  }

  .dark #theme-simple #article-wrapper :is(.notion-red, .notion-red_co) {
    color: #ff8585 !important;
  }

  .dark #theme-simple #article-wrapper :is(
    .notion-gray,
    .notion-gray_co,
    .notion-brown,
    .notion-brown_co,
    .notion-orange,
    .notion-orange_co,
    .notion-yellow,
    .notion-yellow_co,
    .notion-green,
    .notion-green_co,
    .notion-teal,
    .notion-teal_co,
    .notion-blue,
    .notion-blue_co,
    .notion-purple,
    .notion-purple_co,
    .notion-pink,
    .notion-pink_co,
    .notion-red,
    .notion-red_co
  ) {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.08),
      0 1px 1px rgba(0, 0, 0, 0.52);
  }

  .dark #theme-simple #article-wrapper :is(.notion-green, .notion-green_co, .notion-teal, .notion-teal_co) {
    text-shadow:
      0 0 12px rgba(156, 255, 178, 0.52),
      0 0 2px rgba(156, 255, 178, 0.68),
      0 1px 1px rgba(0, 0, 0, 0.56);
  }

  .dark #theme-simple #article-wrapper :is(
    .notion-green,
    .notion-green_co,
    .notion-teal,
    .notion-teal_co,
    .notion-blue,
    .notion-blue_co,
    .notion-purple,
    .notion-purple_co,
    .notion-red,
    .notion-red_co
  )::selection {
    color: #10141a;
    background: #f2f8ff;
    text-shadow: none;
  }

  #theme-simple .notion-page-link:hover {
    color: var(--simple-primary-deep);
  }

  #theme-simple .notion-link,
  #theme-simple .notion-page-link,
  #theme-simple #right-sidebar .catalog-item {
    transition:
      color 0.18s ease,
      text-shadow 0.18s ease,
      transform 0.18s ease;
  }

  #theme-simple footer.bg-black {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    margin: 0 auto 28px;
    border: 1px solid var(--simple-border) !important;
    border-radius: var(--simple-radius);
    background: var(--simple-card) !important;
    box-shadow: var(--simple-shadow-soft);
    animation: simple-fade-up 0.68s 0.24s cubic-bezier(0.2, 0.8, 0.2, 1) both;
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

    #theme-simple header.h-80.simple-home-header {
      min-height: 0;
      margin-top: 14px;
    }

    #theme-simple .simple-category-nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
      padding: 4px 10px;
    }

    #theme-simple .simple-category-nav a {
      min-height: 44px;
      padding: 4px 6px;
    }

    #theme-simple .simple-home-panel {
      padding-inline: 14px;
    }

    #theme-simple header.h-80::before {
      background-position: center center;
      opacity: 0.46;
    }

    #theme-simple header.h-80::after {
      background:
        radial-gradient(ellipse 58% 68% at 50% 42%, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.34) 58%, rgba(255, 255, 255, 0.10) 100%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 72%);
    }

    .dark #theme-simple header.h-80::after {
      background:
        radial-gradient(ellipse 58% 68% at 50% 42%, rgba(21, 25, 31, 0.66) 0%, rgba(21, 25, 31, 0.42) 58%, rgba(21, 25, 31, 0.18) 100%),
        linear-gradient(180deg, rgba(21, 25, 31, 0.20), transparent 72%);
    }

    #theme-simple header.h-80 > div {
      padding: 28px 16px !important;
    }

    #theme-simple header.h-80::after,
    #theme-simple header.h-80 > div {
      animation: none;
      opacity: 1;
      filter: none;
      transform: none;
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
      overflow: visible;
    }

    #theme-simple #nav-bar-inner {
      height: auto !important;
      min-height: 56px;
      padding: 8px 48px 8px 12px;
      overflow: visible;
    }

    #theme-simple #nav-menu-mobile {
      position: relative;
      width: 100%;
      z-index: 30;
    }

    #theme-simple #nav-menu-mobile > div:first-child {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0 12px;
      border-radius: 999px;
      color: var(--simple-text);
    }

    #theme-simple #nav-menu-mobile > .absolute {
      left: -28px !important;
      top: 48px;
      z-index: 60;
      width: calc(100vw - 28px) !important;
      border-radius: 16px;
      box-shadow: var(--simple-shadow);
    }

    #theme-simple #menu-wrap {
      overflow: hidden;
      border-color: var(--simple-border) !important;
      border-radius: 16px;
      background: var(--simple-card-solid) !important;
    }

    .dark #theme-simple #menu-wrap {
      background: var(--simple-card-solid) !important;
    }

    #theme-simple #posts-wrapper > div > div,
    #theme-simple section.mt-2,
    #theme-simple #article-wrapper {
      border-radius: 16px;
      padding: 20px 16px !important;
    }

    #theme-simple #posts-wrapper > div > div {
      min-height: 0;
    }

    #theme-simple #posts-wrapper > div > div > .flex {
      display: block;
    }
  }

  #theme-simple .simple-category-nav sup, #theme-simple .journal-topics sup {
    margin-inline-start: .35em;
    font-size: .68em;
    font-variant-numeric: tabular-nums;
    color: var(--simple-muted);
  }
  #theme-simple[data-grouped-home] nav.w-full, #theme-simple[data-reading-post] nav.w-full,
  #theme-simple header.h-80.simple-home-header { animation: simple-fade-up .25s ease-out both; }
  #theme-simple header.h-80.simple-home-header > div,
  #theme-simple header.h-80.simple-home-header::after { animation: none; }
  #theme-simple header.h-80.simple-home-header {
    display: grid;
    place-items: center;
    min-height: clamp(310px, 30vw, 390px);
    padding: 0;
  }
  #theme-simple .journal-hero-stage {
    width: 100%;
    display: grid;
    place-items: center;
  }
  #theme-simple .journal-hero-stage > * { grid-area: 1 / 1; min-width: 0; }
  #theme-simple .journal-hero-profile {
    text-align: center;
    opacity: 1;
    transition: opacity .28s ease .22s, transform .4s ease .2s, visibility 0s .2s;
  }
  #theme-simple [data-view=note] .journal-hero-profile {
    visibility: hidden; opacity: 0; transform: translateY(-6px);
    transition-delay: 0s, 0s, .28s;
  }
  #theme-simple .journal-thought {
    --bubble-base: #fff7ee; --bubble-glow: #fffdf7; --bubble-edge: #d5bbb2;
    --bubble-ink: #402e39; --bubble-detail: #72535a; --bubble-accent: #86465d;
    position: relative; isolation: isolate; box-sizing: border-box;
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(38rem, 100%); height: 13.5rem;
    padding: 22px clamp(22px, 3vw, 36px) 18px; text-align: left; color: var(--bubble-ink);
    border: 1px solid var(--bubble-edge); border-radius: 32px 34px 30px 18px / 28px 33px 27px 26px;
    background: radial-gradient(ellipse at 10% 0%, var(--bubble-glow), transparent 75%), var(--bubble-base);
    box-shadow: 0 10px 28px #37232c30, inset 0 1px 0 #ffffff60;
    opacity: 0; visibility: hidden; pointer-events: none;
    transform: translateY(10px) scale(.90); transform-origin: 21% 95%;
    transition: opacity .2s ease, transform .24s ease, visibility 0s .24s;
  }
  .dark #theme-simple .journal-thought {
    --bubble-base: #363442; --bubble-glow: #49404b; --bubble-edge: #766574;
    --bubble-ink: #fff5ee; --bubble-detail: #dec9d0; --bubble-accent: #ffc6c5;
  }
  #theme-simple [data-view=note] .journal-thought {
    opacity: 1; visibility: visible; pointer-events: auto; transform: none;
    transition: opacity .27s ease .29s, transform .52s cubic-bezier(.22,1.52,.4,1) .29s, visibility 0s .29s;
  }
  #theme-simple .journal-thought::before, #theme-simple .journal-thought::after {
    content: ''; position: absolute; background: var(--bubble-base); border: 1px solid var(--bubble-edge); border-radius: 50%;
    box-shadow: 0 3px 6px #221d2b20;
  }
  #theme-simple .journal-thought::before { bottom: -13px; left: 20px; width: 15px; height: 12px; transform: rotate(-24deg); }
  #theme-simple .journal-thought::after { bottom: -22px; left: 12px; width: 7px; height: 6px; }
  #theme-simple .journal-thought-seal {
    position: absolute; right: 15px; top: -16px; display: grid; place-items: center;
    width: 36px; height: 34px; border-radius: 52% 49% 46% 46%; background: var(--bubble-base); border: 1px solid var(--bubble-edge);
    transform: rotate(9deg); color: var(--bubble-accent); font-size: 15px;
  }
  #theme-simple .journal-thought-seal::before, #theme-simple .journal-thought-seal::after {
    content: ''; position: absolute; top: -3px; width: 8px; height: 8px; background: var(--bubble-base);
    border-left: 1px solid var(--bubble-edge); border-top: 1px solid var(--bubble-edge); border-radius: 3px 0 0;
  }
  #theme-simple .journal-thought-seal::before { left: 3px; transform: rotate(12deg); }
  #theme-simple .journal-thought-seal::after { right: 3px; transform: rotate(77deg); }
  #theme-simple .journal-thought-label { justify-self: start; color: var(--bubble-accent); font-size: .79rem; font-weight: 650; }
  #theme-simple .journal-thought-label span { margin-left: 3px; }
  #theme-simple .journal-thought-text {
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; overflow-wrap: anywhere;
    align-self: center; min-height: 0; margin: 0; color: var(--bubble-ink);
    font-size: clamp(1.13rem, 1.7vw, 1.44rem); line-height: 1.5; font-weight: 550;
  }
  #theme-simple .journal-thought footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; color: var(--bubble-detail); font-size: .77rem; }
  #theme-simple .journal-thought footer a { padding: 4px 0 4px 7px; color: var(--bubble-accent); }
  #theme-simple .journal-hero-switch {
    position: absolute; bottom: 14px; right: 16px; z-index: 3; display: grid; place-items: center; width: 40px; height: 40px;
    border-radius: 50%; color: var(--simple-text); border: 1px solid var(--journal-rim); background: var(--journal-glass-panel);
  }
  #theme-simple .journal-hero-switch:hover, #theme-simple .journal-hero-switch:focus-visible { color: var(--simple-primary-deep); background: var(--simple-card); }
  @media (max-width: 640px) {
    #theme-simple header.h-80.simple-home-header { min-height: clamp(252px, 67vw, 308px); }
    #theme-simple header.h-80.simple-home-header > .journal-hero-stage { padding: 30px 18px 40px !important; }
    #theme-simple .journal-thought { height: 11rem; padding: 16px 20px 12px; }
    #theme-simple .journal-hero-switch { bottom: 6px; right: 8px; width: 36px; height: 36px; }
  }
  #theme-simple[data-lite] .journal-hero-stage > * { transition: none; }
  @media (prefers-reduced-motion: reduce) { #theme-simple .journal-hero-stage > * { transition: none; } }
  #theme-simple .journal-toc {
    background: var(--simple-card);
    border: 1px solid var(--simple-border);
    border-radius: 14px;
    min-width: 0;
  }
  #theme-simple .journal-toc summary {
    padding: 12px 18px;
    cursor: pointer;
    font-weight: 650;
    color: var(--simple-text);
  }
  #theme-simple .journal-toc summary span { color: var(--simple-muted); font-size: .82rem; font-weight: 450; }
  #theme-simple .journal-notice {
    --notice-ink: #825019;
    --notice-gutter: clamp(14px, 2.3vw, 28px);
    min-width: 0; color: var(--simple-text); background: var(--simple-card-solid);
    background-image: linear-gradient(108deg, color-mix(in srgb, var(--simple-accent) 10%, transparent), transparent 58%);
    border: 1px solid var(--simple-border); border-radius: 18px;
  }
  .dark #theme-simple .journal-notice { --notice-ink: #f2c888; }
  #theme-simple .journal-notice > summary {
    display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: clamp(12px, 1.5vw, 20px);
    padding: 15px var(--notice-gutter); min-height: 72px;
    border-radius: inherit; cursor: pointer; list-style: none;
  }
  #theme-simple .journal-notice > summary::-webkit-details-marker { display: none; }
  #theme-simple .journal-notice-pin, #theme-simple .journal-notice-chevron { display: grid; place-items: center; }
  #theme-simple .journal-notice-pin {
    width: 44px; height: 44px; border-radius: 12px;
    color: var(--notice-ink); background: color-mix(in srgb, var(--simple-accent) 18%, var(--simple-card-solid));
    border: 1px solid color-mix(in srgb, var(--simple-accent) 35%, var(--simple-border));
  }
  #theme-simple .journal-notice-copy { display: grid; gap: 3px; min-width: 0; }
  #theme-simple .journal-notice-label { color: var(--notice-ink); font-size: .82rem; font-weight: 650; }
  #theme-simple .journal-notice-headline {
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; overflow-wrap: anywhere;
    font-size: clamp(1rem, 1.4vw, 1.12rem); line-height: 1.55; font-weight: 550;
  }
  #theme-simple .journal-notice-headline:empty, #theme-simple .journal-notice-close,
  #theme-simple .journal-notice[open] :is(.journal-notice-label,.journal-notice-headline) { display: none; }
  #theme-simple .journal-notice[open] .journal-notice-close { display: inline; font-weight: 600; }
  #theme-simple .journal-notice-chevron {
    width: 34px; height: 34px; color: var(--simple-muted);
    background: var(--simple-card); border: 1px solid var(--simple-border); border-radius: 50%;
  }
  #theme-simple .journal-notice > summary:is(:hover,:focus-visible) .journal-notice-chevron {
    color: var(--notice-ink); border-color: currentColor;
  }
  #theme-simple .journal-notice[open] .journal-notice-chevron svg { transform: rotate(180deg); }
  #theme-simple .journal-notice #announcement-content {
    margin-inline: var(--notice-gutter); padding: 16px 0 22px; border-top: 1px solid var(--simple-border);
  }
  #theme-simple .journal-notice #announcement-content .notion-page { width: 100%; max-width: 54rem; margin-inline: auto; }
  #theme-simple .journal-notice .notion-simple-table { display: block; max-width: 100%; overflow-x: auto; }
  #theme-simple .journal-rails { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(24px,4vw,48px); margin-top: 12px; }
  #theme-simple .journal-rail, #theme-simple .journal-track > li { min-width: 0; }
  #theme-simple .journal-row-heading, #theme-simple .journal-rail-tools, #theme-simple .journal-arrows { display: flex; align-items: center; gap: 10px; }
  #theme-simple .journal-row-heading { justify-content: space-between; gap: 16px; margin-bottom: 10px; }
  #theme-simple .journal-row-heading h2 { font-size: clamp(1.25rem,2.2vw,1.75rem); font-weight: 750; color: var(--simple-text); }
  #theme-simple .journal-arrows { gap: 4px; }
  #theme-simple .journal-arrows button {
    display: grid; place-items: center; width: 36px; height: 36px;
    border: 1px solid var(--simple-border); border-radius: 50%;
    background: var(--simple-card); color: var(--simple-text); font: 1.55rem/1 system-ui;
  }
  #theme-simple .journal-arrows button[aria-disabled=true] { opacity: .46; cursor: default; }
  #theme-simple .journal-track {
    display: grid; grid-auto-flow: column; grid-auto-columns: 30%; gap: clamp(12px,1.6vw,24px);
    overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; scroll-padding-inline: 3px;
    list-style: none; margin: 0; padding: 4px 3px 10px;
    scrollbar-width: thin; scrollbar-color: var(--simple-border) transparent;
  }
  #theme-simple .journal-track > li { scroll-snap-align: start; }
  #theme-simple .journal-card { display: block; color: var(--simple-text); border-radius: 15px; text-decoration: none; }
  #theme-simple .journal-art {
    display: grid; position: relative; isolation: isolate; place-items: center; aspect-ratio: 16/9;
    overflow: hidden; padding: 16px; border-radius: 15px; background: #293642;
    border: 1px solid var(--simple-border);
  }
  #theme-simple .journal-art::before, #theme-simple .journal-art > .journal-cover {
    content: ""; position: absolute; z-index: -2; inset: -3px; width: calc(100% + 6px); height: calc(100% + 6px);
    max-width: none; object-fit: cover; filter: blur(2.5px);
  }
  #theme-simple .journal-art:not(:has(> .journal-cover:not([hidden])))::before {
    background: url('/images/erinn-cover.webp') 50% 42% / cover no-repeat;
  }
  #theme-simple :is(.journal-track,.journal-topic-grid) > li:nth-child(even) .journal-art:not(:has(> .journal-cover:not([hidden])))::before {
    background-image: url('/images/simple-hero-bg.webp'); background-position: 65% 46%;
  }
  #theme-simple .journal-art::after {
    position: absolute; content: ""; inset: 0; z-index: -1;
    background: linear-gradient(108deg, rgba(12,20,34,.66), rgba(18,27,40,.57));
    transition: opacity .18s ease;
  }
  #theme-simple .journal-art:not(:has(> .journal-cover:not([hidden])))::after {
    background: linear-gradient(110deg, color-mix(in srgb,var(--category-accent) 26%,#101c2c) -32%,rgba(15,25,42,.60));
  }
  .dark #theme-simple .journal-art { border-color: rgba(170,198,218,.18); }
  #theme-simple .journal-art > .journal-cover[hidden], #theme-simple .journal-art:has(> .journal-cover:not([hidden])) .journal-watermark { display: none; }
  #theme-simple .journal-watermark { position: absolute; bottom: 12px; right: 12px; width: 22px; height: 22px; color: rgba(255,255,255,.52); }
  #theme-simple .journal-card-title { max-width: 95%; color: #fff; font-size: clamp(1.05rem,1.65vw,1.48rem); line-height: 1.5; font-weight: 700; text-align: center; overflow-wrap: anywhere; text-wrap: balance; text-shadow: 0 1px 4px #101522,0 0 12px #121a25; }
  #theme-simple .journal-card-meta { display: flex; align-items: baseline; gap: 8px; margin: 8px 4px 0; color: var(--simple-muted); font-size: .82rem; line-height: 1.5; }
  #theme-simple .journal-card-meta time { white-space: nowrap; font-variant-numeric: tabular-nums; }
  #theme-simple .journal-card-meta time + span::before { content: '·'; margin-right: 8px; }
  @media (hover:hover) {
    #theme-simple .journal-card:hover .journal-art::before, #theme-simple .journal-card:hover .journal-cover { filter: none; }
    #theme-simple .journal-card:hover .journal-art::after { opacity: .72; }
  }
  #theme-simple .journal-card:focus-visible .journal-art::before, #theme-simple .journal-card:focus-visible .journal-cover { filter: none; }
  #theme-simple .journal-card:focus-visible .journal-art::after { opacity: .72; }
  #theme-simple :is(.journal-track a,.journal-rail-tools button,.journal-notice summary,.journal-toc summary,.journal-month a,.journal-topics a,.journal-topics button):focus-visible { outline: 2px solid var(--simple-primary); outline-offset: 2px; }
  #theme-simple .journal-masthead { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: min(var(--simple-page-width),calc(100% - 48px)); margin: 14px auto; }
  #theme-simple .journal-masthead a:first-child { color: var(--simple-text); font-size: 1.1rem; font-weight: 750; }
  #theme-simple .journal-masthead a:last-child { color: var(--simple-primary-deep); font-size: .9rem; }
  #theme-simple .journal-reading { width: min(100%,64rem); margin-inline: auto; }
  #theme-simple .journal-reading-wide, #theme-simple .journal-reading-wide #article-wrapper { width: 100%; max-width: 100%; }
  #theme-simple .journal-article-heading { max-width: 53rem; margin: 0 auto 22px; padding: 12px 5px 0; text-align: center; }
  #theme-simple .journal-article-category { color: var(--simple-primary-deep); font-size: .88rem; font-weight: 650; }
  #theme-simple .journal-article-heading h1 { margin: 8px 0 12px; font-size: clamp(1.65rem,3.4vw,2.8rem); line-height: 1.26; font-weight: 750; color: var(--simple-text); text-wrap: balance; overflow-wrap: anywhere; }
  #theme-simple .journal-byline { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; gap: 3px 14px; color: var(--simple-muted); font-size: .84rem; }
  #theme-simple .journal-byline a:hover, #theme-simple .journal-month a:hover { text-decoration: underline; text-underline-offset: 3px; }
  #theme-simple .journal-toc { max-width: 47rem; margin: 0 auto 18px; }
  #theme-simple .journal-toc nav { display: grid; gap: 4px; padding: 0 18px 14px; }
  #theme-simple .journal-toc a { color: var(--simple-primary-deep); line-height: 1.6; }
  #theme-simple .journal-reading #article-wrapper { padding: clamp(18px,3.5vw,48px); }
  #theme-simple .journal-reading .notion-page { width: 100%; max-width: 100%; min-width: 0; }
  #theme-simple .journal-reading .notion-page > :is(.notion-text,.notion-list,.notion-quote,.notion-callout,.notion-toggle,.notion-divider) {
    width: 100%; max-width: 47rem; margin-inline: auto;
  }
  #theme-simple .journal-reading .notion-page > .notion-h { width: 100%; margin-inline: 0; }
  #theme-simple .journal-reading :is(.notion-text,.notion-list) { line-height: 1.93; overflow-wrap: break-word; }
  #theme-simple .journal-reading .notion-h { scroll-margin-top: 28px; }
  #theme-simple .journal-reading .notion-simple-table {
    display: block; width: fit-content; max-width: 100%; min-width: 0; overflow-x: auto;
    overscroll-behavior-x: contain; margin-inline: auto; scrollbar-width: thin;
  }
  #theme-simple .journal-reading .notion-simple-table:has(tr > :nth-child(5)) :is(td,th) { min-width: 6rem; }
  #theme-simple .journal-reading .notion-simple-table :is(td,th) { padding: 8px 12px; }
  #theme-simple .journal-reading .notion-asset-wrapper-image { max-width: 100%; margin-inline: auto; }
  #theme-simple .journal-reading .notion-asset-wrapper-image img { max-width: 100%; }
  #theme-simple .journal-archive, #theme-simple .journal-topics { width: min(100%,63rem); margin: 0 auto; }
  #theme-simple .journal-archive-heading { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin: 0 0 22px; }
  #theme-simple :is(.journal-archive,.journal-topics) h1 { font-size: clamp(1.65rem,3vw,2.4rem); line-height: 1.3; font-weight: 740; color: var(--simple-text); }
  #theme-simple .journal-archive-heading p, #theme-simple .journal-archive-heading label, #theme-simple .journal-month small { color: var(--simple-muted); font-size: .86rem; font-weight: 450; }
  #theme-simple .journal-archive-heading select { padding: 6px 10px; color: var(--simple-text); background: var(--simple-card-solid); border: 1px solid var(--simple-border); border-radius: 6px; }
  #theme-simple .journal-month { margin: 0 0 28px; }
  #theme-simple .journal-month h2 { margin-bottom: 6px; scroll-margin-top: 14px; font-size: 1.35rem; font-weight: 700; }
  #theme-simple .journal-month ul { list-style: none; margin: 0; padding: 4px 14px; border: 1px solid var(--simple-border); border-radius: 12px; background: var(--simple-card); }
  #theme-simple .journal-month li { display: grid; grid-template-columns: 3.4em minmax(0,1fr) auto; align-items: baseline; gap: 12px; padding: 10px 0; overflow-wrap: anywhere; }
  #theme-simple .journal-month li + li { border-top: 1px solid var(--simple-border); }
  #theme-simple .journal-month time, #theme-simple .journal-archive-category { font-size: .82rem; color: var(--simple-muted); font-variant-numeric: tabular-nums; }
  #theme-simple .journal-topic-categories, #theme-simple .journal-tags > div { display: flex; flex-wrap: wrap; gap: 8px 16px; }
  #theme-simple .journal-topic-categories { margin: 16px 0; padding-bottom: 14px; border-bottom: 1px solid var(--simple-border); }
  #theme-simple .journal-topics :is(.journal-topic-categories,.journal-tags) :is(button,a) {
    display: inline-flex; align-items: baseline; padding: 8px 10px; min-height: 40px;
    border-radius: 8px; color: var(--simple-text); text-align: start;
  }
  #theme-simple .journal-topics :is(button,a):hover, #theme-simple .journal-topics button[aria-pressed=true] {
    color: var(--simple-primary-deep); background: var(--simple-faint);
  }
  #theme-simple .journal-topics button[aria-pressed=true] { box-shadow: inset 0 0 0 1px var(--simple-border); }
  #theme-simple .journal-tags { padding: 16px; border: 1px solid var(--simple-border); border-radius: 16px; background: var(--simple-card); }
  #theme-simple .journal-tags h2, #theme-simple .journal-topic-results h2 { font-weight: 700; margin-bottom: 8px; }
  #theme-simple .journal-topic-results { margin-top: 24px; }
  #theme-simple .journal-topic-results small { color: var(--simple-muted); font-weight: 450; }
  @media (max-width: 900px) { #theme-simple .journal-track { grid-auto-columns: 44%; } }
  @media (max-width: 640px) {
    #theme-simple :is(.simple-nav-with-categories) .simple-category-nav { display: flex; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; }
    #theme-simple .simple-category-nav a { white-space: nowrap; padding-inline: 9px; }
    #theme-simple .journal-track { grid-auto-columns: 84%; }
    #theme-simple .journal-card-title { font-size: 1.1rem; }
    #theme-simple .journal-arrows button { width: 40px; height: 40px; }
    #theme-simple .journal-masthead { width: calc(100% - 28px); }
    #theme-simple .journal-month li { gap: 6px; }
  }
  #theme-simple {
    --journal-glass: rgba(249, 252, 255, .72);
    --journal-glass-panel: rgba(248, 251, 254, .94);
    --journal-rim: rgba(255, 255, 255, .82);
  }
  .dark #theme-simple {
    --journal-glass: rgba(37, 45, 57, .64);
    --journal-glass-panel: rgba(36, 44, 55, .95);
    --journal-rim: rgba(218, 234, 255, .15);
  }
  #theme-simple .journal-nav {
    position: sticky; top: max(8px, env(safe-area-inset-top)); z-index: 40;
    display: flex; align-items: center; gap: 8px; align-self: center;
    width: fit-content; max-width: calc(100% - 28px); min-height: 48px; padding: 4px 7px;
    border: 1px solid var(--journal-rim); border-radius: 999px;
    background: var(--journal-glass); color: var(--simple-text);
    -webkit-backdrop-filter: saturate(145%) blur(18px); backdrop-filter: saturate(145%) blur(18px);
    box-shadow: 0 5px 19px rgba(26, 48, 74, .14), inset 0 1px 0 var(--journal-rim);
  }
  #theme-simple :is(.journal-nav-desktop,.journal-nav-links) { display: flex; align-items: center; gap: 2px; }
  #theme-simple .journal-nav :is(a,summary,.journal-nav-search) {
    display: flex; justify-content: center; align-items: center; gap: 8px;
    padding: 9px 14px; border-radius: 99px; min-height: 40px; font-size: .92rem;
    white-space: nowrap; color: inherit; text-decoration: none; cursor: pointer; line-height: 1.35;
  }
  #theme-simple .journal-nav summary { list-style: none; }
  #theme-simple .journal-nav summary::-webkit-details-marker { display: none; }
  #theme-simple .journal-nav :is(a,summary,button):is(:hover,:focus-visible),
  #theme-simple .journal-nav [aria-current=page], #theme-simple .journal-nav-group[open] > summary {
    background: var(--simple-faint); color: var(--simple-primary-deep);
  }
  #theme-simple .journal-nav .journal-nav-search { width: 40px; padding: 0; }
  #theme-simple .journal-nav form { width: min(22rem,65vw); }
  #theme-simple .journal-nav input { width: 100%; padding: 8px 14px; border-radius: 99px; background: transparent; color: inherit; }
  #theme-simple .journal-nav-group { position: relative; }
  #theme-simple .journal-nav-popover {
    position: absolute; z-index: 1; top: calc(100% + 8px); right: 0; min-width: 12rem;
    max-height: min(64vh,30rem); overflow-y: auto; padding: 6px; border-radius: 17px; border: 1px solid var(--simple-border);
    background: var(--journal-glass-panel); box-shadow: var(--simple-shadow-soft);
  }
  #theme-simple .journal-nav-popover :is(a,summary) { justify-content: flex-start; border-radius: 11px; }
  #theme-simple .journal-nav-popover .journal-nav-popover { position: static; margin-left: 12px; border: 0; box-shadow: none; background: none; min-width: 0; }
  #theme-simple .journal-nav-mobile { display: none; }
  #theme-simple .journal-masthead a:only-child { color: var(--simple-text); font-size: 1.12rem; }
  #theme-simple .journal-rail-viewport { position: relative; min-width: 0; }
  #theme-simple .journal-track { padding-bottom: 12px; scrollbar-width: none; }
  #theme-simple .journal-track::-webkit-scrollbar { display: none; }
  #theme-simple .journal-arrows { position: absolute; inset: 0; pointer-events: none; }
  #theme-simple .journal-arrows button {
    position: absolute; top: calc(50% - 17px); transform: translateY(-50%); pointer-events: auto;
    width: clamp(39px,3.5vw,50px); height: clamp(39px,3.5vw,50px); border: 1px solid rgba(255,255,255,.42);
    background: rgba(29,42,58,.74); color: white; box-shadow: 0 3px 12px #08162644;
    -webkit-backdrop-filter: blur(7px); backdrop-filter: blur(7px);
    transition: background .18s ease, box-shadow .18s ease; touch-action: manipulation;
  }
  #theme-simple .journal-arrows button:first-child { left: 9px; }
  #theme-simple .journal-arrows button:last-child { right: clamp(12px,2.4vw,32px); }
  #theme-simple .journal-arrows button span { transform: translateY(-.07em); }
  #theme-simple .journal-arrows button:disabled { visibility: hidden; pointer-events: none; }
  #theme-simple .journal-arrows button:hover { background: #283c52; }
  #theme-simple .journal-art { box-shadow: 0 5px 12px rgba(40,61,82,.19),0 1px 3px rgba(40,61,82,.12); }
  .dark #theme-simple .journal-art { box-shadow: 0 2px 6px #060a1233; }
  #theme-simple .journal-art::before, #theme-simple .journal-art > .journal-cover {
    inset: -12px; width: calc(100% + 24px); height: calc(100% + 24px);
    filter: blur(8px) saturate(.70); transition: filter .38s cubic-bezier(.22,.75,.25,1);
  }
  #theme-simple .journal-art::after, #theme-simple .journal-art:not(:has(> .journal-cover:not([hidden])))::after {
    background: linear-gradient(150deg,rgba(211,228,244,.26),rgba(31,48,68,.58) 55%,rgba(16,27,39,.63));
    transition: opacity .35s ease;
  }
  .dark #theme-simple .journal-art::after { background: linear-gradient(140deg,rgba(152,174,203,.26),rgba(28,39,60,.66)); }
  #theme-simple .journal-card-title { text-shadow: 0 2px 5px #071327,0 0 13px #111c2d; }
  @keyframes journal-title-spring {
    0% { transform: translateY(0) scale(1); }
    46% { transform: translateY(-4px) scale(1.065); }
    72% { transform: translateY(1px) scale(1.012); }
    100% { transform: translateY(-1px) scale(1.035); }
  }
  @media (hover:hover) and (pointer:fine) {
    #theme-simple .journal-card:hover .journal-cover { filter: none; }
    #theme-simple .journal-card:hover .journal-art::before { filter: none; }
    #theme-simple .journal-card:hover .journal-art::after { opacity: .28; }
    #theme-simple .journal-card:hover .journal-card-title { animation: journal-title-spring .5s both; }
  }
  #theme-simple .journal-card:focus-visible .journal-art::after { opacity: .28; }
  #theme-simple .journal-card:focus-visible .journal-card-title { animation: journal-title-spring .5s both; }
  #theme-simple .journal-reading .notion-h, #theme-simple .journal-reading .notion-h > [id],
  #theme-simple .journal-month h2 { scroll-margin-top: 80px; }
  #theme-simple .journal-reading .notion-header-anchor { scroll-margin-top: 22px; }
  #theme-simple .journal-toc-dock {
    position: fixed; z-index: 35; right: max(10px,env(safe-area-inset-right)); top: clamp(80px,30vh,19rem);
    display: flex; flex-direction: row-reverse; align-items: flex-start;
  }
  #theme-simple .journal-toc-dock > button, #theme-simple .journal-toc-list {
    color: var(--simple-text); border: 1px solid var(--simple-border); box-shadow: var(--simple-shadow-soft);
    background: var(--journal-glass-panel);
  }
  #theme-simple .journal-toc-dock > button {
    display: grid; justify-items: center; gap: 3px; padding: 10px 8px; border-radius: 14px;
    color: var(--simple-primary-deep); font-size: .72rem; line-height: 1.3;
  }
  #theme-simple .journal-toc-list:not([hidden]) { display: block; }
  #theme-simple .journal-toc-list {
    width: min(19rem,calc(100vw - 70px)); max-height: min(60vh,30rem); overflow: auto; overscroll-behavior: contain;
    padding: 9px; border-radius: 15px; scrollbar-width: thin;
  }
  #theme-simple .journal-toc-list h2 { margin: 4px 10px 8px; font-size: 1rem; font-weight: 700; }
  #theme-simple .journal-toc-list small { color: var(--simple-muted); font-weight: 450; }
  #theme-simple .journal-toc-list a { display: block; padding: 7px 10px; border-radius: 7px; font-size: .88rem; line-height: 1.45; overflow-wrap: anywhere; }
  #theme-simple .journal-toc-list a:is(:hover,[aria-current=location]) { color: var(--simple-primary-deep); background: var(--simple-faint); }
  #theme-simple .journal-page-heading { margin: clamp(12px,3vw,40px) 0 25px; }
  #theme-simple .journal-page-heading h1 { font-size: clamp(2.15rem,5vw,3.65rem); line-height: 1.15; font-weight: 760; color: var(--simple-text); }
  #theme-simple .journal-page-heading p { margin-top: 12px; color: var(--simple-muted); }
  #theme-simple .journal-topics { width: min(100%,74rem); }
  #theme-simple .journal-topic-categories { justify-content: center; gap: 4px clamp(9px,2vw,32px); margin: 0 0 24px; }
  #theme-simple .journal-topics .journal-topic-categories :is(a,button) { align-items: center; gap: 6px; font-size: clamp(1rem,1.65vw,1.35rem); }
  #theme-simple .journal-topic-categories sup { margin: 0; align-self: flex-start; top: 0; }
  #theme-simple .journal-tag-cloud {
    min-width: 0; border: 1px solid var(--simple-border); border-radius: 23px;
    background: var(--simple-card); padding: 16px 0; overflow: hidden;
  }
  #theme-simple .journal-tag-cloud header { display: flex; align-items: center; justify-content: space-between; padding: 0 20px 8px; color: var(--simple-muted); }
  #theme-simple .journal-tag-cloud > p { padding-inline: 20px; }
  #theme-simple .journal-tag-cloud .journal-motion-toggle { display: none; font-size: .82rem; padding: 4px 8px; }
  #theme-simple .journal-tag-cloud:has([data-roll]) .journal-motion-toggle { display: block; }
  #theme-simple .journal-tag-lane { overflow: auto hidden; scrollbar-width: none; }
  #theme-simple .journal-tag-lane::-webkit-scrollbar { display: none; }
  #theme-simple .journal-tag-track { display: flex; width: max-content; max-width: none; }
  #theme-simple .journal-tag-segment { display: flex; flex: none; align-items: center; gap: 16px; padding-inline: 8px; }
  #theme-simple .journal-tag-segment :is(a,button) { white-space: nowrap; color: var(--simple-text); padding: 9px 10px; border-radius: 8px; line-height: 1.5; }
  #theme-simple .journal-tag-segment sup { top: -.45em; }
  @keyframes journal-labels { to { transform: translateX(var(--tag-shift)); } }
  @media (prefers-reduced-motion: no-preference) {
    #theme-simple .journal-tag-lane[data-roll] { overflow: hidden; mask-image: linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent); }
    #theme-simple .journal-tag-lane[data-roll] .journal-tag-track { animation: journal-labels var(--tag-duration) linear infinite; animation-play-state: paused; }
    #theme-simple .journal-tag-cloud[data-visible]:not([data-still],:hover,:focus-within) .journal-tag-lane[data-roll] .journal-tag-track { animation-play-state: running; }
  }
  #theme-simple .journal-tag-cloud:is([data-still],:has(:focus-visible)) .journal-tag-lane { mask-image: none; }
  #theme-simple .journal-tag-cloud:is([data-still],:has(:focus-visible)) .journal-tag-lane .journal-tag-track { animation: none; width: 100%; }
  #theme-simple .journal-tag-cloud:is([data-still],:has(:focus-visible)) .journal-tag-segment { flex-wrap: wrap; width: 100%; gap: 4px 16px; }
  #theme-simple .journal-tag-cloud:is([data-still],:has(:focus-visible)) [aria-hidden=true] { display: none; }
  #theme-simple .journal-topic-results { margin-top: 32px; }
  #theme-simple .journal-say { width: min(100%,53rem); margin: 0 auto; }
  #theme-simple .journal-say-feed { margin: 0; padding: 0; list-style: none; }
  #theme-simple .journal-say-feed li { margin: 0 0 20px; scroll-margin-top: 86px; }
  #theme-simple .journal-say-feed h2 { font-size: 1.45rem; font-weight: 710; margin: 24px 0 14px; }
  #theme-simple .journal-say-feed article { display: grid; grid-template-columns: minmax(54px,5.5rem) minmax(0,1fr); gap: 10px; }
  #theme-simple .journal-say-feed time { color: var(--simple-muted); padding-top: 13px; font-size: .9rem; font-variant-numeric: tabular-nums; }
  #theme-simple .journal-say-feed time span { display: block; font-size: .8em; }
  #theme-simple :is(.journal-say-bubble,.journal-say-empty) { background: var(--simple-card); padding: clamp(16px,3vw,28px); border: 1px solid var(--simple-border); border-radius: 5px 22px 22px; }
  #theme-simple .journal-say-bubble p { white-space: pre-line; line-height: 1.8; overflow-wrap: anywhere; }
  #theme-simple .journal-say-bubble figure { margin: 12px 0 0; }
  #theme-simple .journal-say-bubble img { max-width: 100%; max-height: 28rem; object-fit: contain; border-radius: 12px; }
  #theme-simple .journal-say-bubble figcaption { margin-top: 4px; color: var(--simple-muted); font-size: .82rem; }
  #theme-simple .journal-say-bubble > a { display: inline-block; margin-top: 10px; color: var(--simple-primary-deep); font-size: .85rem; }
  #theme-simple .journal-topic-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    align-items: start; gap: clamp(18px, 2.4vw, 34px); padding: 0; margin: 18px 0 0; list-style: none;
  }
  #theme-simple .journal-topic-grid li { min-width: 0; }
  #theme-simple .journal-topic-grid .journal-card { display: block; padding: 0; background: transparent; }
  #theme-simple .journal-title-icon { display: inline-block; margin-inline-end: .32em; line-height: 1; vertical-align: -.08em; }
  #theme-simple .journal-title-icon :is(img,span) { margin: 0; }
  #theme-simple .journal-title-icon img { display: inline-block; width: 1.16em !important; height: 1.16em !important; object-fit: contain; vertical-align: -.08em; }
  #theme-simple .journal-nav-extra { display: none; }
  @media (min-width: 1100px) {
    #theme-simple .journal-nav { padding-inline: 12px; }
    #theme-simple .journal-nav-extra { display: contents; }
    #theme-simple .journal-nav-overflow:not([data-extra]), #theme-simple .journal-nav-overflow .journal-nav-compact-only { display: none; }
  }
  #theme-simple .journal-say-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
  #theme-simple .journal-say-actions button {
    display: inline-flex; align-items: center; gap: .42em; padding: 6px 10px; border-radius: 99px;
    color: var(--simple-primary-deep); background: var(--simple-faint); font-size: .85rem;
  }
  #theme-simple .journal-say-comments { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--simple-border); }
  #theme-simple .journal-say-comments > p { color: var(--simple-muted); }
  #theme-simple .journal-say-feed [id^='comments-'] { scroll-margin-top: 6rem; }
  #theme-simple .journal-say-feed .journal-say-bubble { min-width: 0; }
  #theme-simple .journal-say-empty { color: var(--simple-muted); }
  #theme-simple :is(.journal-nav,.journal-toc-dock,.journal-tag-cloud,.journal-arrows) :is(a,summary,button):focus-visible { outline: 2px solid var(--simple-primary); outline-offset: 2px; }
  @keyframes journal-arrive {
    from { opacity: .12; transform: translateY(24px) scale(.975); }
    to { opacity: 1; transform: none; }
  }
  @keyframes journal-cover-open { from { transform: scale(1.10); } to { transform: scale(1.018); } }
  #theme-simple .journal-route-progress {
    position: fixed; top: 0; left: 0; z-index: 85; height: 3px; width: 90%;
    transform-origin: left; background: var(--simple-primary); pointer-events: none;
  }
  @keyframes journal-route-load { from { transform: scaleX(.04); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: no-preference) {
    #theme-simple .journal-route-progress { animation: journal-route-load 2.8s cubic-bezier(.12,.78,.22,1) both; }
    #theme-simple header.h-80.simple-home-header { animation: none; }
    #theme-simple header.simple-home-header[data-arrived]::before { animation: journal-cover-open 1.15s cubic-bezier(.16,1,.3,1) backwards; }
    #theme-simple header.h-80.simple-home-header[data-arrived] > :is(div,aside),
    #theme-simple :is(.simple-home .journal-notice,.simple-home .simple-home-panel,.journal-page-heading,.journal-article-heading,.journal-archive-heading) {
      animation: journal-arrive .78s cubic-bezier(.16,.84,.23,1) backwards;
    }
    #theme-simple header.h-80.simple-home-header[data-arrived] > div { animation-delay: .12s; }
    #theme-simple .simple-home .journal-notice { animation-delay: .14s; }
    #theme-simple .simple-home .simple-home-panel { animation-delay: .22s; }
    #theme-simple .journal-rail[data-reveal=pending]:not(:focus-within) :is(.journal-row-heading,.journal-track > li) { opacity: 0; }
    #theme-simple .journal-rail[data-reveal=in] :is(.journal-row-heading,.journal-track > li) {
      animation: journal-arrive .7s cubic-bezier(.16,.84,.23,1) backwards;
      animation-delay: calc(var(--card-index,0) * 55ms);
    }
  }
  @media (max-width: 640px) {
    #theme-simple .journal-nav { align-self: stretch; width: auto; margin-inline: 14px; justify-content: space-between; }
    #theme-simple .journal-nav-desktop { display: none; }
    #theme-simple .journal-nav-mobile { display: block; }
    #theme-simple .journal-nav-mobile > .journal-nav-popover { right: auto; left: 0; width: min(16rem,calc(100vw - 44px)); }
    #theme-simple .journal-toc-dock { right: 4px; }
    #theme-simple .journal-toc-dock > button { padding: 8px 5px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #theme-simple .journal-tag-cloud:has([data-roll]) .journal-motion-toggle, #theme-simple .journal-tag-segment[aria-hidden=true] { display: none; }
    #theme-simple .journal-tag-track { width: 100%; }
    #theme-simple .journal-tag-segment { width: 100%; flex-wrap: wrap; gap: 4px 16px; }
  }
  #theme-simple[data-lite] :is(.journal-tag-track,.journal-card-title,.simple-home-panel,.journal-notice,.journal-row-heading,.journal-track > li,.journal-route-progress),
  #theme-simple[data-lite] header.simple-home-header[data-arrived] > *, #theme-simple[data-lite] header.simple-home-header[data-arrived]::before { animation: none !important; opacity: 1 !important; }
  #theme-simple[data-lite] .journal-tag-lane { overflow: auto; mask-image: none; }
  #theme-simple[data-lite] .journal-tag-segment[aria-hidden=true], #theme-simple[data-lite] .journal-motion-toggle { display: none !important; }
  @media (prefers-reduced-motion: reduce) {
    #theme-simple,
    #theme-simple *,
    #theme-simple *::before,
    #theme-simple *::after,
    #theme-simple::before,
    #theme-simple::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }

    #theme-simple header.h-80::before {
      transform: scale(1.018) !important;
    }

    #theme-simple header.h-80::after,
    #theme-simple header.h-80 > div {
      opacity: 1 !important;
      filter: none !important;
      transform: none !important;
    }
  }
  `}</style>
}

export { Style }
