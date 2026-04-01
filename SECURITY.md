# Security Policy

## Supported Versions

We provide security fixes for the **latest deployed version** of the frontend site ([helmforge.dev](https://helmforge.dev)) and its primary `main` branch. Older commits are not actively backported.

## Reporting a Vulnerability

If you discover a security vulnerability in the HelmForge website, documentation portal, or any associated frontend component, please report it responsibly.

**Do not open a public GitHub issue for critical security vulnerabilities.**

Instead, use one of the following methods:

1. **GitHub Security Advisories** (preferred): [Report a vulnerability](https://github.com/helmforgedev/site/security/advisories/new)
2. **Email**: <helmforgedev@users.noreply.github.com>

### What to include

- Repository component affected (e.g., Astro framework, dependencies, XSS vectors)
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact (e.g., CSRF, Server-Side exposure, Supply Chain issue)

### Response timeline

- **Acknowledgment**: within 72 hours
- **Initial assessment**: within 7 days
- **Fix or mitigation**: best effort, typically within 30 days depending on severity

## Scope

This policy covers vulnerabilities in:

- The Astro JS frontend source code (`src/` components)
- Next-generation layout styling (Tailwind CSS)
- Dependencies listed in `package.json`
- GitHub Actions workflows (`.github/workflows`) used to build and deploy the site

This policy does **not** cover:

- Vulnerabilities in the actual Helm Charts (please report those to [github.com/helmforgedev/charts](https://github.com/helmforgedev/charts))
- Upstream Astro/Vite engine vulnerabilities beyond our control (report directly to Astro)

## Security Best Practices

When contributing to this frontend repository:

- Run `npm audit` frequently to check for vulnerable dependencies.
- Ensure no sensitive information, credentials, or API keys are committed to the codebase.
- Avoid injecting raw HTML (`set:html`) unless absolutely necessary, and strictly sanitize data.
- Enforce strict Content Security Policies in staging and production.
