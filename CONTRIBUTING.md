# Contributing to HelmForge Site

Thanks for contributing to the HelmForge public website and documentation repository.

## Flow
1. Check out main and pull the latest changes: git checkout main and git pull --ff-only origin main
2. Create your branch: git checkout -b feat/my-new-feature
3. Make changes and validate locally via 
pm run dev (http://localhost:4321).
4. Commit using Conventional Commits.
5. Push to origin and open a Pull Request targeting main.

## Adding or Updating Charts
When adding a new chart to the HelmForge catalog:
1. Ensure the chart is already published in the helm repository.
2. Edit src/components/ChartGrid.astro and insert the new chart in the array.
3. Supply an explicit icon: URL property if the default dashboard-icon isn't visually accurate.

## CSS and Accessibility
- Use the built-in Tailwind variables (e.g., 	ext-text-base, g-bg-surface) instead of hardcoded raw colors.
- Always check that your layouts work seamlessly in **Light Mode**.
