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

  @keyframes simple-hero-drift {
    0% {
      transform: scale(1.018) translate3d(0, 0, 0);
    }
    50% {
      transform: scale(1.045) translate3d(-10px, 6px, 0);
    }
    100% {
      transform: scale(1.018) translate3d(0, 0, 0);
    }
  }

  @keyframes simple-aurora {
    0% {
      transform: translate3d(-6%, -4%, 0) rotate(0deg);
      opacity: 0.72;
    }
    50% {
      transform: translate3d(6%, 3%, 0) rotate(8deg);
      opacity: 0.95;
    }
    100% {
      transform: translate3d(-6%, -4%, 0) rotate(0deg);
      opacity: 0.72;
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
    filter: blur(38px);
    animation: simple-aurora 18s ease-in-out infinite;
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
    animation: simple-hero-drift 24s ease-in-out infinite;
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

  #theme-simple nav.w-full {
    width: min(var(--simple-page-width), calc(100vw - 48px));
    margin: 0 auto;
    border: 1px solid var(--simple-border) !important;
    border-radius: 999px;
    background: var(--simple-card) !important;
    box-shadow: var(--simple-shadow-soft);
    backdrop-filter: blur(18px);
    animation: simple-fade-up 0.72s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      transform 0.22s ease;
  }

  #theme-simple nav.w-full:hover {
    animation: none;
    border-color: rgba(47, 111, 159, 0.50) !important;
    box-shadow:
      0 16px 36px var(--simple-glow),
      0 0 0 1px rgba(47, 111, 159, 0.12);
    transform: translateY(-2px);
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
      transform 0.24s ease,
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
    animation: none;
    transform: translateY(-5px);
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
      box-shadow 0.22s ease,
      transform 0.22s ease;
  }

  #theme-simple #right-sidebar > *:hover {
    animation: none;
    border-color: rgba(47, 111, 159, 0.52);
    background:
      linear-gradient(135deg, var(--simple-hover-surface), transparent 42%),
      var(--simple-card);
    box-shadow:
      0 16px 36px var(--simple-glow),
      0 0 0 1px rgba(47, 111, 159, 0.10);
    transform: translateY(-3px);
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

  #theme-simple #article-wrapper .notion-green,
  #theme-simple #article-wrapper .notion-green_co {
    color: #047857 !important;
    font-weight: 700;
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

  .dark #theme-simple #article-wrapper .notion-gray {
    color: #d5deea !important;
  }

  .dark #theme-simple #article-wrapper .notion-brown {
    color: #d8b58a !important;
  }

  .dark #theme-simple #article-wrapper .notion-orange {
    color: #ffbf80 !important;
  }

  .dark #theme-simple #article-wrapper .notion-yellow {
    color: #f6d77a !important;
  }

  .dark #theme-simple #article-wrapper .notion-green,
  .dark #theme-simple #article-wrapper .notion-green_co {
    color: #86efac !important;
    font-weight: 700;
  }

  .dark #theme-simple #article-wrapper .notion-blue {
    color: #8bd9ff !important;
  }

  .dark #theme-simple #article-wrapper .notion-purple {
    color: #d9b8ff !important;
  }

  .dark #theme-simple #article-wrapper .notion-pink {
    color: #ffadd7 !important;
  }

  .dark #theme-simple #article-wrapper .notion-red {
    color: #ff8585 !important;
  }

  .dark #theme-simple #article-wrapper :is(
    .notion-gray,
    .notion-brown,
    .notion-orange,
    .notion-yellow,
    .notion-green,
    .notion-green_co,
    .notion-blue,
    .notion-purple,
    .notion-pink,
    .notion-red
  ) {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.08),
      0 1px 1px rgba(0, 0, 0, 0.52);
  }

  .dark #theme-simple #article-wrapper .notion-blue::selection,
  .dark #theme-simple #article-wrapper .notion-purple::selection,
  .dark #theme-simple #article-wrapper .notion-red::selection,
  .dark #theme-simple #article-wrapper .notion-green::selection,
  .dark #theme-simple #article-wrapper .notion-green_co::selection {
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

  @media (prefers-reduced-motion: reduce) {
    #theme-simple,
    #theme-simple *,
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
